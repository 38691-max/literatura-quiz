import { DEFAULT_QUESTIONS } from "../data/defaultQuestions";

const STORAGE_KEYS = {
  QUESTIONS: "literatura_quiz_questions_v1",
  HISTORY: "literatura_quiz_history_v1",
  ACTIVE_QUIZ: "literatura_quiz_active_v1",
  THEME: "literatura_quiz_theme_v1"
};

// Carregar questões salvas ou carregar padrão
export function loadQuestions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      saveQuestions(DEFAULT_QUESTIONS);
      return DEFAULT_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveQuestions(DEFAULT_QUESTIONS);
    return DEFAULT_QUESTIONS;
  } catch (e) {
    console.error("Erro ao carregar questões do localStorage:", e);
    return DEFAULT_QUESTIONS;
  }
}

export function saveQuestions(questions) {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (e) {
    console.error("Erro ao salvar questões:", e);
  }
}

// Histórico de Quizzes
export function loadQuizHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      // Criar 2 tentativas de exemplo para que o gráfico de desempenho e a tela de início fiquem vivos imediatamente
      const initialHistory = [
        {
          id: "hist-1",
          date: "2026-09-28T16:30:00.000Z",
          totalQuestions: 5,
          correctAnswers: 4,
          incorrectAnswers: 1,
          unanswered: 0,
          percentage: 80,
          questionIds: ["q-1", "q-2", "q-3", "q-5", "q-6"],
          userAnswers: { "q-1": "B", "q-2": "A", "q-3": "C", "q-5": "C", "q-6": "C" }, // q-6 era B, errou
          timeSpentSeconds: 240,
          label: "Simulado 1 — Romantismo e Realismo"
        },
        {
          id: "hist-2",
          date: "2026-10-02T19:15:00.000Z",
          totalQuestions: 6,
          correctAnswers: 5,
          incorrectAnswers: 1,
          unanswered: 0,
          percentage: 83.3,
          questionIds: ["q-3", "q-4", "q-8", "q-9", "q-11", "q-12"],
          userAnswers: { "q-3": "C", "q-4": "D", "q-8": "B", "q-9": "B", "q-11": "B", "q-12": "C" }, // q-4 era B, errou
          timeSpentSeconds: 310,
          label: "Simulado 2 — Modernismo e Classicismo"
        }
      ];
      saveQuizHistory(initialHistory);
      return initialHistory;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Erro ao carregar histórico:", e);
    return [];
  }
}

export function saveQuizHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error("Erro ao salvar histórico:", e);
  }
}

// Salvar resultado de um quiz recém-terminado
export function recordQuizResult(quizData, questionsList) {
  const history = loadQuizHistory();
  const newEntry = {
    id: "hist-" + Date.now(),
    date: new Date().toISOString(),
    totalQuestions: quizData.total,
    correctAnswers: quizData.correct,
    incorrectAnswers: quizData.incorrect,
    unanswered: quizData.unanswered,
    percentage: Math.round((quizData.correct / quizData.total) * 100 * 10) / 10,
    questionIds: quizData.questionIds,
    userAnswers: quizData.userAnswers,
    timeSpentSeconds: quizData.timeSpentSeconds || 0,
    label: quizData.label || `Questionário #${history.length + 1}`
  };

  const updatedHistory = [newEntry, ...history];
  saveQuizHistory(updatedHistory);

  // Atualizar contadores individuais das questões
  const currentQuestions = loadQuestions();
  const updatedQuestions = currentQuestions.map(q => {
    if (quizData.questionIds.includes(q.id)) {
      const userAnswer = quizData.userAnswers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      const isIncorrect = userAnswer && !isCorrect;

      return {
        ...q,
        timesAnswered: (q.timesAnswered || 0) + (userAnswer ? 1 : 0),
        timesCorrect: (q.timesCorrect || 0) + (isCorrect ? 1 : 0),
        timesIncorrect: (q.timesIncorrect || 0) + (isIncorrect ? 1 : 0),
        lastAnsweredAt: new Date().toISOString(),
        needsReview: isIncorrect ? true : q.needsReview
      };
    }
    return q;
  });

  saveQuestions(updatedQuestions);
  return { updatedHistory, updatedQuestions, newEntry };
}

