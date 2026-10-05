import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />
  };

  const borders = {
    success: "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100",
    error: "border-rose-500/30 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100",
    warning: "border-amber-500/30 bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100",
    info: "border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-100"
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md ${
          borders[toast.type] || borders.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <p className="flex-1 text-xs sm:text-sm font-medium leading-snug">
          {toast.message}
        </p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
