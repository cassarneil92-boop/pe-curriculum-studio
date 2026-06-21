"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import type { PlanningInsightAction } from "@/lib/progress/planning-insights-view";

interface SuggestedNextStepsProps {
  steps: PlanningInsightAction[];
}

export function SuggestedNextSteps({ steps }: SuggestedNextStepsProps) {
  if (steps.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Suggested next steps"
          description="Your planning looks balanced — keep delivering your current schemes."
        />
      </Card>
    );
  }

  return (
    <Card className="border-teal-100 bg-teal-50/20">
      <CardHeader title="Suggested next steps" description="What should you teach next?" />
      <ul className="space-y-4">
        {steps.map((step) => (
          <li
            key={step.id}
            className="rounded-xl border border-white/80 bg-white/90 px-4 py-3"
          >
            <p className="font-medium text-slate-900">{step.message}</p>
            {step.detail && <p className="mt-1 text-sm text-slate-600">{step.detail}</p>}
            <Link href={step.actionHref} className="mt-3 inline-block">
              <Button variant="primary">{step.actionLabel}</Button>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
