import React, { useEffect, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  TrendingUp,
  Percent,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Award
} from "lucide-react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export function Dashboard({
  questions,
  history,
  stats,
  onNavigate,
  onStartQuiz,
  onStartWrongOnlyQuiz
}) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Contar quantas questões o usuário errou e precisam de revisão
  const wrongQuestionsCount = questions.filter(
    (q) => (q.timesIncorrect > 0 && q.needsReview) || (q.timesIncorrect > q.timesCorrect)
  ).length;

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Dados de evolução dos últimos 7 quizzes (ou menos)
    const reversedHistory = [...history].reverse().slice(-7);
    const labels = reversedHistory.map((h, i) => `Quiz #${i + 1}`);
    const dataPoints = reversedHistory.map((h) => h.percentage);

    const isDarkMode = document.documentElement.classList.contains("dark");
    const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
    const textColor = isDarkMode ? "#94a3b8" : "#64748b";

    chartInstance.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: labels.length > 0 ? labels : ["Início", "Quiz #1"],
        datasets: [
          {
            label: "Aproveitamento (%)",
            data: dataPoints.length > 0 ? dataPoints : [0, 80],
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.12)",
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: "#4f46e5",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkMode ? "#1e293b" : "#0f172a",
            titleColor: "#f8fafc",
            bodyColor: "#cbd5e1",
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `Aproveitamento: ${context.parsed.y}%`
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: (value) => `${value}%`
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: textColor }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [history]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide text-indigo-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Treinamento Literário Inteligente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">
            Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-200">Literatura Quiz</span>
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-6">
            Cole questões de vestibulares e do ENEM diretamente no sistema, resolva quizzes interativos, analise seus erros e acompanhe a evolução do seu aprendizado literário.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("questionarios")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-sm shadow-md hover:bg-indigo-50 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Colar Questão Agora</span>
            </button>

            <button
              onClick={() => onStartQuiz()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600/70 hover:bg-indigo-600 text-white font-semibold text-sm border border-indigo-400/40 backdrop-blur-sm transition active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span>Iniciar Simulado Rápido</span>
            </button>

            {wrongQuestionsCount > 0 && (
              <button
                onClick={() => onStartWrongOnlyQuiz()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-sm border border-rose-400/30 transition active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Refazer {wrongQuestionsCount} Questões Erradas</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Big KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Respondidas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Respondidas
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalAnsweredTimes}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">vezes respondidas</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span>{questions.length} questões cadastradas no acervo</span>
          </div>
        </div>

        {/* Total Acertos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total de Acertos
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.totalCorrectTimes}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">respostas certas</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{
                width: `${stats.totalAnsweredTimes > 0 ? (stats.totalCorrectTimes / stats.totalAnsweredTimes) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        {/* Total Erros */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total de Erros
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {stats.totalIncorrectTimes}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">para revisar</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{wrongQuestionsCount} questões pendentes</span>
            {wrongQuestionsCount > 0 && (
              <button
                onClick={() => onStartWrongOnlyQuiz()}
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Refazer agora
              </button>
            )}
          </div>
        </div>

        {/* Porcentagem de Aproveitamento */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Aproveitamento Geral
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {stats.overallAccuracy}%
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {stats.overallAccuracy >= 70 ? "Excelente rendimento" : "Em evolução"}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.overallAccuracy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle Grid: Performance Evolution Chart + Recent Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Evolução do Desempenho</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aproveitamento percentual ao longo dos questionários realizados
              </p>
            </div>
            <button
              onClick={() => onNavigate("desempenho")}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Ver estatísticas completas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <canvas ref={chartRef} />
          </div>
        </div>

        {/* Quick Review / Spotlight Card (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Foco nos Erros
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-bold">
                {wrongQuestionsCount} pendentes
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Praticar Questões Erradas
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              O método mais eficiente para fixar conteúdos de Literatura é refazer imediatamente as questões que você errou, lendo os comentários das obras e autores.
            </p>

            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total de questionários concluídos:</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.completedQuizzesCount}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Média geral de aproveitamento:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.averageScore}%</span>
              </div>
              {stats.bestQuiz && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Melhor simulado:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.bestQuiz.percentage}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <button
              onClick={() => onStartWrongOnlyQuiz()}
              disabled={wrongQuestionsCount === 0}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                wrongQuestionsCount > 0
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 active:scale-98"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Refazer Questões que Errei</span>
            </button>
            <button
              onClick={() => onNavigate("revisao")}
              className="w-full py-2 px-4 rounded-xl font-semibold text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition text-center"
            >
              Abrir Modo Revisão Detalhada
            </button>
          </div>
        </div>
      </div>

      {/* Recent Quizzes List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Últimos Questionários Realizados</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Histórico de simulados e avaliações feitas recentemente
            </p>
          </div>
          <button
            onClick={() => onNavigate("resultados")}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Ver detalhes de resultados</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {history && history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Questionário</th>
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3 text-center">Questões</th>
                  <th className="py-3 px-3 text-center">Acertos</th>
                  <th className="py-3 px-3 text-center">Erros</th>
                  <th className="py-3 px-3 text-center">Aproveitamento</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.slice(0, 5).map((item) => {
                  const dateStr = new Date(item.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {item.label || "Simulado de Literatura"}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 text-xs">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                        {item.totalQuestions}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          {item.correctAnswers}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          {item.incorrectAnswers}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`font-bold text-sm ${
                            item.percentage >= 70
                              ? "text-emerald-600 dark:text-emerald-400"
                              : item.percentage >= 50
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {item.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => onNavigate("resultados")}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                        >
                          Analisar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="font-medium">Nenhum questionário realizado ainda.</p>
            <p className="text-xs mt-1">Cole uma questão ou inicie um simulado para ver o histórico aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}