// Active Quiz state (para restaurar caso feche a aba sem querer)
export function saveActiveQuiz(state) {
  try {
    if (!state) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_QUIZ);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_QUIZ, JSON.stringify(state));
    }
  } catch (e) {
    console.error("Erro ao salvar quiz ativo:", e);
  }
}

export function loadActiveQuiz() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_QUIZ);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Estatísticas globais
export function calculateOverallStats(questions, history) {
  const totalQuestions = questions.length;
  
  let totalAnsweredTimes = 0;
  let totalCorrectTimes = 0;
  let totalIncorrectTimes = 0;

  questions.forEach(q => {
    totalAnsweredTimes += q.timesAnswered || 0;
    totalCorrectTimes += q.timesCorrect || 0;
    totalIncorrectTimes += q.timesIncorrect || 0;
  });

  const overallAccuracy = totalAnsweredTimes > 0
    ? Math.round((totalCorrectTimes / totalAnsweredTimes) * 100)
    : 0;

  // Melhores e piores questionários do histórico
  let bestQuiz = null;
  let worstQuiz = null;
  let averageScore = 0;

  if (history && history.length > 0) {
    const sorted = [...history].sort((a, b) => b.percentage - a.percentage);
    bestQuiz = sorted[0];
    worstQuiz = sorted[sorted.length - 1];
    const sum = history.reduce((acc, h) => acc + h.percentage, 0);
    averageScore = Math.round((sum / history.length) * 10) / 10;
  }

  // Desempenho por Escola Literária
  const schoolMap = {};
  questions.forEach(q => {
    const school = q.school || "Outras";
    if (!schoolMap[school]) {
      schoolMap[school] = { total: 0, answered: 0, correct: 0, incorrect: 0 };
    }
    schoolMap[school].total += 1;
    schoolMap[school].answered += q.timesAnswered || 0;
    schoolMap[school].correct += q.timesCorrect || 0;
    schoolMap[school].incorrect += q.timesIncorrect || 0;
  });

  const schoolStats = Object.keys(schoolMap).map(school => {
    const d = schoolMap[school];
    const pct = d.answered > 0 ? Math.round((d.correct / d.answered) * 100) : null;
    return {
      school,
      total: d.total,
      answered: d.answered,
      correct: d.correct,
      incorrect: d.incorrect,
      percentage: pct !== null ? pct : 0,
      hasAnswers: d.answered > 0
    };
  }).sort((a, b) => b.answered - a.answered);

  return {
    totalQuestions,
    totalAnsweredTimes,
    totalCorrectTimes,
    totalIncorrectTimes,
    overallAccuracy,
    bestQuiz,
    worstQuiz,
    averageScore,
    schoolStats,
    completedQuizzesCount: history ? history.length : 0
  };
}

// Resetar para dados de fábrica
export function resetToDefaults() {
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_QUIZ);
  saveQuestions(DEFAULT_QUESTIONS);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
  return { questions: DEFAULT_QUESTIONS, history: loadQuizHistory() };
}

// Exportar todos os dados para download
export function exportDataAsJSON() {
  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    questions: loadQuestions(),
    history: loadQuizHistory()
  };
  return JSON.stringify(data, null, 2);
}

// Importar dados
export function importDataFromJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.questions)) {
      throw new Error("Formato de arquivo JSON inválido. A lista 'questions' é obrigatória.");
    }
    saveQuestions(parsed.questions);
    if (Array.isArray(parsed.history)) {
      saveQuizHistory(parsed.history);
    }
    return { success: true, count: parsed.questions.length };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
