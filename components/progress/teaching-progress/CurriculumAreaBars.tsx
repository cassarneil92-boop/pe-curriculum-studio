"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import type { CurriculumAreaBar } from "@/lib/progress/teaching-progress-teacher-view";

interface CurriculumAreaBarsProps {
  items: CurriculumAreaBar[];
  title?: string;
  description?: string;
}

export function CurriculumAreaBars({
  items,
  title = "Curriculum areas covered",
  description = "Relative focus across your teaching — not outcome counts.",
}: CurriculumAreaBarsProps) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <ul className="space-y-3 font-mono text-sm">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3">
            <span className="w-40 shrink-0 text-right text-slate-700">{item.label}</span>
            <span className="text-teal-700" aria-hidden>
              {"█".repeat(item.barLength)}
              {item.barLength === 0 ? "·" : ""}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
