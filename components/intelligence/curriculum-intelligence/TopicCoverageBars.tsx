"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import type { TopicCoverageRow } from "@/lib/progress/teaching-progress-ui";

function barVariant(percent: number): "green" | "teal" | "amber" | "rose" {
  if (percent >= 70) return "green";
  if (percent >= 40) return "teal";
  if (percent > 0) return "amber";
  return "rose";
}

export function TopicCoverageBars({ rows }: { rows: TopicCoverageRow[] }) {
  const visible = rows.filter((row) => row.total > 0);

  if (visible.length === 0) {
    return (
      <p className="text-sm text-slate-500">No topic coverage data to display.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {visible.map((row) => (
        <li key={row.id}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-medium text-slate-800" title={row.topic}>
              {row.topic}
            </p>
            <p className="shrink-0 text-xs tabular-nums text-slate-500">
              {row.delivered} / {row.total}
            </p>
          </div>
          <ProgressBar
            value={row.delivered}
            max={row.total}
            showPercent
            variant={barVariant(row.coveragePercent)}
          />
        </li>
      ))}
    </ul>
  );
}
