"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";

export function CurriculumJourney({
  planned,
  delivered,
  remaining,
  total,
}: {
  planned: number;
  delivered: number;
  remaining: number;
  total: number;
}) {
  const safeTotal = total > 0 ? total : 1;
  const plannedPct = Math.round((planned / safeTotal) * 100);
  const deliveredPct = Math.round((delivered / safeTotal) * 100);
  const remainingPct = Math.round((remaining / safeTotal) * 100);

  const stages = [
    { key: "planned", label: "Planned", value: planned, percent: plannedPct, variant: "blue" as const },
    { key: "delivered", label: "Delivered", value: delivered, percent: deliveredPct, variant: "green" as const },
    { key: "remaining", label: "Remaining", value: remaining, percent: remainingPct, variant: "amber" as const },
  ];

  return (
    <section className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Curriculum journey</h2>
        <p className="mt-1 text-sm text-slate-500">
          Where your curriculum stands across planning, delivery, and what is left to teach.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stages.map((stage, index) => (
          <div key={stage.key} className="relative">
            {index < stages.length - 1 && (
              <span
                className="absolute -right-2 top-5 hidden text-slate-300 sm:block"
                aria-hidden
              >
                →
              </span>
            )}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {stage.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{stage.value}</p>
              <ProgressBar
                className="mt-3"
                value={stage.percent}
                max={100}
                showPercent={false}
                variant={stage.variant}
              />
              <p className="mt-1 text-xs text-slate-400">{stage.percent}% of curriculum</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
