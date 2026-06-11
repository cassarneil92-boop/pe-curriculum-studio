import type { LessonPlan } from "@/lib/types";

export interface QualityCheckItem {
  id: string;
  label: string;
  met: boolean;
}

export interface LessonQualityReport {
  items: QualityCheckItem[];
  score: number;
  total: number;
  percentage: number;
}

function hasStructuredOrLegacyActivities(lesson: LessonPlan): boolean {
  if ((lesson.structuredActivities ?? []).length > 0) return true;
  return Boolean(lesson.activities?.trim());
}

function hasProgressions(lesson: LessonPlan): boolean {
  return (lesson.structuredActivities ?? []).some((a) => a.progressions.some((p) => p.trim()));
}

function hasDifferentiation(lesson: LessonPlan): boolean {
  const structured = (lesson.structuredActivities ?? []).some(
    (a) => a.differentiationEasier.trim() || a.differentiationHarder.trim()
  );
  return structured || Boolean(lesson.differentiation?.trim());
}

function hasTeachingCues(lesson: LessonPlan): boolean {
  return (lesson.structuredActivities ?? []).some((a) => a.teachingCues.some((c) => c.trim()));
}

function hasLessonEnding(lesson: LessonPlan): boolean {
  if ((lesson.lessonEndings ?? []).length > 0) return true;
  return Boolean(lesson.assessmentNotes?.trim() || lesson.reflectionNotes?.trim());
}

export function buildLessonQualityReport(lesson: LessonPlan): LessonQualityReport {
  const items: QualityCheckItem[] = [
    {
      id: "curriculum",
      label: "Curriculum Reference",
      met: lesson.selectedLearningOutcomeIds.length > 0,
    },
    {
      id: "intentions",
      label: "Learning Intentions",
      met: Boolean(lesson.learningIntention?.trim()),
    },
    {
      id: "walt",
      label: "WALT",
      met: Boolean(lesson.walt?.trim()),
    },
    {
      id: "success",
      label: "Success Criteria",
      met: Boolean(lesson.successCriteria?.trim()),
    },
    {
      id: "activities",
      label: "Activities Present",
      met: hasStructuredOrLegacyActivities(lesson),
    },
    {
      id: "progressions",
      label: "Progressions Included",
      met: hasProgressions(lesson),
    },
    {
      id: "differentiation",
      label: "Differentiation Included",
      met: hasDifferentiation(lesson),
    },
    {
      id: "cues",
      label: "Teaching Cues Included",
      met: hasTeachingCues(lesson),
    },
    {
      id: "ending",
      label: "Lesson Ending Added",
      met: hasLessonEnding(lesson),
    },
  ];

  const score = items.filter((item) => item.met).length;
  const total = items.length;

  return {
    items,
    score,
    total,
    percentage: total === 0 ? 0 : Math.round((score / total) * 100),
  };
}
