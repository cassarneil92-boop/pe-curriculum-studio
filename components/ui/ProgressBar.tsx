"use client";

type ProgressVariant = "teal" | "blue" | "green" | "amber" | "rose" | "slate";

const BAR_VARIANTS: Record<ProgressVariant, string> = {
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-400",
};

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  variant?: ProgressVariant;
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  variant = "teal",
  showPercent = true,
  className = "",
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.round((value / safeMax) * 100));

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
          {label && <span className="font-medium text-slate-600">{label}</span>}
          {showPercent && <span className="text-slate-500">{percent}%</span>}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${BAR_VARIANTS[variant]}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={safeMax}
        />
      </div>
    </div>
  );
}
