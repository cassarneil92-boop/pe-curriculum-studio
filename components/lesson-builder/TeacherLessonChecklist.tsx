"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { buildLessonQualityReport } from "@/lib/lesson-plans/quality-checklist";
import type { LessonPlan } from "@/lib/types";

type ChecklistInput = Pick<
  LessonPlan,
  | "selectedLearningOutcomeIds"
  | "learningIntention"
  | "successCriteria"
  | "structuredActivities"
  | "activities"
  | "differentiation"
  | "assessmentNotes"
  | "reflectionNotes"
  | "lessonEndings"
>;

function hasActivities(lesson: ChecklistInput): boolean {
  if ((lesson.structuredActivities ?? []).length > 0) return true;
  return Boolean(lesson.activities?.trim());
}

function hasDifferentiation(lesson: ChecklistInput): boolean {
  const structured = (lesson.structuredActivities ?? []).some(
    (a) => a.differentiationEasier.trim() || a.differentiationHarder.trim()
  );
  return structured || Boolean(lesson.differentiation?.trim());
}

function hasAssessment(lesson: ChecklistInput): boolean {
  if (lesson.assessmentNotes?.trim()) return true;
  return (lesson.lessonEndings ?? []).some(
    (e) =>
      e.type === "assessment" ||
      e.type === "quick-questioning" ||
      /assess|exit|check/i.test(e.title)
  );
}

function hasReflection(lesson: ChecklistInput): boolean {
  if (lesson.reflectionNotes?.trim()) return true;
  return (lesson.lessonEndings ?? []).some(
    (e) =>
      e.type === "reflection" ||
      /reflect|plenary|question/i.test(e.title) ||
      /what|how|why/i.test(e.content)
  );
}

const TEACHER_ITEMS = [
  { id: "curriculum", label: "Curriculum linked", check: (l: ChecklistInput) => l.selectedLearningOutcomeIds.length > 0 },
  { id: "intention", label: "Learning intention", check: (l: ChecklistInput) => Boolean(l.learningIntention?.trim()) },
  { id: "success", label: "Success criteria", check: (l: ChecklistInput) => Boolean(l.successCriteria?.trim()) },
  { id: "activity", label: "Activity", check: hasActivities },
  { id: "assessment", label: "Assessment", check: hasAssessment },
  { id: "inclusion", label: "Inclusion / differentiation", check: hasDifferentiation },
  { id: "reflection", label: "Reflection", check: hasReflection },
] as const;

interface TeacherLessonChecklistProps {
  lesson: ChecklistInput;
}

export function TeacherLessonChecklist({ lesson }: TeacherLessonChecklistProps) {
  const qualityReport = buildLessonQualityReport(lesson as LessonPlan);
  const metCount = TEACHER_ITEMS.filter((item) => item.check(lesson)).length;

  return (
    <Card padding={false} className="overflow-hidden">
      <CardHeader
        title="Lesson checklist"
        description={`${metCount} of ${TEACHER_ITEMS.length} complete · ${qualityReport.percentage}%`}
      />
      <ul className="space-y-0 border-t border-slate-100 px-4">
        {TEACHER_ITEMS.map((item) => {
          const met = item.check(lesson);
          return (
            <li
              key={item.id}
              className="flex items-center gap-2.5 border-b border-slate-50 px-4 py-2.5 last:border-0"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                  met ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                }`}
                aria-hidden
              >
                {met ? "✓" : "○"}
              </span>
              <span className={`text-sm ${met ? "text-slate-800" : "text-slate-500"}`}>
                {item.label}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
