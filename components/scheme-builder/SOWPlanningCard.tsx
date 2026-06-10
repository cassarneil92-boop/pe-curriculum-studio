"use client";

type CardTone = "teal" | "blue" | "purple" | "amber" | "green";

const TONE_STYLES: Record<
  CardTone,
  { border: string; bg: string; used: string; label: string }
> = {
  teal: {
    border: "border-teal-200 hover:border-teal-400",
    bg: "bg-teal-50/80",
    used: "border-teal-400 bg-teal-100/90 ring-1 ring-teal-200",
    label: "text-teal-800",
  },
  blue: {
    border: "border-blue-200 hover:border-blue-400",
    bg: "bg-blue-50/80",
    used: "border-blue-400 bg-blue-100/90 ring-1 ring-blue-200",
    label: "text-blue-800",
  },
  purple: {
    border: "border-violet-200 hover:border-violet-400",
    bg: "bg-violet-50/80",
    used: "border-violet-400 bg-violet-100/90 ring-1 ring-violet-200",
    label: "text-violet-800",
  },
  amber: {
    border: "border-amber-200 hover:border-amber-400",
    bg: "bg-amber-50/80",
    used: "border-amber-400 bg-amber-100/90 ring-1 ring-amber-200",
    label: "text-amber-900",
  },
  green: {
    border: "border-emerald-200 hover:border-emerald-400",
    bg: "bg-emerald-50/80",
    used: "border-emerald-400 bg-emerald-100/90 ring-1 ring-emerald-200",
    label: "text-emerald-800",
  },
};

interface SOWPlanningCardProps {
  title: string;
  subtitle?: string;
  footer?: string;
  tone: CardTone;
  used?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function SOWPlanningCard({
  title,
  subtitle,
  footer,
  tone,
  used = false,
  disabled = false,
  onClick,
}: SOWPlanningCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
      } ${used ? styles.used : `${styles.border} ${styles.bg}`}`}
    >
      <p className={`text-sm font-medium leading-snug ${styles.label}`}>{title}</p>
      {subtitle && <p className="mt-1 text-xs leading-relaxed text-slate-600">{subtitle}</p>}
      {footer && (
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {footer}
        </p>
      )}
      {used && <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Added</p>}
    </button>
  );
}
