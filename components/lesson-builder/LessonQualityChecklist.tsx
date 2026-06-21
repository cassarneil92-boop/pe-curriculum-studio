"use client";

import { LessonHealthSummary } from "@/components/lesson-builder/LessonHealthSummary";
import { AdvancedCoachingReview } from "@/components/lesson-builder/AdvancedCoachingReview";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { LessonPlan } from "@/lib/types";

type LessonQualityInput = Pick<
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
  | "topicId"
  | "yearGroup"
  | "pathwayId"
  | "selectedPathways"
  | "pedagogicalModels"
  | "equipment"
  | "skillId"
  | "duration"
>;

interface LessonQualityChecklistProps {
  lesson: LessonQualityInput;
  compact?: boolean;
  variant?: "sidebar" | "review";
  onApplyLesson?: (form: LessonBuilderFormData, message: string) => void;
}

export function LessonQualityChecklist({
  lesson,
  compact = false,
  variant = "review",
  onApplyLesson,
}: LessonQualityChecklistProps) {
  if (compact) {
    return <LessonHealthSummary lesson={lesson} compact />;
  }

  if (variant === "sidebar") {
    return null;
  }

  return (
    <div className="space-y-4">
      <LessonHealthSummary lesson={lesson} />
      <AdvancedCoachingReview
        lesson={lesson}
        showStructureCoach
        showPedagogyCoach
        onApplyLesson={onApplyLesson}
      />
    </div>
  );
}
