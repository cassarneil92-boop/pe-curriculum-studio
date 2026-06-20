import type { AssistantResponse, AssistantSchemeDraftSource, PlanningSequenceStep } from "@/lib/assistant/responses";
import { computeAssistantConfidence, type AssistantConfidenceReport } from "@/lib/assistant/assistant-confidence";
import { formatStructuredLessonActivities, buildLessonStructure, pickLessonTypesForCount } from "@/lib/assistant/lesson-structure-templates";
import { applyPedagogyToSchemeLessonActivities } from "@/lib/education/lesson-structures";
import {
  primaryRecommendedPedagogy,
  recommendPedagogies,
} from "@/lib/education/recommendations";
import { buildSchemePedagogicalQuality } from "@/lib/education/pedagogical-quality";
import {
  distributeOutcomesAcrossLessons,
  rankOutcomesForScheme,
} from "@/lib/assistant/outcome-distribution";
import { pickResourcesForLesson } from "@/lib/assistant/resource-generator";
import {
  buildAssistantSchemeQualityReport,
  type AssistantSchemeQualityReport,
} from "@/lib/assistant/scheme-quality";
import { buildIntelligentPlanningSequence } from "@/lib/assistant/sport-progressions";
import { createEmptyLesson, getLessonCompletionStatus } from "@/lib/scheme-builder/helpers";
import { markSchemeLessonPlanned } from "@/lib/progress/delivery";
import type { SchemeOfWork, SOWLesson, YearGroup } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { getPlanningTopicDisplayName, getPlanningSkillDisplayName } from "@/src/lib/curriculum/planning";

export type { AssistantSchemeDraftSource } from "@/lib/assistant/responses";

export type AssistantSchemeDraft = Omit<SchemeOfWork, "id" | "createdAt" | "updatedAt">;

export interface AssistantSchemeDraftResult {
  draft: AssistantSchemeDraft;
  needsReview: boolean;
  quality: AssistantSchemeQualityReport;
  confidence: AssistantConfidenceReport;
  pedagogicalQuality: import("@/lib/education/types").PedagogicalQualityReport;
  pedagogyRecommendations: import("@/lib/education/types").PedagogyRecommendation[];
}

function lessonWilf(successCriteria: string[], lessonIndex: number): string {
  if (successCriteria.length === 0) return "";
  const primary = successCriteria[lessonIndex % successCriteria.length];
  const secondary =
    successCriteria.length > 1
      ? successCriteria[(lessonIndex + 1) % successCriteria.length]
      : null;
  return secondary ? `${primary}\n${secondary}` : primary;
}

function buildLessonFromStep(
  step: PlanningSequenceStep,
  lessonIndex: number,
  outcomeIds: string[],
  successCriteria: string[],
  skillId: string,
  topicId: string,
  topicLabel: string,
  skillLabel: string
): SOWLesson {
  const lessonType = step.lessonType ?? pickLessonTypesForCount(lessonIndex + 1)[lessonIndex] ?? "skill-development";
  const template = buildLessonStructure(
    lessonType,
    topicLabel,
    skillLabel,
    step.sportPhase ?? step.focus
  );

  const lesson = createEmptyLesson(step.lessonNumber);
  return markSchemeLessonPlanned({
    ...lesson,
    skillId: skillId || undefined,
    learningOutcomeIds: outcomeIds,
    walt: step.waltExample?.trim() ?? "",
    wilf: lessonWilf(successCriteria, lessonIndex),
    activities: formatStructuredLessonActivities(template),
    resources: pickResourcesForLesson({
      topicId,
      skillId,
      lessonType,
      lessonIndex,
    }),
  });
}

