"use client";

import * as React from "react";
import { useToast, ToastItem } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, toast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 bg-white",
            t.type === "success" && "border-emerald-200 text-emerald-900 shadow-emerald-500/5",
            t.type === "error" && "border-rose-200 text-rose-900 shadow-rose-500/5",
            t.type === "pending" && "border-indigo-200 text-indigo-900 shadow-indigo-500/5",
            t.type === "info" && "border-slate-200 text-slate-900 shadow-slate-500/5"
          )}
        >
          <div className="mt-0.5 shrink-0">
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 text-rose-600" />}
            {t.type === "pending" && <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />}
            {t.type === "info" && <Info className="h-5 w-5 text-indigo-600" />}
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-sm font-bold text-slate-900 leading-tight">{t.title}</p>
            {t.description && (
              <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
            )}
          </div>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
