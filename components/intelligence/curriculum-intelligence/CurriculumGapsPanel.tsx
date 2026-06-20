"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import type { CurriculumGapItem } from "@/lib/progress/curriculum-intelligence";

export function CurriculumGapsPanel({ gaps }: { gaps: CurriculumGapItem[] }) {
  return (
    <Card className="border-amber-100/80 bg-gradient-to-br from-amber-50/40 to-white">
      <CardHeader
        title="Areas requiring planning attention"
        description="Prioritised curriculum gaps from your planned and delivered data."
      />
      {gaps.length === 0 ? (
        <p className="text-sm text-slate-500">
          No significant gaps detected — your curriculum coverage is well balanced.
        </p>
      ) : (
        <ol className="space-y-2.5">
          {gaps.map((gap, index) => (
            <li
              key={gap.id}
              className="flex items-start gap-3 rounded-xl border border-white/80 bg-white/80 px-4 py-3 text-sm text-slate-700"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800"
                aria-hidden
              >
                {index + 1}
              </span>
              <span className="leading-relaxed">{gap.message}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
