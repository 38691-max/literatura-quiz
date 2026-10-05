import React, { useEffect, useRef } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  BookOpen,
  ArrowUpRight,
  Flame,
  Zap,
  Target
} from "lucide-react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export function PerformanceView({
  questions,
  history,
  stats,
  onNavigate
}) {
  const lineChartRef = useRef(null);
  const lineChartInstance = useRef(null);

  const doughnutChartRef = useRef(null);
  const doughnutChartInstance = useRef(null);

  const barChartRef = useRef(null);
  const barChartInstance = useRef(null);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
    const textColor = isDarkMode ? "#94a3b8" : "#64748b";

    // 1. Gráfico de Evolução (Line)
    if (lineChartRef.current) {
      if (lineChartInstance.current) lineChartInstance.current.destroy();

      const reversedHistory = [...history].reverse();
      const labels = reversedHistory.map((h, i) => `Simulado ${i + 1}`);
      const dataPoints = reversedHistory.map((h) => h.percentage);

      lineChartInstance.current = new Chart(lineChartRef.current, {
        type: "line",
        data: {
          labels: labels.length > 0 ? labels : ["Simulado 1"],
          datasets: [
            {
              label: "Aproveitamento (%)",
              data: dataPoints.length > 0 ? dataPoints : [0],
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              borderWidth: 3,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: "#4f46e5",
              pointBorderColor: "#ffffff",
              pointRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Aproveitamento: ${ctx.parsed.y}%`
              }
            }
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              grid: { color: gridColor },
              ticks: { color: textColor, callback: (v) => `${v}%` }
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor }
            }
          }
        }
      });
    }

    // 2. Gráfico Acertos x Erros (Doughnut)
    if (doughnutChartRef.current) {
      if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();

      doughnutChartInstance.current = new Chart(doughnutChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Acertos", "Erros"],
          datasets: [
            {
              data: [
                stats.totalCorrectTimes || 1,
                stats.totalIncorrectTimes || 0
              ],
              backgroundColor: ["#10b981", "#ef4444"],
              borderWidth: 0,
              hoverOffset: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { color: textColor, boxWidth: 12, padding: 16 }
            }
          },
          cutout: "70%"
        }
      });
    }

    // 3. Gráfico Desempenho por Escola Literária (Bar)
    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();

      const schoolsWithData = stats.schoolStats.filter((s) => s.hasAnswers).slice(0, 8);
      const schoolLabels = schoolsWithData.map((s) => s.school);
      const schoolPercentages = schoolsWithData.map((s) => s.percentage);

      barChartInstance.current = new Chart(barChartRef.current, {
        type: "bar",
        data: {
          labels: schoolLabels.length > 0 ? schoolLabels : ["Modernismo", "Romantismo", "Realismo"],
          datasets: [
            {
              label: "Taxa de Acerto (%)",
              data: schoolPercentages.length > 0 ? schoolPercentages : [75, 90, 65],
              backgroundColor: [
                "rgba(99, 102, 241, 0.8)",
                "rgba(168, 85, 247, 0.8)",
                "rgba(59, 130, 246, 0.8)",
                "rgba(16, 185, 129, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(236, 72, 153, 0.8)"
              ],
              borderRadius: 8
            }
          ]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Acertos: ${ctx.parsed.x}%`
              }
            }
          },
          scales: {
            x: {
              min: 0,
              max: 100,
              grid: { color: gridColor },
              ticks: { color: textColor, callback: (v) => `${v}%` }
            },
            y: {
              grid: { display: false },
              ticks: { color: textColor, font: { weight: "500" } }
            }
          }
        }
      });
    }

    return () => {
      if (lineChartInstance.current) lineChartInstance.current.destroy();
      if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
    };
  }, [history, stats]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Painel de Desempenho e Estatísticas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Métricas detalhadas, acertos, erros e análise por movimento literário.
          </p>
        </div>

        <button
          onClick={() => onNavigate("questionarios")}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/25 transition active:scale-95"
        >
          <Zap className="w-4 h-4" />
          <span>Fazer Novo Simulado</span>
        </button>
      </div>

      {/* Grid de Métricas Principais (Requisito 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total de Questões */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total de Questões
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalQuestions}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">no acervo ativo</span>
        </div>

        {/* Total Respondidas */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Respondidas
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {stats.totalAnsweredTimes}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">questões resolvidas</span>
        </div>

        {/* Acertos */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            Acertos Totais
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.totalCorrectTimes}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">respostas corretas</span>
        </div>

        {/* Erros */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
            Erros Totais
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {stats.totalIncorrectTimes}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">para revisar</span>
        </div>
      </div>

      {/* Grid de Desempenho Específico: Melhor, Pior, Média, Percentual Geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Percentual de Acerto Geral */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Percentual Geral
            </span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.overallAccuracy}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Média ponderada de todas as tentativas
          </div>
        </div>

        {/* Melhor Desempenho */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Melhor Desempenho
            </span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.bestQuiz ? `${stats.bestQuiz.percentage}%` : "--"}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {stats.bestQuiz ? stats.bestQuiz.label : "Sem simulados"}
          </div>
        </div>

        {/* Pior Desempenho */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pior Desempenho
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {stats.worstQuiz ? `${stats.worstQuiz.percentage}%` : "--"}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {stats.worstQuiz ? stats.worstQuiz.label : "Sem simulados"}
          </div>
        </div>

        {/* Média de Acertos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Média por Simulado
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {stats.averageScore}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {stats.completedQuizzesCount} simulados concluídos
          </div>
        </div>
      </div>

      {/* Gráficos Chart.js: Linha + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolução dos Acertos (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Evolução dos Acertos ao Longo do Tempo</span>
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhamento histórico da sua taxa de acerto por questionário
            </p>
          </div>
          <div className="h-64">
            <canvas ref={lineChartRef} />
          </div>
        </div>

        {/* Acertos x Erros (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Acertos x Erros</span>
            </h2>
            <p className="text-xs text-slate-500">
              Proporção global de acertos vs erros
            </p>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            <canvas ref={doughnutChartRef} />
          </div>
        </div>
      </div>

      {/* Desempenho por Escola Literária (Requisito 7: Romantismo 91%, etc) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Horizontal */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Desempenho por Escola Literária</span>
            </h2>
            <p className="text-xs text-slate-500">
              Taxa de acertos em cada período e movimento
            </p>
          </div>
          <div className="h-72">
            <canvas ref={barChartRef} />
          </div>
        </div>

        {/* Barras de Progresso e Lista com Exemplo da Especificação */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Aproveitamento Detalhado por Movimento
            </h2>
            <p className="text-xs text-slate-500">
              Identifique rapidamente onde focar seus estudos de Literatura
            </p>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {stats.schoolStats.map((item) => {
              const pct = item.percentage;
              return (
                <div key={item.school} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.school}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">
                        {item.correct}/{item.answered} acertos
                      </span>
                      <span
                        className={`font-bold ${
                          pct >= 75
                            ? "text-emerald-600 dark:text-emerald-400"
                            : pct >= 50
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {item.hasAnswers ? `${pct}%` : "Sem respostas"}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        pct >= 75
                          ? "bg-emerald-500"
                          : pct >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${item.hasAnswers ? pct : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
