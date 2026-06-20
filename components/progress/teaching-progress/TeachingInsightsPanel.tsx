"use client";

import { Card, CardHeader } from "@/components/ui/Card";

export function TeachingInsightsPanel({ insights }: { insights: string[] }) {
  if (insights.length === 0) return null;

  return (
    <Card className="border-teal-100/80 bg-gradient-to-br from-teal-50/30 to-white">
      <CardHeader
        title="Teaching insights"
        description="Rule-based observations from your planned and delivered curriculum."
      />
      <ul className="space-y-3">
        {insights.map((insight) => (
          <li
            key={insight}
            className="flex items-start gap-3 rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-sm leading-relaxed text-slate-700"
          >
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs text-teal-700"
              aria-hidden
            >
              ◆
            </span>
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
