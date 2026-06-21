"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import type { CurriculumAlert } from "@/lib/progress/intelligence-teacher-view";

interface CurriculumAlertsProps {
  alerts: CurriculumAlert[];
}

export function CurriculumAlerts({ alerts }: CurriculumAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <Card className="border-amber-100 bg-amber-50/25">
      <CardHeader title="Curriculum alerts" description="Meaningful gaps worth your attention." />
      <ul className="space-y-2">
        {alerts.map((alert) => (
          <li key={alert.id} className="flex items-start gap-2 text-sm text-amber-950">
            <span aria-hidden>⚠</span>
            <span>{alert.message}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
