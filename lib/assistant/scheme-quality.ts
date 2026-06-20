import { allLessonsHaveOutcomes } from "@/lib/assistant/outcome-distribution";
import {
  isValidLessonActivities,
  pickLessonTypesForCount,
  type LessonTemplateType,
} from "@/lib/assistant/lesson-structure-templates";
import type { AssistantSchemeDraft } from "@/lib/assistant/scheme-draft-builder";
import type { SOWLesson } from "@/lib/types";

export interface SchemeQualityCheck {
  id: string;
  label: string;
  met: boolean;
}

export interface SchemeQualityRecommendation {
  id: string;
  message: string;
}

export interface AssistantSchemeQualityReport {
  checks: SchemeQualityCheck[];
  score: number;
  percentage: number;
  recommendations: SchemeQualityRecommendation[];
}

function lessonHasWalt(lesson: SOWLesson): boolean {
  return Boolean(lesson.walt.trim());
}

function lessonHasWilf(lesson: SOWLesson): boolean {
  return Boolean(lesson.wilf.trim());
}

function lessonHasResources(lesson: SOWLesson): boolean {
  return lesson.resources.length > 0;
}

function lessonHasActivities(lesson: SOWLesson): boolean {
  return Boolean(lesson.activities.trim()) && isValidLessonActivities(lesson.activities);
}

function hasAssessmentLesson(lessons: SOWLesson[]): boolean {
  const types = pickLessonTypesForCount(lessons.length);
  const hasAssessmentType = types.includes("assessment");
  const lastLesson = lessons[lessons.length - 1];
  const lastLooksLikeAssessment =
    lastLesson?.walt.toLowerCase().includes("assess") ||
    lastLesson?.activities.toLowerCase().includes("assessment") ||
    lastLesson?.activities.toLowerCase().includes("review");

  return hasAssessmentType && Boolean(lastLesson && (lessonHasActivities(lastLesson) || lastLooksLikeAssessment));
}

function hasProgressiveSequence(lessons: SOWLesson[]): boolean {
  if (lessons.length < 2) return lessons.length === 1;
  const types = pickLessonTypesForCount(lessons.length);
  const expectedProgression: LessonTemplateType[] = ["introduction", "assessment"];
  return (
    types[0] === expectedProgression[0] &&
    types[types.length - 1] === expectedProgression[1]
  );
}

export function buildAssistantSchemeQualityReport(
  draft: AssistantSchemeDraft
): AssistantSchemeQualityReport {
  const lessons = draft.lessons;
  const outcomeBuckets = lessons.map((lesson) => lesson.learningOutcomeIds);

  const checks: SchemeQualityCheck[] = [
    {
      id: "outcomes-distributed",
      label: "Curriculum outcomes distributed",
      met: allLessonsHaveOutcomes(outcomeBuckets),
    },
    {
      id: "progressive-sequence",
      label: "Progressive lesson sequence",
      met: hasProgressiveSequence(lessons),
    },
    {
      id: "assessment-lesson",
      label: "Assessment lesson included",
      met: hasAssessmentLesson(lessons),
    },
    {
      id: "walt-present",
      label: "WALT present",
      met: lessons.every(lessonHasWalt),
    },
    {
      id: "wilf-present",
      label: "WILF present",
      met: lessons.every(lessonHasWilf),
    },
    {
      id: "activities-present",
      label: "Activities present",
      met: lessons.every(lessonHasActivities),
    },
    {
      id: "resources-present",
      label: "Resources present",
      met: lessons.every(lessonHasResources),
    },
  ];

  const metCount = checks.filter((check) => check.met).length;
  const score = metCount;
  const total = checks.length;
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);

  const recommendations: SchemeQualityRecommendation[] = [];
  for (const check of checks.filter((item) => !item.met)) {
    switch (check.id) {
      case "outcomes-distributed":
        recommendations.push({
          id: check.id,
          message: "Link at least one curriculum outcome to every lesson.",
        });
        break;
      case "assessment-lesson":
        recommendations.push({
          id: check.id,
          message: "Add a final assessment or consolidation lesson.",
        });
        break;
      case "activities-present":
        recommendations.push({
          id: check.id,
          message: "Ensure each lesson has warm up, main activity, and cool down sections.",
        });
        break;
      default:
        recommendations.push({
          id: check.id,
          message: `Review: ${check.label.toLowerCase()}.`,
        });
    }
  }

  return { checks, score, percentage, recommendations };
}
