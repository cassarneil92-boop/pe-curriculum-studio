"use client";

import { CircularProgress } from "@/components/ui/CircularProgress";
import type { CurriculumHealthScore } from "@/lib/progress/teaching-progress-ui";

const STATUS_RING: Record<CurriculumHealthScore["variant"], string> = {
  rose: "from-rose-50/80 via-white to-white border-rose-100/80",
  amber: "from-amber-50/80 via-white to-white border-amber-100/80",
  blue: "from-blue-50/80 via-white to-white border-blue-100/80",
  green: "from-emerald-50/80 via-white to-white border-emerald-100/80",
};

const STATUS_TEXT: Record<CurriculumHealthScore["variant"], string> = {
  rose: "text-rose-700",
  amber: "text-amber-700",
  blue: "text-blue-700",
  green: "text-emerald-700",
};

export function CurriculumHealthHero({ health }: { health: CurriculumHealthScore }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[20px] border bg-gradient-to-br p-6 sm:p-8 ${STATUS_RING[health.variant]}`}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Curriculum Health Score
          </p>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {health.deliveredPercent}%
            </span>
            <span className="text-lg text-slate-500">delivered</span>
          </div>
          <p className={`mt-2 text-lg font-semibold ${STATUS_TEXT[health.variant]}`}>
            {health.label}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            {health.explanation}
          </p>
        </div>
        <div className="flex shrink-0 justify-center sm:justify-end">
          <CircularProgress
            value={health.deliveredPercent}
            max={100}
            size={120}
            strokeWidth={9}
            variant={health.variant}
            showPercent
          />
        </div>
      </div>
    </section>
  );
}
