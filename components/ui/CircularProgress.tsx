"use client";

type CircularVariant = "teal" | "green" | "blue" | "amber" | "rose" | "slate";

const STROKE_VARIANTS: Record<CircularVariant, string> = {
  teal: "stroke-teal-500",
  green: "stroke-emerald-500",
  blue: "stroke-blue-500",
  amber: "stroke-amber-500",
  rose: "stroke-rose-500",
  slate: "stroke-slate-400",
};

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  variant?: CircularVariant;
  showPercent?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 88,
  strokeWidth = 7,
  label,
  variant = "teal",
  showPercent = true,
  className = "",
}: CircularProgressProps) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.round((value / safeMax) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-slate-100"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`transition-all duration-500 ${STROKE_VARIANTS[variant]}`}
          />
        </svg>
        {showPercent && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold tabular-nums text-slate-800">{percent}%</span>
          </div>
        )}
      </div>
      {label && <span className="text-center text-xs font-medium text-slate-500">{label}</span>}
    </div>
  );
}
