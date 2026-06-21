"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import type { MissingCurriculumArea } from "@/lib/progress/teaching-progress-teacher-view";

interface AreasStillMissingPanelProps {
  areas: MissingCurriculumArea[];
}

export function AreasStillMissingPanel({ areas }: AreasStillMissingPanelProps) {
  if (areas.length === 0) return null;

  return (
    <Card className="border-amber-100 bg-amber-50/25">
      <CardHeader
        title="Areas still missing"
        description="Curriculum areas with no planned or delivered content yet."
      />
      <ul className="space-y-2">
        {areas.map((area) => (
          <li key={area.id} className="flex items-start gap-2 text-sm text-amber-950">
            <span aria-hidden>⚠</span>
            <span>{area.label}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
