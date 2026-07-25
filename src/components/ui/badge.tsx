import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "pending" | "danger" | "info" | "neutral" | "outline";
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  const variants = {
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10 font-semibold",
    pending:
      "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10 animate-pulse font-semibold",
    danger:
      "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10 font-semibold",
    info:
      "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10 font-semibold",
    neutral:
      "bg-slate-100 text-slate-700 border-slate-200 ring-slate-700/10 font-semibold",
    outline:
      "bg-white text-slate-600 border-slate-200 font-medium shadow-sm",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
