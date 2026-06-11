import { ProgressBar } from "@/components/ui/ProgressBar";
import type { CoverageSlice } from "@/src/lib/intelligence/analytics/coverage-analytics";

const STATUS_VARIANTS: Record<
  CoverageSlice["status"],
  "teal" | "amber" | "rose" | "slate"
> = {
  strong: "teal",
  moderate: "amber",
  weak: "rose",
  missing: "slate",
};

export function CoverageBar({ slice }: { slice: CoverageSlice }) {
  const variant = STATUS_VARIANTS[slice.status];
  const count = slice.modeCount ?? slice.taughtOutcomes;

  return (
    <ProgressBar
      label={slice.label}
      value={slice.coveragePercent}
      max={100}
      fractionLabel={`${slice.coveragePercent}% · ${count}/${slice.totalOutcomes}`}
      showPercent={false}
      variant={variant}
    />
  );
}
