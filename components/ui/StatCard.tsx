import type { ReactNode } from "react";
import { Card } from "./Card";

type StatTone = "default" | "teal" | "green" | "amber" | "blue";

const VALUE_TONES: Record<StatTone, string> = {
  default: "text-slate-900",
  teal: "text-teal-700",
  green: "text-emerald-700",
  amber: "text-amber-700",
  blue: "text-blue-700",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className = "",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: StatTone;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className={`mt-1.5 text-2xl font-semibold tracking-tight tabular-nums ${VALUE_TONES[tone]}`}>
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-teal-700 ring-1 ring-slate-100">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
