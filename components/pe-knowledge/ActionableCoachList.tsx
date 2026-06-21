"use client";

import type { ReactNode } from "react";
import { ApplySuggestionButton } from "@/components/pe-knowledge/ApplySuggestionButton";

interface ActionableCoachListProps {
  label: string;
  items: Array<{ id: string; text: string; actionLabel?: string; onApply: () => boolean | void }>;
  empty?: string;
}

export function ActionableCoachList({ label, items, empty }: ActionableCoachListProps) {
  if (items.length === 0) {
    return empty ? (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-xs text-slate-600">{empty}</p>
      </div>
    ) : null;
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <ul className="mt-1 space-y-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-2 rounded-lg border border-slate-100/80 bg-white/60 px-2 py-1.5 text-xs text-slate-700"
          >
            <span className="min-w-0 flex-1">• {item.text}</span>
            <ApplySuggestionButton label={item.actionLabel ?? "Apply"} onApply={item.onApply} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ActionableCoachRow({
  children,
  onApply,
  actionLabel = "Apply",
}: {
  children: ReactNode;
  onApply: () => boolean | void;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1 text-xs text-slate-700">{children}</div>
      <ApplySuggestionButton label={actionLabel} onApply={onApply} />
    </div>
  );
}
