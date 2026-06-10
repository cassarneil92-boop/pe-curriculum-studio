import type { ReactNode } from "react";

type Tone = "teal" | "slate" | "amber" | "blue" | "green" | "purple" | "rose";

const tones: Record<Tone, string> = {
  teal: "bg-teal-50 text-teal-800 ring-teal-600/15",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/10",
  amber: "bg-amber-50 text-amber-900 ring-amber-500/15",
  blue: "bg-blue-50 text-blue-800 ring-blue-500/15",
  green: "bg-emerald-50 text-emerald-800 ring-emerald-500/15",
  purple: "bg-violet-50 text-violet-800 ring-violet-500/15",
  rose: "bg-rose-50 text-rose-800 ring-rose-500/15",
};

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
