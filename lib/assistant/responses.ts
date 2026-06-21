import type { CalendarEntry, LessonPlan, PathwayId, SchemeOfWork } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { getYearGroupLabel } from "@/lib/year-groups";
import { PATHWAYS } from "@/lib/constants";
import { buildSchemesLink } from "@/lib/curriculum-hub/planning-links";
import { buildIntelligentPlanningSequence } from "@/lib/assistant/sport-progressions";
import { buildWaltIdeas, SOW_WILF_CARDS } from "@/lib/scheme-builder/constants";
import { detectPedagogyQuery, handlePedagogyQuery } from "@/lib/education/pedagogy-queries";
import { recommendPedagogies } from "@/lib/education/recommendations";
import type { KnowledgeSource, PedagogyRecommendation } from "@/lib/education/types";
import { suggestedSchemeTitle } from "@/lib/scheme-builder/helpers";
import type { TeacherContextSnapshot } from "@/lib/teacher-context";
import {
  filterPlanningOutcomes,
  getPlanningOutcomes,
  getPlanningOutcomeSuggestions,
  getPlanningTopicDisplayName,
  getPlanningTopicOptions,
} from "@/src/lib/curriculum/planning";
import type { LearningOutcome } from "@/src/lib/curriculum/types";
import { buildCurriculumAnalytics } from "@/src/lib/intelligence/analytics/coverage-analytics";
import { buildSchemeAdvisoryAlignment } from "@/src/lib/intelligence/advisory/scheme-alignment";
import { PEDAGOGICAL_MODELS } from "@/src/lib/intelligence/frameworks/pedagogical-models";
import { buildCreateLessonAssistantResponse } from "@/lib/assistant/lesson-draft-builder";
import { resolveCurriculumSkillId } from "@/lib/curriculum-hub/planning-links";
import { handlePrimaryPEAssistantQuery } from "@/lib/assistant/primary-pe-queries";
import { handleFitnessAssistantQuery } from "@/lib/assistant/fitness-pe-queries";
import { handleSecPeAssistantQuery } from "@/lib/assistant/sec-pe-queries";
import { handleSportAssistantQuery } from "@/lib/assistant/sport-pe-queries";
import { resolveOutcomesForTopic } from "@/lib/assistant/topic-fallback";
import { isPlanningCreationIntent } from "@/lib/assistant/query-parser";
import type { ParsedAssistantQuery } from "./query-parser";
import { parseAssistantQuery } from "./query-parser";
import type { EducationPedagogyId } from "@/lib/education/types";
import { SUGGESTED_PROMPT_CHIPS } from "./synonyms";

export interface DetectedContext {
  intent: string;
  yearGroup?: string;
  pathways?: string[];
  topic?: string;
  lessonCount?: number;
  confidence: string;
}

export interface CurriculumMatch {
  code: string;
  description: string;
  topicLabel: string;
}

export interface PlanningSequenceStep {
  lessonNumber: number;
  focus: string;
  activity: string;
  waltExample?: string;
  lessonType?: import("@/lib/assistant/lesson-structure-templates").LessonTemplateType;
  sportPhase?: string;
}

