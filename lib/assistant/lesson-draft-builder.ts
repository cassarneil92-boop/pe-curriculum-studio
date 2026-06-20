import type { AssistantResponse, AssistantLessonDraftSource, AssistantLessonPreview } from "@/lib/assistant/responses";
import { buildLessonStructure, formatStructuredLessonActivities } from "@/lib/assistant/lesson-structure-templates";
import { pickResourcesForLesson } from "@/lib/assistant/resource-generator";
import { getSportProgression } from "@/lib/assistant/sport-progressions";
import type { OutcomeResolution } from "@/lib/assistant/topic-fallback";
import { applyPedagogyToSchemeLessonActivities } from "@/lib/education/lesson-structures";
import { getPedagogyKnowledge } from "@/lib/education/knowledge-library";
import { primaryRecommendedPedagogy, recommendPedagogies } from "@/lib/education/recommendations";
import { createEmptyActivity } from "@/lib/lesson-plans/pe-template";
import { primaryCurriculumPathwayFromApp } from "@/lib/lesson-plans/helpers";
import { buildWaltIdeas, SOW_WILF_CARDS } from "@/lib/scheme-builder/constants";
import type { PathwayId } from "@/lib/types";
import { PATHWAYS } from "@/lib/constants";
import type { LessonPlan } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { getYearGroupLabel } from "@/lib/year-groups";
import { getPlanningSkillDisplayName, getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";

export function buildAssistantLessonPreview(input: {
  requestedTopicId: string;
  resolvedTopicId: string;
  topicLabel: string;
  yearGroup: YearGroupId;
  skillId: string;
  outcomeResolution: OutcomeResolution;
}): AssistantLessonPreview {
  const sport = getSportProgression(input.requestedTopicId);
  const skillLabel =
    input.skillId ? getPlanningSkillDisplayName(input.skillId) : "the focus skill";
  const sportPhase = sport?.phases[0];
  const template = buildLessonStructure(
    "introduction",
    input.topicLabel,
    skillLabel,
    sportPhase
  );

  const walts = buildWaltIdeas(input.topicLabel, skillLabel);
  const wilf = [SOW_WILF_CARDS[0], SOW_WILF_CARDS[2], SOW_WILF_CARDS[4]].join("\n");

  const primaryPedagogy = primaryRecommendedPedagogy({
    topicId: input.resolvedTopicId,
    skillId: input.skillId,
    yearGroupId: input.yearGroup,
  });

  let activities = formatStructuredLessonActivities(template);
  if (primaryPedagogy) {
    activities = applyPedagogyToSchemeLessonActivities(
      activities,
      primaryPedagogy,
      input.topicLabel
    );
  }

  const resources = pickResourcesForLesson({
    topicId: input.requestedTopicId,
    skillId: input.skillId,
    lessonType: "introduction",
    lessonIndex: 0,
  });

  return {
    title: `${input.topicLabel} lesson — ${getYearGroupLabel(input.yearGroup)}`,
    walt: walts[0] ?? `We are learning to develop skills in ${input.topicLabel.toLowerCase()}.`,
    wilf,
    warmUp: template.warmUp,
    mainActivity: template.mainActivity,
    coolDown: template.coolDown,
    activities,
    resources,
    topicMappingNote: input.outcomeResolution.topic.mappingNote ?? undefined,
    needsReview: input.outcomeResolution.topic.needsReview,
    pedagogicalApproach: primaryPedagogy
      ? getPedagogyKnowledge(primaryPedagogy)?.name
      : undefined,
  };
}

export function buildAssistantLessonDraftSource(input: {
  yearGroup: YearGroupId;
  appPathways: PathwayId[];
  requestedTopicId: string;
  resolvedTopicId: string;
  skillId: string;
  outcomeResolution: OutcomeResolution;
}): AssistantLessonDraftSource {
  const primaryPedagogy = primaryRecommendedPedagogy({
    topicId: input.resolvedTopicId,
    skillId: input.skillId,
    yearGroupId: input.yearGroup,
  });

  const outcomeIds = (input.outcomeResolution.ranked.length > 0
    ? input.outcomeResolution.ranked
    : input.outcomeResolution.outcomes
  )
    .slice(0, 4)
    .map((o) => o.id);

  return {
    yearGroupId: input.yearGroup,
    appPathways: input.appPathways,
    topicId: input.requestedTopicId,
    resolvedTopicId: input.resolvedTopicId,
    skillId: input.skillId,
    outcomeIds,
    pedagogicalModelId: primaryPedagogy ?? undefined,
  };
}

export function buildAssistantLessonDraft(
  source: AssistantLessonDraftSource,
  preview: AssistantLessonPreview
): Omit<LessonPlan, "id" | "createdAt" | "updatedAt"> {
  const structuredActivities = [
    {
      ...createEmptyActivity(1),
      name: "Warm up",
      taskDescription: preview.warmUp,
      spaceEquipment: preview.resources.join(", "),
    },
    {
      ...createEmptyActivity(2),
      name: "Main activity",
      taskDescription: preview.mainActivity,
      spaceEquipment: preview.resources.join(", "),
    },
    {
      ...createEmptyActivity(3),
      name: "Cool down",
      taskDescription: preview.coolDown,
      spaceEquipment: "",
    },
  ];

  return {
    title: preview.title,
    date: "",
    classGroup: "",
    yearGroup: source.yearGroupId,
    duration: 60,
    pathwayId: primaryCurriculumPathwayFromApp(source.appPathways),
    topicId: source.topicId,
    skillId: source.skillId,
    selectedPathways: source.appPathways,
    learningIntention: preview.walt,
    walt: preview.walt,
    successCriteria: preview.wilf,
    equipment: preview.resources.join(", "),
    safetyConsiderations: "",
    differentiation: "",
    activities: preview.activities,
    assessmentNotes: "",
    reflectionNotes: preview.coolDown,
    selectedLearningOutcomeIds: source.outcomeIds,
    structuredActivities,
    lessonEndings: [],
    pedagogicalModels: source.pedagogicalModelId ? [source.pedagogicalModelId] : [],
  };
}

export function buildCreateLessonAssistantResponse(input: {
  parsedTopicLabel: string | null;
  yearGroup: YearGroupId;
  appPathways: PathwayId[];
  topicId: string;
  outcomeResolution: OutcomeResolution;
  confidence: string;
}): Pick<
  AssistantResponse,
  | "answer"
  | "detectedContext"
  | "matches"
  | "lessonPreview"
  | "lessonDraftSource"
  | "pedagogyRecommendations"
  | "relatedOutcomeCodes"
  | "relatedTopicIds"
  | "suggestions"
  | "actions"
> {
  const { topic, ranked, primarySkillId } = input.outcomeResolution;
  const displayLabel = input.parsedTopicLabel ?? getPlanningTopicDisplayName(topic.requestedTopicId);
  const skillId = primarySkillId;

  const preview = buildAssistantLessonPreview({
    requestedTopicId: topic.requestedTopicId,
    resolvedTopicId: topic.resolvedTopicId,
    topicLabel: displayLabel,
    yearGroup: input.yearGroup,
    skillId,
    outcomeResolution: input.outcomeResolution,
  });

  const lessonDraftSource = buildAssistantLessonDraftSource({
    yearGroup: input.yearGroup,
    appPathways: input.appPathways,
    requestedTopicId: topic.requestedTopicId,
    resolvedTopicId: topic.resolvedTopicId,
    skillId,
    outcomeResolution: input.outcomeResolution,
  });

  const matches = ranked.slice(0, 8).map((o) => ({
    code: o.code,
    description: o.description,
    topicLabel: getPlanningTopicDisplayName(o.topicIds[0] ?? topic.resolvedTopicId),
  }));

  const mappingSentence = topic.mappingNote ? `\n\n${topic.mappingNote}` : "";
  const reviewSentence = topic.needsReview
    ? " Review curriculum alignment before saving."
    : "";

  const pedagogyRecommendations = recommendPedagogies({
    topicId: topic.resolvedTopicId,
    skillId,
    yearGroupId: input.yearGroup,
    limit: 3,
  });

  const lessonBuilderHref = `/lesson-builder?yearGroup=${input.yearGroup}&topic=${topic.requestedTopicId}&skill=${skillId}`;

  return {
    answer: `Here is a **${displayLabel}** lesson preview for **${getYearGroupLabel(input.yearGroup)}** with WALT, WILF, activities, resources, and nearest matching curriculum outcomes.${mappingSentence}${reviewSentence}`,
    detectedContext: {
      intent: "Create lesson",
      yearGroup: getYearGroupLabel(input.yearGroup),
      pathways: input.appPathways.map(
        (id) => PATHWAYS.find((p) => p.id === id)?.label ?? id
      ),
      topic: displayLabel,
      confidence: input.confidence,
    },
    matches,
    lessonPreview: preview,
    lessonDraftSource,
    pedagogyRecommendations,
    relatedOutcomeCodes: matches.map((m) => m.code),
    relatedTopicIds: [topic.requestedTopicId, topic.resolvedTopicId],
    suggestions: [
      "Save this as a lesson draft",
      `Create a 6 lesson ${displayLabel} scheme`,
      "Open in Lesson Builder",
    ],
    actions: [
      { label: "Open in Lesson Builder", href: lessonBuilderHref, variant: "primary" },
      { label: "Save as lesson draft", href: "/lessons", variant: "secondary" },
    ],
  };
}
