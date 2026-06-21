"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import type { CurriculumBalanceItem } from "@/lib/progress/intelligence-teacher-view";

interface CurriculumBalanceBarsProps {
  items: CurriculumBalanceItem[];
}

export function CurriculumBalanceBars({ items }: CurriculumBalanceBarsProps) {
  return (
    <Card>
      <CardHeader
        title="Curriculum balance"
        description="Relative focus across your curriculum — not outcome counts."
      />
      <ul className="space-y-3 font-mono text-sm">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-right text-slate-700">{item.label}</span>
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
