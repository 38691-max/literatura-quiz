import React, { useState } from "react";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Feather,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  HelpCircle,
  ThumbsUp,
  BookmarkCheck
} from "lucide-react";

export function ReviewMode({
  questions,
  history,
  onToggleNeedsReview,
  onStartQuizWithIds,
  onNavigate,
  notify
}) {
  const [filterMode, setFilterMode] = useState("all-errors"); // "all-errors" | "flagged-only" | "all"
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mapear respostas dadas no histórico mais recente para cada questão
  const lastUserAnswerMap = {};
  if (history && history.length > 0) {
    history.forEach((h) => {
      if (h.userAnswers) {
        Object.keys(h.userAnswers).forEach((qid) => {
          if (!lastUserAnswerMap[qid]) {
            lastUserAnswerMap[qid] = h.userAnswers[qid];
          }
        });
      }
    });
  }

  // Filtrar questões para o modo de revisão
  const reviewPool = questions.filter((q) => {
    if (filterMode === "flagged-only") {
      return q.needsReview;
    }
    if (filterMode === "all-errors") {
      return q.timesIncorrect > 0 || q.needsReview;
    }
    return true; // all
  });

  const currentQuestion = reviewPool[currentIndex];
  const total = reviewPool.length;

  const handleEntendi = () => {
    if (!currentQuestion) return;
    onToggleNeedsReview(currentQuestion.id, false);
    notify("Marcado como 'Entendi'! Prioridade de revisão reduzida.", "success");
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrecisoRevisar = () => {
    if (!currentQuestion) return;
    onToggleNeedsReview(currentQuestion.id, true);
    notify("Marcado como 'Preciso revisar' para reforço posterior.", "warning");
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <RotateCcw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Modo de Revisão Literária</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Estude as obras, escolas e explicações dos conteúdos em que você teve dúvidas.
          </p>
        </div>

        {/* Filtros da Revisão */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
          <button
            onClick={() => {
              setFilterMode("all-errors");
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterMode === "all-errors"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Questões com Erros ({questions.filter((q) => q.timesIncorrect > 0).length})
          </button>

          <button
            onClick={() => {
              setFilterMode("flagged-only");
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterMode === "flagged-only"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-amber-600"
            }`}
          >
            Marcadas p/ Revisar ({questions.filter((q) => q.needsReview).length})
          </button>

          <button
            onClick={() => {
              setFilterMode("all");
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterMode === "all"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Todas ({questions.length})
          </button>
        </div>
      </div>

      {total > 0 && currentQuestion ? (
        <div className="space-y-6">
          {/* Barra de Progresso e Navegação dos Flashcards */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                Card {currentIndex + 1} de {total}
              </span>
              {currentQuestion.needsReview && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  Precisa revisar
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                disabled={currentIndex === total - 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Flashcard de Revisão Completo (Requisito 9) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
            {/* Metadados: Escola, Autor, Obra */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-900/60">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Escola Literária: {currentQuestion.school || "Literatura Geral"}</span>
              </div>

              {currentQuestion.author && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                  <Feather className="w-3.5 h-3.5" />
                  <span>Autor: {currentQuestion.author}</span>
                </div>
              )}

              {currentQuestion.work && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  <span>Obra: "{currentQuestion.work}"</span>
                </div>
              )}
            </div>

            {/* Enunciado */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Questão
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-base leading-relaxed font-serif">
                {currentQuestion.statement}
              </div>
            </div>

            {/* Comparativo de Respostas: Resposta Dada vs Resposta Correta (Requisito 9) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resposta Dada */}
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block mb-1">
                  Resposta dada anteriormente:
                </span>
                {lastUserAnswerMap[currentQuestion.id] ? (
                  <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-start gap-2 mt-1">
                    <span className="w-6 h-6 rounded-md bg-rose-600 text-white flex items-center justify-center text-xs shrink-0">
                      {lastUserAnswerMap[currentQuestion.id]}
                    </span>
                    <span>
                      {currentQuestion.options.find((o) => o.id === lastUserAnswerMap[currentQuestion.id])?.text || ""}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Não respondida ou nunca errada neste dispositivo
                  </span>
                )}
              </div>

              {/* Resposta Correta */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  Resposta correta oficial:
                </span>
                <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-start gap-2 mt-1">
                  <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
                    {currentQuestion.correctAnswer}
                  </span>
                  <span>
                    {currentQuestion.options.find((o) => o.id === currentQuestion.correctAnswer)?.text || ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Explicação Pedagógica (Requisito 9) */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed">
              <span className="font-extrabold text-indigo-700 dark:text-indigo-300 block mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Explicação da resposta:</span>
              </span>
              <p>
                {currentQuestion.explanation ||
                  "Esta questão aborda as características estilísticas e o contexto histórico do autor e da respectiva escola literária. Revise a linguagem do período para dominar a interpretação."}
              </p>
            </div>

            {/* Botões do Modo de Revisão: Entendi | Preciso Revisar (Requisito 9) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => onStartQuizWithIds([currentQuestion.id])}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-semibold text-xs transition"
              >
                <Play className="w-3.5 h-3.5 text-indigo-600" />
                <span>Resolver esta questão novamente</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrecisoRevisar}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition active:scale-95"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Preciso revisar</span>
                </button>

                <button
                  type="button"
                  onClick={handleEntendi}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Entendi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <BookmarkCheck className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Nenhuma questão pendente para revisão!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Você não possui erros pendentes com este filtro ou marcou todas como "Entendi".
          </p>
          <button
            onClick={() => setFilterMode("all")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            Ver todas as questões do acervo
          </button>
        </div>
      )}
    </div>
  );
}
