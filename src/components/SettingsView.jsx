import React, { useRef } from "react";
import {
  Settings,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Database,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Sparkles
} from "lucide-react";
import { exportDataAsJSON, importDataFromJSON, resetToDefaults } from "../utils/storage";

export function SettingsView({
  isDark,
  setIsDark,
  questions,
  history,
  onResetAll,
  onImportSuccess,
  notify
}) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      const json = exportDataAsJSON();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `literatura-quiz-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      notify("Backup exportado com sucesso!", "success");
    } catch (e) {
      notify("Erro ao exportar dados.", "error");
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        const result = importDataFromJSON(content);
        if (result.success) {
          notify(`${result.count} questões importadas com sucesso!`, "success");
          onImportSuccess();
        } else {
          notify(result.error || "Arquivo de importação inválido.", "error");
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRestoreDefaults = () => {
    if (
      window.confirm(
        "Deseja restaurar as questões originais de Literatura (Machado de Assis, Drummond, Clarice, etc.) e reiniciar o histórico?"
      )
    ) {
      const data = resetToDefaults();
      onResetAll(data);
      notify("Configurações e questões restauradas com sucesso!", "success");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Configurações do Sistema</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Preferências de tema, persistência local, backup e restauração de dados.
        </p>
      </div>

      {/* Aparência & Tema */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
          <span>Aparência e Tema</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Escolha entre o modo claro (padrão) e o modo escuro para leitura noturna confortável.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setIsDark(false)}
            className={`p-4 rounded-2xl border-2 text-left transition flex items-center justify-between ${
              !isDark
                ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 font-bold"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <span className="block text-sm text-slate-900 dark:text-white">Modo Claro</span>
                <span className="text-[11px] text-slate-400">Fundo limpo e suave</span>
              </div>
            </div>
            {!isDark && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
          </button>

          <button
            onClick={() => setIsDark(true)}
            className={`p-4 rounded-2xl border-2 text-left transition flex items-center justify-between ${
              isDark
                ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 font-bold"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="block text-sm text-slate-900 dark:text-white">Modo Escuro</span>
                <span className="text-[11px] text-slate-400">Excelente para a noite</span>
              </div>
            </div>
            {isDark && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* Backup & Importação de Dados */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-indigo-600" />
          <span>Armazenamento & Backup (JSON)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Suas questões e notas são salvas localmente no navegador (LocalStorage). Você pode exportar seus questionários para backup ou transferir para outro computador.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Banco de Dados (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition"
          >
            <Upload className="w-4 h-4 text-indigo-500" />
            <span>Importar Questões (JSON)</span>
          </button>
        </div>
      </div>

      {/* Informações e Restauração de Fábrica */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          <span>Informações do Acervo</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block mb-1">Questões Registradas:</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{questions.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block mb-1">Simulados Realizados:</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{history.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block mb-1">Persistência Ativa:</span>
            <span className="text-lg font-bold text-emerald-600">LocalStorage OK</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Restaurar Questões Originais
            </span>
            <span className="text-[11px] text-slate-400">
              Recarrega o acervo completo de questões clássicas (Machado, Clarice, Drummond, Camões, etc.)
            </span>
          </div>

          <button
            onClick={handleRestoreDefaults}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs border border-rose-200 dark:border-rose-900/60 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
        </div>
      </div>
    </div>
  );
}
