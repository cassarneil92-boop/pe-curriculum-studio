import type { AssistantResponse, AssistantSchemeDraftSource, PlanningSequenceStep } from "@/lib/assistant/responses";
import { SOW_RESOURCE_OPTIONS } from "@/lib/scheme-builder/constants";
import { createEmptyLesson, getLessonCompletionStatus } from "@/lib/scheme-builder/helpers";
import { markSchemeLessonPlanned } from "@/lib/progress/delivery";
import type { SchemeOfWork, SOWLesson, YearGroup } from "@/lib/types";
import { generateId } from "@/lib/storage";

export type { AssistantSchemeDraftSource } from "@/lib/assistant/responses";

export type AssistantSchemeDraft = Omit<SchemeOfWork, "id" | "createdAt" | "updatedAt">;

export interface AssistantSchemeDraftResult {
  draft: AssistantSchemeDraft;
  needsReview: boolean;
}

const DEFAULT_RESOURCES = ["Cones", "Balls", "Bibs", "Whistle"];

function distributeOutcomes(outcomeIds: string[], lessonCount: number): string[][] {
  const buckets: string[][] = Array.from({ length: lessonCount }, () => []);
  if (outcomeIds.length === 0) return buckets;
  outcomeIds.forEach((id, index) => {
    buckets[index % lessonCount].push(id);
  });
  return buckets;
}

function formatLessonActivities(step: PlanningSequenceStep): string {
  return [
    `Lesson focus: ${step.focus}`,
    "",
    "Warm up:",
    "",
    `Main activity: ${step.activity}`,
    "",
    "Cool down:",
  ].join("\n");
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
  topicId: string
): SOWLesson {
  const lesson = createEmptyLesson(step.lessonNumber);
  return markSchemeLessonPlanned({
    ...lesson,
    skillId: skillId || undefined,
    learningOutcomeIds: outcomeIds,
    walt: step.waltExample?.trim() ?? "",
    wilf: lessonWilf(successCriteria, lessonIndex),
    activities: formatLessonActivities(step),
    resources: pickResourcesForTopic(topicId),
  });
}

export function buildAssistantSchemeDraft(
  source: AssistantSchemeDraftSource,
  response: Pick<
    AssistantResponse,
    "planningSequence" | "suggestedTitle" | "suggestedLessonCount" | "successCriteria" | "waltExamples"
  >
): AssistantSchemeDraftResult {
  const sequence = response.planningSequence ?? [];
  const lessonCount = Math.max(
    sequence.length,
    response.suggestedLessonCount ?? sequence.length,
    1
  );
  const steps =
    sequence.length > 0
      ? sequence
      : Array.from({ length: lessonCount }, (_, index) => ({
          lessonNumber: index + 1,
          focus: `Lesson ${index + 1}`,
          activity: "Main activity",
          waltExample: response.waltExamples?.[index % (response.waltExamples?.length ?? 1)],
        }));

  const successCriteria = response.successCriteria ?? [];
  const outcomeBuckets = distributeOutcomes(source.outcomeIds, steps.length);

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
      source.topicId
    );
  });

  const draft: AssistantSchemeDraft = {
    title: response.suggestedTitle?.trim() || "Assistant scheme draft",
    classGroup: "",
    pathway: source.appPathways[0] ?? "general-pe",
    selectedPathways: source.appPathways,
    yearGroup: source.yearGroupId as YearGroup,
    topicId: source.topicId,
    skillId: source.skillId,
    term: source.term,
    plannedLessonCount: lessons.length,
    lessons,
    status: "draft",
  };

  const needsReview = lessons.some((lesson) => getLessonCompletionStatus(lesson) !== "complete");

  return { draft, needsReview };
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

export function pickResourcesForTopic(topicId: string): string[] {
  const topic = topicId.toLowerCase();
  if (topic.includes("gymnastics") || topic.includes("athletics")) {
    return ["Cones", "Mats", "Timer", ...SOW_RESOURCE_OPTIONS.filter((r) => r !== "Balls")].slice(
      0,
      4
    );
  }
  return DEFAULT_RESOURCES;
}
