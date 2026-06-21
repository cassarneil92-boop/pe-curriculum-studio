"use client";

import type { ReactNode } from "react";
import { Card, CardHeader } from "@/components/ui/Card";

interface PECoachPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  tone?: "teal" | "blue" | "slate";
}

const TONE_CLASSES = {
  teal: "border-teal-100/80 bg-teal-50/20",
  blue: "border-blue-100/80 bg-blue-50/20",
  slate: "border-slate-100 bg-slate-50/30",
};

export function PECoachPanel({
  title,
  description,
  children,
  tone = "teal",
}: PECoachPanelProps) {
  return (
    <Card className={TONE_CLASSES[tone]}>
      <CardHeader title={title} description={description} />
      <div className="space-y-3 text-sm">{children}</div>
      <p className="mt-3 text-[10px] text-slate-500">
        PE specialist guidance — practical and offline-ready.
      </p>
    </Card>
  );
}

function CoachSection({
  label,
  items,
  empty,
}: {
  label: string;
  items: string[];
  empty?: string;
}) {
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
      <ul className="mt-1 space-y-1 text-xs text-slate-700">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

PECoachPanel.Section = CoachSection;
