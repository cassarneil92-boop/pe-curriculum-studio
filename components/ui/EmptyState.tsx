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
          ? "rounded-[20px] border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10"
          : "rounded-[20px] border border-dashed border-slate-200/90 bg-gradient-to-b from-white via-white to-slate-50/80 px-10 py-20 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      }`}
    >
      {icon && (
        <div
          className={
            compact
              ? "mb-4 flex items-center justify-center"
              : "mb-6 flex h-28 w-28 items-center justify-center rounded-[20px] bg-teal-50/90 ring-1 ring-teal-100/80"
          }
        >
          {icon}
        </div>
      )}
      <h3
        className={`font-semibold text-[#0F172A] ${
          compact ? "text-base" : "text-xl tracking-tight"
        }`}
      >
        {title}
      </h3>
      <p
        className={`max-w-lg leading-relaxed text-slate-500 ${
          compact ? "mt-2 text-sm" : "mt-3 text-base"
        }`}
      >
        {description}
      </p>
      {action && <div className={compact ? "mt-5" : "mt-8"}>{action}</div>}
    </div>
  );
}
