import type { CoverageSlice } from "@/src/lib/intelligence/analytics/coverage-analytics";

const CELL: Record<CoverageSlice["status"], string> = {
  strong: "bg-teal-100 text-teal-900 border-teal-200",
  moderate: "bg-amber-50 text-amber-900 border-amber-200",
  weak: "bg-orange-50 text-orange-900 border-orange-200",
  missing: "bg-slate-50 text-slate-500 border-slate-200",
};

export function CoverageHeatmap({
  slices,
  title,
  maxItems = 24,
}: {
  slices: CoverageSlice[];
  title: string;
  maxItems?: number;
}) {
  const items = slices.slice(0, maxItems);

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((slice) => (
          <div
            key={slice.id}
            className={`rounded-lg border px-3 py-2 text-xs ${CELL[slice.status]}`}
            title={`${slice.taughtOutcomes}/${slice.totalOutcomes} outcomes taught`}
          >
            <p className="truncate font-medium">{slice.label}</p>
            <p className="mt-0.5 tabular-nums">{slice.coveragePercent}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
