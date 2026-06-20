"use client";

import type { LearningAreaTermCell } from "@/lib/progress/curriculum-intelligence";

const STATUS_STYLES: Record<
  LearningAreaTermCell["status"],
  { cell: string; dot: string; label: string }
> = {
  strong: {
    cell: "bg-emerald-100 hover:bg-emerald-200/80 text-emerald-950",
    dot: "bg-emerald-500",
    label: "Strong",
  },
  moderate: {
    cell: "bg-amber-100 hover:bg-amber-200/80 text-amber-950",
    dot: "bg-amber-500",
    label: "Moderate",
  },
  weak: {
    cell: "bg-orange-100 hover:bg-orange-200/80 text-orange-950",
    dot: "bg-orange-500",
    label: "Low",
  },
  missing: {
    cell: "bg-slate-100 hover:bg-slate-200/80 text-slate-600",
    dot: "bg-slate-400",
    label: "None",
  },
};

export function LearningAreaTermHeatmap({
  cells,
  termNames,
}: {
  cells: LearningAreaTermCell[];
  termNames: string[];
}) {
  const areas = [...new Set(cells.map((c) => c.learningAreaLabel))];

  if (areas.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No learning area data available for the heatmap.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="pb-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Learning area
            </th>
            {termNames.map((term) => (
              <th
                key={term}
                className="pb-3 px-1 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500"
              >
                {term}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => (
            <tr key={area} className="border-t border-slate-100">
              <td className="py-2.5 pr-4 text-sm font-medium text-slate-800">{area}</td>
              {termNames.map((term) => {
                const cell = cells.find(
                  (c) => c.learningAreaLabel === area && c.termName === term
                );
                if (!cell) {
                  return (
                    <td key={term} className="p-1">
                      <div className="h-10 rounded-lg bg-slate-50" />
                    </td>
                  );
                }
                const style = STATUS_STYLES[cell.status];
                const tooltip = `${area} · ${term}: ${cell.delivered}/${cell.total} outcomes delivered (${cell.coveragePercent}%) — ${style.label} coverage`;

                return (
                  <td key={term} className="p-1">
                    <div
                      className={`group relative flex h-10 cursor-default flex-col items-center justify-center rounded-lg transition-colors ${style.cell}`}
                      title={tooltip}
                    >
                      <span className="text-xs font-semibold tabular-nums">
                        {cell.coveragePercent}%
                      </span>
                      <span className="sr-only">{tooltip}</span>
                      <div
                        className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden w-max max-w-[200px] -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] leading-snug text-white shadow-lg group-hover:block"
                        role="tooltip"
                      >
                        {cell.delivered}/{cell.total} delivered
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
        {(Object.entries(STATUS_STYLES) as [LearningAreaTermCell["status"], typeof STATUS_STYLES.strong][]).map(
          ([status, style]) => (
            <span key={status} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          )
        )}
      </div>
    </div>
  );
}
