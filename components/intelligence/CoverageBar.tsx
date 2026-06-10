import type { CoverageSlice } from "@/src/lib/intelligence/analytics/coverage-analytics";

const STATUS_COLORS: Record<CoverageSlice["status"], string> = {
  strong: "bg-teal-500",
  moderate: "bg-amber-400",
  weak: "bg-orange-400",
  missing: "bg-slate-200",
};

export function CoverageBar({ slice }: { slice: CoverageSlice }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-slate-800">{slice.label}</span>
        <span className="tabular-nums text-slate-500">
          {slice.coveragePercent}% · {slice.taughtOutcomes}/{slice.totalOutcomes}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${STATUS_COLORS[slice.status]}`}
          style={{ width: `${Math.max(slice.coveragePercent, slice.taughtOutcomes > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}