export function buildAssistantSchemeDraft(
  source: AssistantSchemeDraftSource,
  response: Pick<
    AssistantResponse,
    | "planningSequence"
    | "suggestedTitle"
    | "suggestedLessonCount"
    | "successCriteria"
    | "waltExamples"
    | "matches"
  >
): AssistantSchemeDraftResult {
  const lessonCount = Math.max(
    response.planningSequence?.length ?? 0,
    response.suggestedLessonCount ?? 0,
    1
  );

  const topicLabel = getPlanningTopicDisplayName(source.topicId);
  const skillLabel = source.skillId
    ? getPlanningSkillDisplayName(source.skillId)
    : "the focus skill";

  const steps =
    response.planningSequence && response.planningSequence.length > 0
      ? response.planningSequence
      : buildIntelligentPlanningSequence({
          lessonCount,
          topicId: source.topicId,
          topicLabel,
          skillLabel,
        });

  const successCriteria = response.successCriteria ?? [];
  const rankedOutcomes = rankOutcomesForScheme(
    source.outcomeIds,
    source.topicId,
    source.skillId
  );
  const outcomeBuckets = distributeOutcomesAcrossLessons(rankedOutcomes, steps.length);

  const lessons = steps.map((step, index) => {
    const walt =
      step.waltExample?.trim() ||
      response.waltExamples?.[index % (response.waltExamples?.length ?? 1)] ||
      "";
    return buildLessonFromStep(
      { ...step, waltExample: walt },
      index,
      outcomeBuckets[index] ?? [],
      successCriteria,
      source.skillId,
      source.topicId,
      topicLabel,
      skillLabel
    );
  });

  const pedagogyRecommendations = recommendPedagogies({
    topicId: source.topicId,
    skillId: source.skillId,
    yearGroupId: source.yearGroupId,
    limit: 3,
  });
  const primaryPedagogy = primaryRecommendedPedagogy({
    topicId: source.topicId,
    skillId: source.skillId,
    yearGroupId: source.yearGroupId,
  });

  const lessonsWithPedagogy =
    primaryPedagogy
      ? lessons.map((lesson) => ({
          ...lesson,
          activities: applyPedagogyToSchemeLessonActivities(
            lesson.activities,
            primaryPedagogy,
            topicLabel
          ),
        }))
      : lessons;

  const draft: AssistantSchemeDraft = {
    title: response.suggestedTitle?.trim() || "Assistant scheme draft",
    classGroup: "",
    pathway: source.appPathways[0] ?? "general-pe",
    selectedPathways: source.appPathways,
    yearGroup: source.yearGroupId as YearGroup,
    topicId: source.topicId,
    skillId: source.skillId,
    term: source.term,
    plannedLessonCount: lessonsWithPedagogy.length,
    lessons: lessonsWithPedagogy,
    pedagogicalModels: primaryPedagogy ? [primaryPedagogy] : [],
    status: "draft",
  };

  const quality = buildAssistantSchemeQualityReport(draft);
  const pedagogicalQuality = buildSchemePedagogicalQuality(draft);
  const confidence = computeAssistantConfidence({
    matchCount: response.matches?.length ?? source.outcomeIds.length,
    outcomeIds: source.outcomeIds,
    topicId: source.topicId,
    lessonCount: lessons.length,
    outcomeBuckets,
  });

  const needsReview =
    lessons.some((lesson) => getLessonCompletionStatus(lesson) !== "complete") ||
    quality.percentage < 100;

  return { draft, needsReview, quality, confidence, pedagogicalQuality, pedagogyRecommendations };
}

export function duplicateAssistantSchemeDraft(
  draft: AssistantSchemeDraft,
  titleSuffix = " (copy)"
): AssistantSchemeDraft {
  const baseTitle = draft.title.trim() || "Scheme draft";
  const copyTitle = baseTitle.endsWith(titleSuffix.trim())
    ? `${baseTitle} 2`
    : `${baseTitle}${titleSuffix}`;

  return {
    ...draft,
    title: copyTitle,
    status: "draft",
    lessons: draft.lessons.map((lesson, index) =>
      markSchemeLessonPlanned({
        ...lesson,
        id: generateId(),
        lessonNumber: index + 1,
        deliveryStatus: "planned",
        deliveredDate: undefined,
        taughtOutcomeIds: [],
        reflection: undefined,
      })
    ),
  };
}

export function schemeDraftReviewMessage(needsReview: boolean): string | null {
  if (!needsReview) return null;
  return "Some lessons need teacher review before export.";
}
