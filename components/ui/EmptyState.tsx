import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-white to-slate-50/80 px-8 py-14 text-center">
      {icon && (
        <div
          className={
            typeof icon === "string"
              ? "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-teal-700"
              : "mb-4 flex items-center justify-center"
          }
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