export interface AssistantAction {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

export interface AssistantSchemeDraftSource {
  yearGroupId: YearGroupId;
  appPathways: PathwayId[];
  topicId: string;
  skillId: string;
  term: string;
  outcomeIds: string[];
}

export interface AssistantLessonPreview {
  title: string;
  walt: string;
  wilf: string;
  warmUp: string;
  mainActivity: string;
  coolDown: string;
  activities: string;
  resources: string[];
  assessmentNotes: string;
  reflectionPrompt: string;
  topicMappingNote?: string;
  needsReview?: boolean;
  pedagogicalApproach?: string;
}

export interface AssistantLessonDraftSource {
  yearGroupId: YearGroupId;
  appPathways: PathwayId[];
  topicId: string;
  resolvedTopicId: string;
  skillId: string;
  outcomeIds: string[];
  pedagogicalModelId?: EducationPedagogyId;
}

export interface AssistantResponse {
  answer: string;
  /** Distinguishes draft output from information-only responses. */
  responseMode?: "lesson-draft" | "scheme-draft" | "curriculum-query";
  detectedContext?: DetectedContext;
  matches?: CurriculumMatch[];
  planningSequence?: PlanningSequenceStep[];
  waltExamples?: string[];
  successCriteria?: string[];
  suggestedTitle?: string;
  suggestedLessonCount?: number;
  schemeDraftSource?: AssistantSchemeDraftSource;
  lessonPreview?: AssistantLessonPreview;
  lessonDraftSource?: AssistantLessonDraftSource;
  relatedOutcomeCodes: string[];
  relatedTopicIds: string[];
  suggestions: string[];
  actions?: AssistantAction[];
  partialMatch?: boolean;
  relatedTopics?: string[];
  relatedPathways?: string[];
  relatedYearGroups?: string[];
  pedagogySources?: KnowledgeSource[];
  pedagogyRecommendations?: PedagogyRecommendation[];
}

export interface AssistantQueryContext {
  teacherContext: TeacherContextSnapshot;
  lessons: LessonPlan[];
  schemes: SchemeOfWork[];
  calendar?: CalendarEntry[];
  activeScheme?: SchemeOfWork;
}

const DEFAULT_LESSON_COUNT = 6;

function buildPlanningSequence(
  lessonCount: number,
  topicId: string,
  topicLabel: string,
  skillLabel: string
): PlanningSequenceStep[] {
  return buildIntelligentPlanningSequence({
    lessonCount,
    topicId,
    topicLabel,
    skillLabel,
  });
}

function resolveAppPathways(
  parsed: ParsedAssistantQuery,
  context: TeacherContextSnapshot,
  yearGroup: YearGroupId
): PathwayId[] {
  const visible = context.visibleAppPathways;
  const requested = parsed.pathwayIds;

  if (requested.length > 0) {
    const filtered = requested.filter(
      (p) => visible.includes(p) || context.exploreAllEnabled
    );
    if (filtered.length > 0) return filtered;
  }

  const primaryYears = new Set<YearGroupId>([
    "year-1",
    "year-2",
    "year-3",
    "year-4",
    "year-5",
    "year-6",
  ]);
  if (primaryYears.has(yearGroup) && visible.includes("primary-pe")) {
    return ["primary-pe"];
  }

  if (visible.length > 0) return visible;
  return context.teacher.pathways.length > 0 ? context.teacher.pathways : ["general-pe"];
}

function resolveYearGroup(
  parsed: ParsedAssistantQuery,
  context: TeacherContextSnapshot
): YearGroupId {
  if (parsed.yearGroupId) return parsed.yearGroupId;
  const teacherYear = context.teacher.yearGroups[0];
  if (teacherYear) return teacherYear;
  return "year-9";
}

function pathwayLabels(ids: PathwayId[]): string[] {
  return ids.map((id) => PATHWAYS.find((p) => p.id === id)?.label ?? id);
}

function intentLabel(intent: ParsedAssistantQuery["intent"]): string {
  const labels: Record<ParsedAssistantQuery["intent"], string> = {
    "find-outcomes": "Find curriculum outcomes",
    "create-lesson": "Create lesson",
    "create-scheme": "Create scheme of work",
    "suggest-lessons": "Suggest lesson ideas",
    activities: "Suggest activities",
    "show-gaps": "Show teaching gaps",
    coverage: "Coverage overview",
    "missing-scheme": "Scheme gap analysis",
    unknown: "General curriculum query",
  };
  return labels[intent];
}

function toMatches(outcomes: LearningOutcome[], limit = 8): CurriculumMatch[] {
  return outcomes.slice(0, limit).map((o) => ({
    code: o.code,
    description: o.description,
    topicLabel: getPlanningTopicDisplayName(o.topicIds[0] ?? ""),
  }));
}


function findClosestTopics(
  query: string,
  appPathways: PathwayId[],
  yearGroup: YearGroupId,
  context: TeacherContextSnapshot
): { id: string; label: string; score: number }[] {
  const q = query.toLowerCase();
  const options = getPlanningTopicOptions(appPathways, yearGroup, context);

  return options
    .map((topic) => {
      const label = topic.label.toLowerCase();
      const id = topic.id.toLowerCase();
      let score = 0;
      if (q.includes(label)) score += 100;
      if (q.includes(id.replace(/-/g, " "))) score += 80;
      for (const word of label.split(/\s+/)) {
        if (word.length > 3 && q.includes(word)) score += 20;
      }
      return { id: topic.id, label: topic.label, score };
    })
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function buildPartialMatchResponse(
  parsed: ParsedAssistantQuery,
  appPathways: PathwayId[],
  yearGroup: YearGroupId,
  context: TeacherContextSnapshot
): AssistantResponse {
  const closestTopics = findClosestTopics(parsed.raw, appPathways, yearGroup, context);
  const pathwayOptions = pathwayLabels(appPathways);
  const yearOptions = ["Year 3", "Year 9", "Form 5"].filter(Boolean);

  const correctedPrompts = [
    closestTopics[0]
      ? `Find ${getYearGroupLabel(yearGroup)} ${closestTopics[0].label} outcomes`
      : `Find Year 9 Volleyball outcomes`,
    closestTopics[0] && parsed.pathwayIds.length > 0
      ? `Create a 6 lesson SOW for ${getYearGroupLabel(yearGroup)} ${pathwayLabels(parsed.pathwayIds)[0]} ${closestTopics[0].label}`
      : `Create a 6 lesson SOW for Form 5 ALP Basketball`,
    "What have I not taught yet?",
  ];

  return {
    answer:
      "I could not find an exact match, but I found related areas you can explore.",
    partialMatch: true,
    detectedContext: {
      intent: intentLabel(parsed.intent),
      yearGroup: parsed.yearGroupId ? getYearGroupLabel(parsed.yearGroupId) : undefined,
      pathways: parsed.pathwayIds.length > 0 ? pathwayLabels(parsed.pathwayIds) : pathwayOptions.slice(0, 3),
      topic: parsed.topicLabel ?? undefined,
      confidence: parsed.confidence,
    },
    relatedTopics: closestTopics.map((t) => t.label),
    relatedPathways: pathwayOptions.slice(0, 4),
    relatedYearGroups: yearOptions,
    suggestions: correctedPrompts,
    relatedOutcomeCodes: [],
    relatedTopicIds: closestTopics.map((t) => t.id),
    actions: closestTopics[0]
      ? [
          {
            label: `Browse ${closestTopics[0].label} outcomes`,
            href: `/schemes?create=1&yearGroup=${yearGroup}&topic=${closestTopics[0].id}&selectedPathways=${appPathways.join(",")}`,
            variant: "secondary",
          },
        ]
      : undefined,
  };
}

function respondToOutcomeCode(code: string): AssistantResponse | null {
  const key = code.toUpperCase();
  const unique = getPlanningOutcomes().filter(
    (o) => o.code.toUpperCase() === key || o.code.toUpperCase().includes(key)
  );

  if (unique.length === 0) return null;
  const matches = toMatches(unique, 10);

  return {
    answer: `Found ${unique.length} official curriculum outcome(s) for code **${code}**.`,
    detectedContext: {
      intent: "Find curriculum outcomes",
      confidence: "high",
    },
    matches,
    relatedOutcomeCodes: matches.map((m) => m.code),
    relatedTopicIds: [...new Set(unique.flatMap((o) => o.topicIds))],
    suggestions: ["Add these outcomes manually in Lesson Builder or Scheme Builder."],
  };
}

function respondToPlanningCreation(
  parsed: ParsedAssistantQuery,
  context: AssistantQueryContext
): AssistantResponse | null {
  if (!isPlanningCreationIntent(parsed.intent)) return null;

  const { teacherContext } = context;
  const yearGroup = resolveYearGroup(parsed, teacherContext);
  const appPathways = resolveAppPathways(parsed, teacherContext, yearGroup);

  let topicId = parsed.topicId;
  let topicLabel = parsed.topicLabel;

  if (!topicId) {
    const closestTopics = findClosestTopics(parsed.raw, appPathways, yearGroup, teacherContext);
    if (!closestTopics[0]) return null;
    topicId = closestTopics[0].id;
    topicLabel = closestTopics[0].label;
  }

  const outcomeResolution = resolveOutcomesForTopic({
    appPathways,
    yearGroup,
    topicId,
    context: teacherContext,
  });

  const detected: DetectedContext = {
    intent: intentLabel(parsed.intent),
    yearGroup: getYearGroupLabel(yearGroup),
    pathways: pathwayLabels(appPathways),
    topic: topicLabel ?? getPlanningTopicDisplayName(topicId),
    lessonCount: parsed.lessonCount ?? undefined,
    confidence: parsed.confidence,
  };

  if (parsed.intent === "create-lesson") {
    const skillId = parsed.skillHint
      ? resolveCurriculumSkillId(parsed.skillHint)
      : outcomeResolution.primarySkillId;
    const lessonResponse = buildCreateLessonAssistantResponse({
      parsedTopicLabel: topicLabel ?? getPlanningTopicDisplayName(topicId),
      yearGroup,
      appPathways,
      topicId,
      outcomeResolution: {
        ...outcomeResolution,
        primarySkillId: skillId,
      },
      confidence: parsed.confidence,
    });
    return {
      ...lessonResponse,
      responseMode: "lesson-draft",
      detectedContext: detected,
    };
  }

  const resolvedTopicId = outcomeResolution.topic.resolvedTopicId;
  const displayTopicLabel =
    topicLabel ?? getPlanningTopicDisplayName(resolvedTopicId);
  const outcomes = outcomeResolution.outcomes;
  const ranked = outcomeResolution.ranked;
  const suggestions_result = getPlanningOutcomeSuggestions({
    appPathways,
    yearGroup,
    topicId: resolvedTopicId,
    skillId: outcomeResolution.primarySkillId,
    context: teacherContext,
  });
  const rankedForScheme =
    ranked.length > 0 ? ranked : [...suggestions_result.strict, ...suggestions_result.additional];
  const matches = toMatches(rankedForScheme.length > 0 ? rankedForScheme : outcomes, 8);

  const lessonCount = parsed.lessonCount ?? DEFAULT_LESSON_COUNT;
  const primarySkill = parsed.skillHint
    ? resolveCurriculumSkillId(parsed.skillHint)
    : outcomeResolution.primarySkillId;
  const skillLabel = primarySkill.replace(/-/g, " ") || "the focus skill";
  const waltExamples = buildWaltIdeas(displayTopicLabel, skillLabel);
  const successCriteria = [...SOW_WILF_CARDS].slice(0, 4);
  const planningSequence = buildPlanningSequence(
    lessonCount,
    resolvedTopicId,
    displayTopicLabel,
    skillLabel
  );
  const schemeTitle = suggestedSchemeTitle(resolvedTopicId, getYearGroupLabel(yearGroup), "Term 1");
  const outcomeIds = (rankedForScheme.length > 0 ? rankedForScheme : outcomes)
    .slice(0, Math.max(lessonCount * 2, 12))
    .map((o) => o.id);

  const schemeDraftSource: AssistantSchemeDraftSource = {
    yearGroupId: yearGroup,
    appPathways,
    topicId,
    skillId: primarySkill,
    term: "Term 1",
    outcomeIds,
  };

  const pedagogyRecommendations = recommendPedagogies({
    topicId: resolvedTopicId,
    skillId: primarySkill,
    yearGroupId: yearGroup,
    limit: 3,
  });

  const mappingNote = outcomeResolution.topic.mappingNote;
  const reviewNote = outcomeResolution.topic.needsReview
    ? " Review curriculum alignment before saving."
    : "";

  const rationale = `A ${lessonCount}-lesson ${displayTopicLabel} scheme for ${getYearGroupLabel(yearGroup)} with official outcomes, lesson sequence, and suggested resources.${reviewNote}`;

  return {
    answer: rationale,
    responseMode: "scheme-draft",
    detectedContext: detected,
    matches,
    planningSequence,
    waltExamples,
    successCriteria,
    suggestedTitle: schemeTitle || `${displayTopicLabel} — Term 1`,
    suggestedLessonCount: lessonCount,
    schemeDraftSource,
    pedagogyRecommendations,
    relatedOutcomeCodes: matches.map((m) => m.code),
    relatedTopicIds: [topicId, resolvedTopicId],
    suggestions: [
      `Adjust lesson skills for ${displayTopicLabel}`,
      `Create a single ${displayTopicLabel} lesson`,
    ],
  };
}

export function buildAssistantResponse(
  parsed: ParsedAssistantQuery,
  context: AssistantQueryContext
): AssistantResponse {
  const { teacherContext, lessons, schemes, calendar, activeScheme } = context;
  const yearGroup = resolveYearGroup(parsed, teacherContext);
  const appPathways = resolveAppPathways(parsed, teacherContext, yearGroup);

  if (detectPedagogyQuery(parsed.raw)) {
    const pedagogyResult = handlePedagogyQuery(parsed.raw, {
      topicId: parsed.topicId ?? undefined,
      skillId: parsed.skillHint ?? undefined,
      yearGroupId: yearGroup,
    });
    if (pedagogyResult) {
      return {
        answer: pedagogyResult.answer,
        detectedContext: {
          intent: "Pedagogy guidance",
          confidence: parsed.confidence,
        },
        relatedOutcomeCodes: [],
        relatedTopicIds: parsed.topicId ? [parsed.topicId] : [],
        suggestions: pedagogyResult.suggestions,
        pedagogySources: pedagogyResult.sources,
      };
    }
  }

  if (parsed.outcomeCode) {
    const codeResponse = respondToOutcomeCode(parsed.outcomeCode);
    if (codeResponse) return { ...codeResponse, responseMode: "curriculum-query" };
  }

  const creationResponse = respondToPlanningCreation(parsed, context);
  if (creationResponse) return creationResponse;

  const sportResponse = handleSportAssistantQuery(parsed, context);
  if (sportResponse) return sportResponse;

  const secResponse = handleSecPeAssistantQuery(parsed, context);
  if (secResponse) return secResponse;

  const fitnessResponse = handleFitnessAssistantQuery(parsed, context);
  if (fitnessResponse) return fitnessResponse;

  const primaryResponse = handlePrimaryPEAssistantQuery(parsed, context);
  if (primaryResponse) return primaryResponse;

  const detected: DetectedContext = {
    intent: intentLabel(parsed.intent),
    yearGroup: getYearGroupLabel(yearGroup),
    pathways: pathwayLabels(appPathways),
    topic: parsed.topicId ? getPlanningTopicDisplayName(parsed.topicId) : parsed.topicLabel ?? undefined,
    lessonCount: parsed.lessonCount ?? undefined,
    confidence: parsed.confidence,
  };

  if (parsed.intent === "missing-scheme" && activeScheme) {
    const advisory = buildSchemeAdvisoryAlignment(activeScheme, teacherContext);
    const matches = toMatches(advisory.uncoveredOutcomes, 8);
    return {
      answer: `Scheme alignment score: **${advisory.score}%**. These outcomes in your focus area are not yet included in the scheme.`,
      detectedContext: detected,
      matches,
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: [...new Set(advisory.uncoveredOutcomes.flatMap((o) => o.topicIds))],
      suggestions: advisory.recommendations,
      actions: [{ label: "Edit scheme", href: "/schemes", variant: "primary" }],
    };
  }

  if (parsed.intent === "coverage" || parsed.intent === "show-gaps") {
    const mode = parsed.intent === "show-gaps" ? "remaining" : "taught";
    const report = buildCurriculumAnalytics(lessons, schemes, undefined, mode, calendar ?? []);
    const gaps =
      parsed.intent === "show-gaps"
        ? report.missingAreas.slice(0, 6)
        : report.underrepresented.slice(0, 6).map((t) => t.label);

    return {
      responseMode: "curriculum-query",
      answer:
        parsed.intent === "show-gaps"
          ? `You still have **${report.summary.remainingOutcomeIds}** outcomes not yet delivered. Priority areas needing attention are listed below.`
          : `Taught coverage: **${report.summary.overallCoveragePercent}%** (${report.summary.taughtOutcomeIds} delivered). Planned: ${report.summary.plannedOutcomeIds}. Remaining: ${report.summary.remainingOutcomeIds}.`,
      detectedContext: detected,
      suggestions: gaps.length
        ? gaps.map((g) => `Plan delivery for ${g}`)
        : ["Your coverage is balanced across visible topics."],
      relatedOutcomeCodes: [],
      relatedTopicIds: [],
      actions: [
        { label: "Open Teaching Progress", href: "/curriculum-analytics", variant: "primary" },
        { label: "Planning Insights", href: "/curriculum-intelligence", variant: "secondary" },
      ],
    };
  }

  if (
    (parsed.intent === "activities" || parsed.normalised.includes("tgfu")) &&
    (parsed.topicId === "invasion-games" || parsed.normalised.includes("invasion"))
  ) {
    const model = PEDAGOGICAL_MODELS.find((m) => m.id === "tgfu");
    const outcomes = filterPlanningOutcomes({
      appPathways,
      yearGroup,
      topicId: parsed.topicId ?? "invasion-games",
      context: teacherContext,
    }).slice(0, 8);
    const matches = toMatches(outcomes);

    return {
      answer: `${model?.description ?? "Teaching Games for Understanding (TGfU)"} Use game-practice-game: modified game → identify tactical problems → practise in context → return to game.`,
      detectedContext: { ...detected, topic: "Invasion Games" },
      matches,
      waltExamples: buildWaltIdeas("Invasion Games", "tactics"),
      successCriteria: [...SOW_WILF_CARDS].slice(0, 4),
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: ["invasion-games"],
      suggestions: ["Tag lessons with TGfU in the pedagogical model field when planning."],
    };
  }

  const topicId = parsed.topicId;
  if (!topicId) {
    return { ...buildPartialMatchResponse(parsed, appPathways, yearGroup, teacherContext), responseMode: "curriculum-query" };
  }

  const topicLabel =
    parsed.topicLabel ?? getPlanningTopicDisplayName(topicId);
  const outcomeResolution = resolveOutcomesForTopic({
    appPathways,
    yearGroup,
    topicId,
    context: teacherContext,
  });
  const resolvedTopicId = outcomeResolution.topic.resolvedTopicId;
  const resolvedTopicLabel = getPlanningTopicDisplayName(resolvedTopicId);
  const displayTopicLabel =
    parsed.topicLabel && parsed.topicId === topicId
      ? getPlanningTopicDisplayName(topicId)
      : resolvedTopicLabel;

  const outcomes = outcomeResolution.outcomes;
  const ranked = outcomeResolution.ranked;

  if (outcomes.length === 0) {
    return { ...buildPartialMatchResponse(parsed, appPathways, yearGroup, teacherContext), responseMode: "curriculum-query" };
  }

  const suggestions_result = getPlanningOutcomeSuggestions({
    appPathways,
    yearGroup,
    topicId: resolvedTopicId,
    skillId: outcomeResolution.primarySkillId,
    context: teacherContext,
  });
  const rankedForScheme = ranked.length > 0 ? ranked : [...suggestions_result.strict, ...suggestions_result.additional];
  const matches = toMatches(rankedForScheme.length > 0 ? rankedForScheme : outcomes, 8);
  const lessonCount = parsed.lessonCount ?? DEFAULT_LESSON_COUNT;
  const primarySkill = outcomeResolution.primarySkillId;
  const skillLabel = primarySkill.replace(/-/g, " ") || "the focus skill";
  const waltExamples = buildWaltIdeas(displayTopicLabel, skillLabel);
  const successCriteria = [...SOW_WILF_CARDS].slice(0, 4);
  const pedagogyRecommendations = recommendPedagogies({
    topicId: resolvedTopicId,
    skillId: primarySkill,
    yearGroupId: yearGroup,
    limit: 3,
  });
  const mappingNote = outcomeResolution.topic.mappingNote;

  if (parsed.intent === "suggest-lessons" || parsed.intent === "activities") {
    return {
      responseMode: "curriculum-query",
      answer: `Here are curriculum-aligned ideas for **${displayTopicLabel}** with **${getYearGroupLabel(yearGroup)}** (${matches.length} matching outcomes shown).${mappingNote ? ` ${mappingNote}` : ""}`,
      detectedContext: detected,
      matches,
      waltExamples,
      successCriteria,
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: [topicId, resolvedTopicId],
      pedagogyRecommendations,
      suggestions: [
        `Create a ${displayTopicLabel} lesson`,
        `Create a ${lessonCount} lesson ${displayTopicLabel} scheme`,
      ],
      actions: [
        { label: "Create lesson", href: `/lesson-builder?yearGroup=${yearGroup}&topic=${topicId}`, variant: "primary" },
        { label: "Create scheme", href: buildSchemesLink({ appPathways, yearGroupId: yearGroup, topicLabel: displayTopicLabel }), variant: "secondary" },
      ],
    };
  }

  return {
    responseMode: "curriculum-query",
    answer: `Found **${outcomes.length}** official curriculum outcomes for **${displayTopicLabel}** (${getYearGroupLabel(yearGroup)}, ${pathwayLabels(appPathways).join(" + ")}).${mappingNote ? ` ${mappingNote}` : ""}`,
    detectedContext: detected,
    matches,
    relatedOutcomeCodes: matches.map((m) => m.code),
    relatedTopicIds: [topicId, resolvedTopicId],
    suggestions: [
      `Create a ${displayTopicLabel} lesson`,
      `Create a ${lessonCount} lesson ${displayTopicLabel} scheme`,
    ],
    actions: [
      { label: "Create lesson", href: `/lesson-builder?yearGroup=${yearGroup}&topic=${topicId}`, variant: "primary" },
      { label: "Create scheme", href: buildSchemesLink({ appPathways, yearGroupId: yearGroup, topicLabel: displayTopicLabel }), variant: "secondary" },
    ],
  };
}

export { SUGGESTED_PROMPT_CHIPS };

export function buildAssistantResponseFromPrompt(
  prompt: string,
  context: AssistantQueryContext
): AssistantResponse {
  return buildAssistantResponse(parseAssistantQuery(prompt), context);
}
