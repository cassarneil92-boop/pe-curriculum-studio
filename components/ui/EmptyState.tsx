import type { ReactNode } from "react";

type EmptyVariant = "default" | "compact";

export function EmptyState({
  title,
  description,
  action,
  icon,
  variant = "default",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  variant?: EmptyVariant;
}) {
  const compact = variant === "compact";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact
          ? "rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10"
          : "rounded-2xl border border-dashed border-slate-200/90 bg-gradient-to-b from-white via-white to-slate-50/90 px-8 py-16 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
      }`}
    >
      {icon && (
        <div
          className={
            compact
              ? "mb-3 flex items-center justify-center"
              : "mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-teal-50/80 ring-1 ring-teal-100/80"
          }
        >
          {icon}
        </div>
      )}
      <h3 className={`font-semibold text-slate-800 ${compact ? "text-sm" : "text-lg tracking-tight"}`}>
        {title}
      </h3>
      <p
        className={`max-w-md leading-relaxed text-slate-500 ${
          compact ? "mt-1.5 text-xs" : "mt-2.5 text-sm"
        }`}
      >
        {description}
      </p>
      {action && <div className={compact ? "mt-4" : "mt-7"}>{action}</div>}
    </div>
  );
}
