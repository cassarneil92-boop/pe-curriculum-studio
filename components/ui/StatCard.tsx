import type { ReactNode } from "react";
import { Card } from "./Card";

type StatTone = "default" | "teal" | "green" | "amber" | "blue";

const VALUE_TONES: Record<StatTone, string> = {
  default: "text-[#0F172A]",
  teal: "text-teal-700",
  green: "text-emerald-700",
  amber: "text-amber-700",
  blue: "text-blue-700",
};

const ICON_BG: Record<StatTone, string> = {
  default: "bg-slate-50 ring-slate-100",
  teal: "bg-teal-50 ring-teal-100/80",
  green: "bg-emerald-50 ring-emerald-100/80",
  amber: "bg-amber-50 ring-amber-100/80",
  blue: "bg-blue-50 ring-blue-100/80",
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
    <Card className={`!p-5 sm:!p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>
          <p
            className={`mt-2 text-3xl font-bold tracking-tight tabular-nums ${VALUE_TONES[tone]}`}
          >
            {value}
          </p>
          {hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{hint}</p>}
        </div>
        {icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ring-1 ${ICON_BG[tone]} text-teal-700`}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
