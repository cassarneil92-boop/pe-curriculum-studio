import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = "", padding = true }: CardProps) {
  return (
    <div
      className={`rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.04)] ${padding ? "p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold leading-snug tracking-tight text-[#0F172A]">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
