"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { buildCurriculumMemoryInsight } from "@/lib/lesson-builder/curriculum-memory";
import { PLANNING_COACH } from "@/lib/lesson-builder/planning-coach-labels";
import type { LessonPlan } from "@/lib/types";

interface CurriculumMemoryPanelProps {
  savedLessons: Pick<
    LessonPlan,
    "id" | "title" | "date" | "topicId" | "skillId" | "selectedLearningOutcomeIds"
  >[];
  currentLessonId: string | null;
  topicId: string;
  topicName: string;
  skillId: string;
}

export function CurriculumMemoryPanel({
  savedLessons,
  currentLessonId,
  topicId,
  topicName,
  skillId,
}: CurriculumMemoryPanelProps) {
  const insight = buildCurriculumMemoryInsight({
    savedLessons,
    currentLessonId,
    topicId,
    topicName,
    skillId,
  });

  if (!insight) return null;

  return (
    <Card className="border-teal-100 bg-teal-50/20">
      <CardHeader
        title={PLANNING_COACH.memoryTitle}
        description={`Based on your saved lessons in ${insight.unitTopicName} — local data only.`}
      />

      {insight.priorLessons.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recent unit lessons
          </p>
          <ul className="space-y-1.5 text-sm text-slate-700">
            {insight.priorLessons.map((lesson) => (
              <li key={`${lesson.title}-${lesson.date}`}>
                {lesson.title} · {lesson.skillName}
                {lesson.date ? ` · ${lesson.date}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="space-y-2 text-sm">
        {insight.suggestedNextFocus && (
          <li className="rounded-lg border border-teal-100 bg-white px-3 py-2 text-teal-900">
            <span className="font-medium">Suggested learning focus:</span>{" "}
            {insight.suggestedNextFocus}
          </li>
        )}
        {insight.suggestedProgression && (
          <li className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-slate-700">
            <span className="font-medium">Suggested progression:</span>{" "}
            {insight.suggestedProgression}
          </li>
        )}
        {insight.suggestedFollowUpLesson && (
          <li className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-slate-700">
            <span className="font-medium">Follow-up lesson:</span>{" "}
            {insight.suggestedFollowUpLesson}
          </li>
        )}
        {insight.suggestedAssessmentLesson && (
          <li className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-slate-700">
            <span className="font-medium">Assessment lesson:</span>{" "}
            {insight.suggestedAssessmentLesson}
          </li>
        )}
      </ul>
    </Card>
  );
}
