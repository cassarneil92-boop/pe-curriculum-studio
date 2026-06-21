"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import type { IntelligenceRecommendation } from "@/lib/progress/intelligence-teacher-view";

interface RecommendedNextStepsProps {
  recommendations: IntelligenceRecommendation[];
}

export function RecommendedNextSteps({ recommendations }: RecommendedNextStepsProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Recommended next steps"
          description="Your curriculum balance looks good — keep delivering planned content."
        />
      </Card>
    );
  }

  return (
    <Card className="border-teal-100 bg-teal-50/20">
      <CardHeader title="Recommended next steps" description="What should you teach next?" />
      <ul className="space-y-4">
        {recommendations.map((rec) => (
          <li
            key={rec.id}
            className="flex flex-col gap-3 rounded-xl border border-white/80 bg-white/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-slate-900">{rec.title}</p>
              <p className="mt-0.5 text-sm text-slate-600">Reason: {rec.reason}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href={rec.lessonHref}>
                <Button variant="primary">Create Lesson</Button>
              </Link>
              <Link href={rec.schemeHref}>
                <Button variant="secondary">Create Scheme</Button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
