import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Database,
  RotateCcw,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  PlusCircle,
  Sparkles,
  BookMarked
} from "lucide-react";

export function Navigation({
  currentTab,
  setCurrentTab,
  isDark,
  setIsDark,
  questionsCount,
  reviewCount,
  hasActiveQuiz,
  onStartNewQuiz
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "inicio", label: "Início", icon: LayoutDashboard },
    { id: "questionarios", label: "Questionários", icon: BookOpen, badge: hasActiveQuiz ? "Em andamento" : null, badgeColor: "bg-amber-500" },
    { id: "resultados", label: "Resultados", icon: CheckCircle2 },
    { id: "desempenho", label: "Desempenho", icon: BarChart3 },
    { id: "banco", label: "Banco de Questões", icon: Database, badge: questionsCount },
    { id: "revisao", label: "Modo Revisão", icon: RotateCcw, badge: reviewCount > 0 ? reviewCount : null, badgeColor: "bg-rose-500" },
    { id: "configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <>
      {/* Top Bar for Mobile & Desktop */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab("inicio")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-blue-400">
                Literatura Quiz
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Análise & Estudo Inteligente
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white leading-none ${
                        item.badgeColor || "bg-indigo-500/90"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action buttons & Dark mode toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
              aria-label="Alternar tema"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={() => {
                setCurrentTab("questionarios");
              }}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm shadow-indigo-500/25 transition active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Colar Questão</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown navigation */}
        {mobileOpen && (
          <div className="lg:hidden px-4 pt-2 pb-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 font-semibold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge !== null && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold text-white ${item.badgeColor || "bg-indigo-500"}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
