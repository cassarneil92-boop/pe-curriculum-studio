"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { buildLessonStructureReport } from "@/lib/lesson-builder/lesson-structure-coach";
import { PLANNING_COACH } from "@/lib/lesson-builder/planning-coach-labels";
import type { LessonPlan } from "@/lib/types";

interface LessonStructureCoachProps {
  lesson: Pick<LessonPlan, "structuredActivities" | "lessonEndings" | "duration">;
}

export function LessonStructureCoach({ lesson }: LessonStructureCoachProps) {
  const report = buildLessonStructureReport(lesson);

  if ((lesson.structuredActivities ?? []).length === 0) {
    return (
      <Card>
        <CardHeader
          title={PLANNING_COACH.structureTitle}
          description="Add activity blocks to receive professional structure feedback."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={PLANNING_COACH.structureTitle}
        description={`${PLANNING_COACH.advisoryOnly} Lesson duration: ${report.lessonDuration} mins${
          report.totalPlannedMinutes !== null
            ? ` · Planned: ${report.totalPlannedMinutes} mins`
            : ""
        }`}
      />

      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Current lesson
        </p>
        <ul className="space-y-2">
          {report.timeline.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm"
            >
              <span className="font-medium text-slate-800">{item.name}</span>
              <span className="text-xs text-slate-500">
                {item.minutes !== null ? `${item.minutes} mins` : "Time not set"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {report.feedback.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Professional insight
          </p>
          <ul className="space-y-1.5">
            {report.feedback.map((item) => (
              <li
                key={item.id}
                className={`text-sm ${
                  item.severity === "warning" ? "text-amber-800" : "text-slate-600"
                }`}
              >
                {item.severity === "warning" ? "⚠ " : "ℹ "}
                {item.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.recommendations.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recommended adjustments
          </p>
          <ul className="space-y-1.5">
            {report.recommendations.map((item) => (
              <li key={item.id} className="text-sm text-teal-800">
                → {item.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.feedback.length === 0 && report.recommendations.length === 0 && (
        <p className="text-sm text-emerald-700">
          ✓ Lesson structure looks well balanced for delivery.
        </p>
      )}
    </Card>
  );
}
