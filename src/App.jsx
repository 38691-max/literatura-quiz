import React, { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { QuestionInput } from "./components/QuestionInput";
import { QuizRunner } from "./components/QuizRunner";
import { QuizResults } from "./components/QuizResults";
import { PerformanceView } from "./components/PerformanceView";
import { QuestionBank } from "./components/QuestionBank";
import { ReviewMode } from "./components/ReviewMode";
import { SettingsView } from "./components/SettingsView";
import { Toast } from "./components/Toast";
import {
  loadQuestions,
  saveQuestions,
  loadQuizHistory,
  recordQuizResult,
  calculateOverallStats,
  saveActiveQuiz,
  loadActiveQuiz
} from "./utils/storage";

export function App() {
  const [currentTab, setCurrentTab] = useState("inicio"); // inicio | questionarios | quiz | resultados | desempenho | banco | revisao | configuracoes
  const [questions, setQuestions] = useState(() => loadQuestions());
  const [history, setHistory] = useState(() => loadQuizHistory());
  const [activeQuizQuestions, setActiveQuizQuestions] = useState(null);
  const [currentQuizResult, setCurrentQuizResult] = useState(null);
  const [toast, setToast] = useState(null);

  // Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("literatura_quiz_theme") === "dark";
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("literatura_quiz_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("literatura_quiz_theme", "light");
    }
  }, [isDark]);

  const notify = (message, type = "info") => {
    setToast({ message, type });
  };

  // Estatísticas calculadas
  const stats = calculateOverallStats(questions, history);

  // Contagem de questões precisando de revisão
  const reviewCount = questions.filter((q) => q.needsReview || q.timesIncorrect > 0).length;

  // Iniciar um novo quiz padrão (10 questões aleatórias ou todas)
  const handleStartDefaultQuiz = () => {
    if (questions.length === 0) {
      notify("Nenhuma questão cadastrada para iniciar o simulado.", "error");
      return;
    }
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const count = Math.min(10, shuffled.length);
    setActiveQuizQuestions(shuffled.slice(0, count));
    setCurrentTab("quiz");
  };

  // Iniciar quiz com IDs específicos (ex: questões selecionadas, refazer erradas)
  const handleStartQuizWithIds = (ids) => {
    const selectedQuestions = ids
      .map((id) => questions.find((q) => q.id === id))
      .filter(Boolean);

    if (selectedQuestions.length === 0) {
      notify("Nenhuma questão válida encontrada para iniciar.", "error");
      return;
    }

    setActiveQuizQuestions(selectedQuestions);
    setCurrentTab("quiz");
  };

  // Iniciar quiz contendo apenas questões erradas
  const handleStartWrongOnlyQuiz = () => {
    const wrongQuestions = questions.filter(
      (q) => (q.timesIncorrect > 0 && q.needsReview) || q.timesIncorrect > q.timesCorrect
    );

    if (wrongQuestions.length === 0) {
      notify("Você não tem questões erradas pendentes!", "info");
      return;
    }

    setActiveQuizQuestions(wrongQuestions);
    setCurrentTab("quiz");
    notify(`Iniciando simulado de recuperação com ${wrongQuestions.length} questões erradas.`, "info");
  };

  // Salvar / Adicionar questão
  const handleSaveQuestion = (newOrUpdatedQuestion) => {
    setQuestions((prev) => {
      const existsIndex = prev.findIndex((q) => q.id === newOrUpdatedQuestion.id);
      let updated;
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = newOrUpdatedQuestion;
      } else {
        updated = [newOrUpdatedQuestion, ...prev];
      }
      saveQuestions(updated);
      return updated;
    });
  };

  // Excluir uma questão
  const handleDeleteQuestion = (id) => {
    setQuestions((prev) => {
      const updated = prev.filter((q) => q.id !== id);
      saveQuestions(updated);
      return updated;
    });
  };

  // Excluir múltiplas questões
  const handleDeleteMultipleQuestions = (ids) => {
    setQuestions((prev) => {
      const updated = prev.filter((q) => !ids.includes(q.id));
      saveQuestions(updated);
      return updated;
    });
  };

  // Duplicar questão
  const handleDuplicateQuestion = (question) => {
    const duplicated = {
      ...question,
      id: "q-" + Date.now(),
      statement: `${question.statement} (Cópia)`,
      timesAnswered: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      needsReview: false,
      createdAt: new Date().toISOString()
    };
    handleSaveQuestion(duplicated);
    notify("Questão duplicada com sucesso!", "success");
  };

  // Alternar marcação de revisão
  const handleToggleNeedsReview = (id, status) => {
    setQuestions((prev) => {
      const updated = prev.map((q) => {
        if (q.id === id) {
          return { ...q, needsReview: status !== undefined ? status : !q.needsReview };
        }
        return q;
      });
      saveQuestions(updated);
      return updated;
    });
  };

  // Finalizar Questionário (Correção Automática)
  const handleFinishQuiz = ({ userAnswers, timeSpentSeconds, total, questionIds }) => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    questionIds.forEach((qid) => {
      const q = questions.find((item) => item.id === qid);
      const userAns = userAnswers[qid];
      if (!userAns) {
        unanswered += 1;
      } else if (q && userAns === q.correctAnswer) {
        correct += 1;
      } else {
        incorrect += 1;
      }
    });

    const quizData = {
      total,
      correct,
      incorrect,
      unanswered,
      questionIds,
      userAnswers,
      timeSpentSeconds,
      label: `Simulado de Literatura (${correct}/${total})`
    };

    const result = recordQuizResult(quizData, questions);
    setHistory(result.updatedHistory);
    setQuestions(result.updatedQuestions);
    setCurrentQuizResult(result.newEntry);
    setActiveQuizQuestions(null);
    setCurrentTab("resultados");
  };

  // Cancelar Quiz
  const handleCancelQuiz = () => {
    setActiveQuizQuestions(null);
    setCurrentTab("questionarios");
  };

  // Resetar tudo para o padrão
  const handleResetAll = (data) => {
    setQuestions(data.questions);
    setHistory(data.history);
    setActiveQuizQuestions(null);
    setCurrentQuizResult(null);
    setCurrentTab("inicio");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Navbar Superior */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDark={isDark}
        setIsDark={setIsDark}
        questionsCount={questions.length}
        reviewCount={reviewCount}
        hasActiveQuiz={Boolean(activeQuizQuestions)}
        onStartNewQuiz={handleStartDefaultQuiz}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: INÍCIO */}
        {currentTab === "inicio" && (
          <Dashboard
            questions={questions}
            history={history}
            stats={stats}
            onNavigate={setCurrentTab}
            onStartQuiz={handleStartDefaultQuiz}
            onStartWrongOnlyQuiz={handleStartWrongOnlyQuiz}
          />
        )}

        {/* TAB 2: QUESTIONÁRIOS (ENTRADA & PARSER INTELIGENTE) */}
        {currentTab === "questionarios" && (
          <QuestionInput
            questions={questions}
            onSaveQuestion={handleSaveQuestion}
            onStartQuiz={handleStartDefaultQuiz}
            onStartCustomQuiz={handleStartQuizWithIds}
            notify={notify}
          />
        )}

        {/* TAB 3: QUIZ RUNNER (RESOLUÇÃO DA PROVA) */}
        {currentTab === "quiz" && activeQuizQuestions && (
          <QuizRunner
            quizQuestions={activeQuizQuestions}
            onFinishQuiz={handleFinishQuiz}
            onCancelQuiz={handleCancelQuiz}
          />
        )}

        {/* TAB 4: RESULTADOS (ANÁLISE QUESTÃO POR QUESTÃO) */}
        {currentTab === "resultados" && (
          <QuizResults
            quizResult={currentQuizResult || history[0] || {
              totalQuestions: 0,
              correctAnswers: 0,
              incorrectAnswers: 0,
              percentage: 0,
              questionIds: [],
              userAnswers: {}
            }}
            questions={questions}
            onStartQuizWithIds={handleStartQuizWithIds}
            onNavigate={setCurrentTab}
          />
        )}

        {/* TAB 5: DESEMPENHO (GRÁFICOS & ESTATÍSTICAS) */}
        {currentTab === "desempenho" && (
          <PerformanceView
            questions={questions}
            history={history}
            stats={stats}
            onNavigate={setCurrentTab}
          />
        )}

        {/* TAB 6: BANCO DE QUESTÕES */}
        {currentTab === "banco" && (
          <QuestionBank
            questions={questions}
            onSaveQuestion={handleSaveQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onDeleteMultipleQuestions={handleDeleteMultipleQuestions}
            onDuplicateQuestion={handleDuplicateQuestion}
            onToggleNeedsReview={handleToggleNeedsReview}
            onStartQuizWithIds={handleStartQuizWithIds}
            onNavigate={setCurrentTab}
            notify={notify}
          />
        )}

        {/* TAB 7: MODO REVISÃO */}
        {currentTab === "revisao" && (
          <ReviewMode
            questions={questions}
            history={history}
            onToggleNeedsReview={handleToggleNeedsReview}
            onStartQuizWithIds={handleStartQuizWithIds}
            onNavigate={setCurrentTab}
            notify={notify}
          />
        )}

        {/* TAB 8: CONFIGURAÇÕES */}
        {currentTab === "configuracoes" && (
          <SettingsView
            isDark={isDark}
            setIsDark={setIsDark}
            questions={questions}
            history={history}
            onResetAll={handleResetAll}
            onImportSuccess={() => setQuestions(loadQuestions())}
            notify={notify}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">Literatura Quiz</span>
            <span>—</span>
            <span>Estudo ativo e resolução de questões literárias</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Enem • Fuvest • Unicamp • Vestibulares</span>
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
