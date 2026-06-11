"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { buildLessonQualityReport } from "@/lib/lesson-plans/quality-checklist";
import type { LessonPlan } from "@/lib/types";

interface LessonQualityChecklistProps {
  lesson: Pick<
    LessonPlan,
    | "selectedLearningOutcomeIds"
    | "learningIntention"
    | "walt"
    | "successCriteria"
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
  const report = buildLessonQualityReport(lesson as LessonPlan);

  if (compact) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
        <span className="font-semibold text-slate-700">Quality: </span>
        <span className="text-teal-700">
          {report.score} / {report.total}
        </span>
        <span className="text-slate-400"> (advisory)</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Lesson quality checklist"
        description="Advisory only — nothing here blocks saving. Use it as a planning guide."
      />
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-xl font-bold text-teal-800">
          {report.score}/{report.total}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">Lesson Quality Score</p>
          <p className="text-xs text-slate-500">{report.percentage}% complete</p>
        </div>
      </div>
      <ul className="space-y-2">
        {report.items.map((item) => (
          <li
            key={item.id}
            className={`flex items-center gap-2 text-sm ${
              item.met ? "text-slate-800" : "text-slate-400"
            }`}
          >
            <span className={item.met ? "text-emerald-600" : "text-slate-300"}>
              {item.met ? "✓" : "○"}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </Card>
  );
}
