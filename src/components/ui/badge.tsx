import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "pending" | "danger" | "info" | "neutral" | "outline";
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  const variants = {
    success:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ring-emerald-500/20",
    pending:
      "bg-amber-500/10 text-amber-400 border-amber-500/30 ring-amber-500/20 animate-pulse",
    danger:
      "bg-rose-500/10 text-rose-400 border-rose-500/30 ring-rose-500/20",
    info:
      "bg-blue-500/10 text-blue-400 border-blue-500/30 ring-blue-500/20",
    neutral:
      "bg-slate-800 text-slate-300 border-slate-700 ring-slate-700/20",
    outline:
      "bg-transparent text-slate-400 border-slate-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
