"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { buildLessonCoachingReport } from "@/lib/lesson-builder/curriculum-coaching";
import { buildLessonHealthSummary } from "@/lib/lesson-builder/lesson-health";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { LessonPlan } from "@/lib/types";

type LessonHealthInput = Pick<
  LessonPlan,
  | "selectedLearningOutcomeIds"
  | "learningIntention"
  | "walt"
  | "successCriteria"
  | "safetyConsiderations"
  | "structuredActivities"
  | "activities"
  | "differentiation"
  | "lessonEndings"
  | "assessmentNotes"
  | "reflectionNotes"
>;

interface LessonHealthSummaryProps {
  lesson: LessonHealthInput;
  compact?: boolean;
}

const STATUS_COLORS = {
  needs_work: "bg-rose-50 text-rose-800 border-rose-100",
  developing: "bg-amber-50 text-amber-800 border-amber-100",
  strong: "bg-teal-50 text-teal-800 border-teal-100",
  excellent: "bg-emerald-50 text-emerald-800 border-emerald-100",
} as const;

export function LessonHealthSummary({ lesson, compact = false }: LessonHealthSummaryProps) {
  const report = buildLessonCoachingReport(lesson as LessonPlan);
  const health = buildLessonHealthSummary(report);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
        <span className="font-semibold text-slate-700">Lesson health:</span>
        <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_COLORS[health.status]}`}>
          {health.statusLabel}, {health.percentage}%
        </span>
        {health.improvements.length > 0 && (
          <span className="text-slate-500">
            · {health.improvements.length} improvement{health.improvements.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Lesson health"
        description="A quick summary of how ready your lesson is for delivery."
      />

      <div className="mb-5 flex items-center gap-4">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl border text-lg font-bold ${STATUS_COLORS[health.status]}`}
        >
          {health.percentage}%
        </div>
        <div>
          <p className="text-base font-semibold text-slate-900">{health.statusLabel}</p>
          <p className="text-sm text-slate-500">Based on your lesson planning checklist</p>
        </div>
      </div>

      {health.strengths.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Strengths
          </p>
          <ul className="space-y-1.5">
            {health.strengths.map((label) => (
              <li key={label} className="flex items-center gap-2 text-sm text-slate-800">
                <span className="text-emerald-600">✓</span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {health.improvements.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
            Priority improvements
          </p>
          <ul className="space-y-1.5">
            {health.improvements.map((label) => (
              <li key={label} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-amber-600">→</span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {health.strengths.length === 0 && health.improvements.length === 0 && (
        <p className="text-sm text-slate-500">
          Start adding curriculum outcomes and learning design to see your lesson health.
        </p>
      )}
    </Card>
  );
}
