"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { buildLessonCoachingReport } from "@/lib/lesson-builder/curriculum-coaching";
import { PLANNING_COACH } from "@/lib/lesson-builder/planning-coach-labels";
import type { LessonPlan } from "@/lib/types";

interface LessonQualityChecklistProps {
  lesson: Pick<
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
  compact?: boolean;
}

export function LessonQualityChecklist({ lesson, compact = false }: LessonQualityChecklistProps) {
  const report = buildLessonCoachingReport(lesson as LessonPlan);

  if (compact) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
        <span className="font-semibold text-slate-700">Coaching: </span>
        <span className="text-teal-700">
          {report.strengths.length} strengths · {report.suggestions.length} to review
        </span>
        <span className="text-slate-400"> (advisory)</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader
        title={PLANNING_COACH.coachingTitle}
        description={`${report.mentorSummary} ${PLANNING_COACH.advisoryOnly}`}
      />

      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-lg font-bold text-teal-800">
          {report.strengths.length}/{report.strengths.length + report.suggestions.length}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">Planning readiness</p>
          <p className="text-xs text-slate-500">{report.percentage}% of checklist complete</p>
        </div>
      </div>

      {report.strengths.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Strengths
          </p>
          <ul className="space-y-1.5">
            {report.strengths.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm text-slate-800">
                <span className="text-emerald-600">✓</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.suggestions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
            Suggestions
          </p>
          <ul className="space-y-1.5">
            {report.suggestions.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-amber-600">⚠</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
