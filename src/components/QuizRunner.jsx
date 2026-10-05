import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Clock,
  BookOpen,
  Bookmark,
  Flag,
  X
} from "lucide-react";

export function QuizRunner({
  quizQuestions,
  onFinishQuiz,
  onCancelQuiz,
  initialAnswers = {}
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(initialAnswers);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const currentQuestion = quizQuestions[currentIndex];
  const total = quizQuestions.length;
  const answeredCount = Object.keys(userAnswers).filter((k) => userAnswers[k] !== undefined).length;
  const progressPercentage = Math.round(((currentIndex + 1) / total) * 100);

  // Keyboard navigation and shortcut selection
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if active in an input/textarea
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

      if (e.key === "ArrowLeft") {
        if (currentIndex > 0) setCurrentIndex((c) => c - 1);
      } else if (e.key === "ArrowRight") {
        if (currentIndex < total - 1) setCurrentIndex((c) => c + 1);
      } else {
        const key = e.key.toUpperCase();
        if (["A", "B", "C", "D", "E"].includes(key)) {
          // Check if current question has this option
          const hasOpt = currentQuestion?.options.some((o) => o.id === key);
          if (hasOpt) {
            handleSelectAnswer(key);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, currentQuestion, total]);

  const handleSelectAnswer = (optionId) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowConfirmFinish(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleConfirmFinish = () => {
    setShowConfirmFinish(false);
    onFinishQuiz({
      userAnswers,
      timeSpentSeconds: elapsedSeconds,
      total,
      questionIds: quizQuestions.map((q) => q.id)
    });
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentQuestion) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Nenhuma questão disponível para este questionário.</p>
        <button
          onClick={onCancelQuiz}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Voltar
        </button>
      </div>
    );
  }

  const selectedAnswer = userAnswers[currentQuestion.id];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Quiz Header: Progress & Timer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            Questão {currentIndex + 1} de {total}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{answeredCount}</span> de {total} respondidas
          </div>
        </div>

        {/* Timer & Exit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Deseja sair do questionário agora? O progresso não finalizado será perdido.")) {
                onCancelQuiz();
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Sair do questionário"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Full Width) */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Quick Navigation Palette (1, 2, 3...) */}
        <div className="w-full flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {quizQuestions.map((q, idx) => {
            const isAnswered = userAnswers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                  isCurrent
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                    : isAnswered
                    ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300/50"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card (Requisito 3) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60">
              {currentQuestion.school || "Literatura"}
            </span>
            {currentQuestion.author && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {currentQuestion.author}
              </span>
            )}
            {currentQuestion.work && (
              <span className="text-xs italic px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                "{currentQuestion.work}"
              </span>
            )}
          </div>

          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              currentQuestion.difficulty === "Fácil"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : currentQuestion.difficulty === "Difícil"
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            }`}
          >
            {currentQuestion.difficulty || "Média"}
          </span>
        </div>

        {/* Question Header & Statement */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            Questão {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
          </h2>

          <div className="text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-relaxed whitespace-pre-line font-serif selection:bg-indigo-200 dark:selection:bg-indigo-900">
            {currentQuestion.statement}
          </div>
        </div>

        {/* Alternatives (Radio options A to E) */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            return (
              <div
                key={option.id}
                onClick={() => handleSelectAnswer(option.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 shadow-sm"
                    : "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-100/50"
                }`}
              >
                {/* Radio Circle / Letter */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {option.id}
                </div>

                {/* Option Text */}
                <div className="flex-1 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {option.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Keyboard Hint */}
        <div className="mt-6 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Dica: Use as teclas A, B, C, D, E para marcar e as setas ← → para navegar</span>
          {selectedAnswer && (
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Marcada: {selectedAnswer}
            </span>
          )}
        </div>
      </div>

      {/* Quiz Controls: Anterior | Próxima | Finalizar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition ${
            currentIndex === 0
              ? "text-slate-400 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfirmFinish(true)}
            className="px-5 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-bold text-sm transition"
          >
            Finalizar Questionário
          </button>

          {currentIndex < total - 1 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition active:scale-95"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmFinish(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/25 transition active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Finalizar e Corrigir</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal before Finish */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Finalizar questionário?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Todas as questões serão corrigidas automaticamente com notas, erros e explicações.
              </p>
            </div>

            {total - answeredCount > 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Atenção: você ainda tem <strong>{total - answeredCount} questão(ões) não respondida(s)</strong>. Elas serão contabilizadas como erro.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Parabéns! Todas as {total} questões foram respondidas.</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmFinish(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Voltar à Prova
              </button>
              <button
                type="button"
                onClick={handleConfirmFinish}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition"
              >
                Confirmar e Corrigir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
