import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  Award,
  Filter,
  ArrowRight,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
  Share2
} from "lucide-react";
import confetti from "canvas-confetti";

export function QuizResults({
  quizResult,
  questions,
  onStartQuizWithIds,
  onNavigate
}) {
  const [filter, setFilter] = useState("all"); // "all" | "correct" | "incorrect" | "unanswered"
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unanswered = 0,
    percentage,
    questionIds = [],
    userAnswers = {},
    date
  } = quizResult;

  // Confetti on good score
  useEffect(() => {
    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore if confetti fails
      }
    }
  }, [percentage]);

  // Question list mapped
  const questionItems = questionIds
    .map((qid) => questions.find((q) => q.id === qid))
    .filter(Boolean);

  // Erros para refazer
  const wrongQuestionIds = questionItems
    .filter((q) => {
      const ans = userAnswers[q.id];
      return ans !== q.correctAnswer;
    })
    .map((q) => q.id);

  // Filtragem da lista
  const filteredQuestions = questionItems.filter((q) => {
    const userAns = userAnswers[q.id];
    const isCorrect = userAns === q.correctAnswer;
    const isUnanswered = userAns === undefined || userAns === null;
    const isIncorrect = !isCorrect && !isUnanswered;

    if (filter === "correct") return isCorrect;
    if (filter === "incorrect") return isIncorrect;
    if (filter === "unanswered") return isUnanswered;
    return true;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* 4. Scorecard Banner Principal */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Resultado do Questionário</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
          {percentage >= 80
            ? "Excelente Desempenho!"
            : percentage >= 60
            ? "Bom Trabalho!"
            : "Continue Praticando!"}
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          {percentage >= 80
            ? "Você dominou a maior parte dos conceitos literários avaliados nesta prova."
            : "Revise os erros abaixo para reforçar os autores e escolas literárias em que você teve dúvidas."}
        </p>

        {/* 3 Metric Cards: Acertos, Erros, Aproveitamento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
          {/* Acertos (Verde) */}
          <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-500/40 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
              Acertos
            </span>
            <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
              {correctAnswers}
            </span>
            <span className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1 block">
              questões corretas
            </span>
          </div>

          {/* Erros (Vermelho) */}
          <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border-2 border-rose-500/40 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block mb-1">
              Erros
            </span>
            <span className="text-4xl font-extrabold text-rose-600 dark:text-rose-400 block">
              {incorrectAnswers + unanswered}
            </span>
            <span className="text-xs text-rose-700/80 dark:text-rose-400/80 mt-1 block">
              questões incorretas
            </span>
          </div>

          {/* Aproveitamento */}
          <div className="p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border-2 border-indigo-500/40 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block mb-1">
              Aproveitamento
            </span>
            <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 block">
              {percentage}%
            </span>
            <span className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-1 block">
              taxa de acerto
            </span>
          </div>
        </div>

        {/* Botão em Grande Destaque: Refazer apenas as questões que errei (Requisito 8) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {wrongQuestionIds.length > 0 ? (
            <button
              onClick={() => onStartQuizWithIds(wrongQuestionIds)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-rose-600/25 transition active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Refazer apenas as {wrongQuestionIds.length} questões que errei</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md">
              <CheckCircle2 className="w-5 h-5" />
              <span>Gabarito Perfeito! Sem erros para refazer.</span>
            </div>
          )}

          <button
            onClick={() => onNavigate("revisao")}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm transition"
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Estudar no Modo Revisão</span>
          </button>
        </div>
      </div>

      {/* 5. Análise Questão por Questão */}
      <div className="space-y-4">
        {/* Header com Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Análise Detalhada Questão por Questão</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verifique sua resposta em confronto com o gabarito oficial e comentários pedagógicos.
            </p>
          </div>

          {/* Filtros: Todas | Acertos | Erros | Não respondidas */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "all"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Todas ({questionItems.length})
            </button>

            <button
              onClick={() => setFilter("correct")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "correct"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
              }`}
            >
              Acertos ({correctAnswers})
            </button>

            <button
              onClick={() => setFilter("incorrect")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "incorrect"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-rose-600"
              }`}
            >
              Erros ({incorrectAnswers})
            </button>

            {unanswered > 0 && (
              <button
                onClick={() => setFilter("unanswered")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === "unanswered"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-sky-600"
                }`}
              >
                Não respondidas ({unanswered})
              </button>
            )}
          </div>
        </div>

        {/* Lista de Questões Analisadas */}
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            const isUnanswered = userAnswer === undefined || userAnswer === null;
            const isExpanded = expandedQuestionId === question.id;

            // Encontrar textos das alternativas
            const userOptionObj = question.options.find((o) => o.id === userAnswer);
            const correctOptionObj = question.options.find((o) => o.id === question.correctAnswer);

            return (
              <div
                key={question.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all shadow-xs ${
                  isCorrect
                    ? "border-emerald-200 dark:border-emerald-900/60"
                    : isUnanswered
                    ? "border-slate-200 dark:border-slate-800"
                    : "border-rose-200 dark:border-rose-900/60"
                }`}
              >
                {/* Header do Card da Questão */}
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : question.id)}
                  className="p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    {/* Badge de Resultado: Correta / Errada */}
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>✅ Correta</span>
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <HelpCircle className="w-4 h-4 text-slate-500" />
                        <span>Não respondida</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>❌ Errada</span>
                      </span>
                    )}

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      Questão {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </h3>

                    <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {question.school}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {isExpanded ? "Recolher detalhes" : "Clique para ver todas as alternativas"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Corpo com Enunciado */}
                <div className="px-5 pb-5 space-y-4">
                  <div className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-serif bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    {question.statement}
                  </div>

                  {/* Comparativo: Sua Resposta vs Resposta Correta (Requisito 5) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {/* Sua Resposta */}
                    <div
                      className={`p-3.5 rounded-xl border ${
                        isCorrect
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                          : isUnanswered
                          ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
                          : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        Sua resposta:
                      </span>
                      {userAnswer ? (
                        <div className="font-semibold text-slate-900 dark:text-white flex items-start gap-2">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${
                              isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                            }`}
                          >
                            {userAnswer}
                          </span>
                          <span className="text-xs sm:text-sm">{userOptionObj?.text || ""}</span>
                        </div>
                      ) : (
                        <span className="italic text-slate-400 text-xs">Questão deixada em branco</span>
                      )}
                    </div>

                    {/* Resposta Correta */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                        Resposta correta:
                      </span>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-start gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
                          {question.correctAnswer}
                        </span>
                        <span className="text-xs sm:text-sm">{correctOptionObj?.text || ""}</span>
                      </div>
                    </div>
                  </div>

                  {/* Se expandido, mostra todas as alternativas para estudo minucioso */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Todas as Alternativas
                      </p>
                      {question.options.map((opt) => {
                        const isThisCorrect = opt.id === question.correctAnswer;
                        const isThisUserChoice = opt.id === userAnswer;
                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 border ${
                              isThisCorrect
                                ? "bg-emerald-100/60 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-100 font-medium"
                                : isThisUserChoice && !isThisCorrect
                                ? "bg-rose-100/60 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-100"
                                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span className="font-bold w-5">{opt.id})</span>
                            <span className="flex-1">{opt.text}</span>
                            {isThisCorrect && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                                Correta
                              </span>
                            )}
                            {isThisUserChoice && !isThisCorrect && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                                Sua escolha
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explicação da Questão */}
                  {question.explanation && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                      <span className="font-bold block mb-1">Explicação / Comentário Pedagógico:</span>
                      {question.explanation}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
