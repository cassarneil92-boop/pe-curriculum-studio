"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card, CardHeader } from "@/components/ui/Card";
import type { PriorityTopic } from "@/lib/progress/teaching-progress-ui";

export function ImmediatePriorities({ priorities }: { priorities: PriorityTopic[] }) {
  if (priorities.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Immediate priorities"
          description="Topics with the lowest delivery coverage."
        />
        <p className="text-sm text-slate-500">
          No priority gaps detected — your lowest-covered topics are in good shape.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Immediate priorities"
        description="Focus on these topics next — lowest delivery coverage in your curriculum."
      />
      <ul className="divide-y divide-slate-100">
        {priorities.map((item) => (
          <li key={item.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{item.topic}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {item.remaining} outcome{item.remaining === 1 ? "" : "s"} remaining
              </p>
            </div>
            <div className="w-full sm:w-48">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">{item.coveragePercent}%</span>
              </div>
              <ProgressBar
                value={item.coveragePercent}
                max={100}
                showPercent={false}
                variant={item.coveragePercent === 0 ? "rose" : "amber"}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
