import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700/80">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#0F172A]">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
