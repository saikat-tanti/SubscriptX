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
            "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5",
            t.type === "success" && "border-emerald-500/40 bg-slate-900/90 text-emerald-300 shadow-emerald-950/20",
            t.type === "error" && "border-rose-500/40 bg-slate-900/90 text-rose-300 shadow-rose-950/20",
            t.type === "pending" && "border-blue-500/40 bg-slate-900/90 text-blue-300 shadow-blue-950/20",
            t.type === "info" && "border-slate-700 bg-slate-900/90 text-slate-200 shadow-slate-950/20"
          )}
        >
          <div className="mt-0.5 shrink-0">
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 text-rose-400" />}
            {t.type === "pending" && <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />}
            {t.type === "info" && <Info className="h-5 w-5 text-blue-400" />}
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-sm font-bold text-white leading-tight">{t.title}</p>
            {t.description && (
              <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
            )}
          </div>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
