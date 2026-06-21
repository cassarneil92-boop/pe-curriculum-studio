import type { AssistantResponse } from "@/lib/assistant";
import { parseAssistantQuery } from "@/lib/assistant/query-parser";
import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import { buildLessonCoachingReport } from "@/lib/lesson-builder/curriculum-coaching";
import type { PathwayId, SchemeOfWork } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { getYearGroupLabel, migrateLegacyYearGroup } from "@/lib/year-groups";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import {
  getPEKnowledgeEntryById,
  suggestRelevantPEKnowledge,
  type SuggestedKnowledgeEntry,
} from "./peKnowledgeIndex";
import type { LessonApplyTarget } from "./applySuggestions";
import { buildImprovedWalt, buildImprovedWilf, buildQuestioningFixPrompts } from "./applySuggestions";
import type { LessonKnowledgeContext, PEKnowledgeEntry } from "./types";
import {
  enrichTGfUKnowledgeCard,
  flagTGfUPlanningIssues,
  getTGfUSchemeUnitProgressionTips,
  isTGfURelevantTopic,
  suggestTGfUApproach,
  TGfU_MASTER_PE_ENTRY,
} from "./tgfuMaster";

export interface PEKnowledgeCardViewModel {
  entry: PEKnowledgeEntry;
  reason: string;
  planningPrompts: string[];
  assessmentPrompt: string;
  differentiationPrompt: string;
}

export interface LessonPedagogyCoachReport {
  teachingModel: { title: string; summary: string; entryId?: string } | null;
  waltWilfTips: string[];
  questioningPrompts: string[];
  differentiationIdeas: string[];
  assessmentEvidence: string[];
  commonMistakes: string[];
  knowledgeSuggestions: SuggestedKnowledgeEntry[];
}

export interface SchemeProgressionCoachReport {
  sequencingTips: string[];
  spacingTips: string[];
  progressionTips: string[];
  holisticBalanceTips: string[];
  knowledgeSuggestions: SuggestedKnowledgeEntry[];
}

export interface KnowledgeQualityInsight {
  id: string;
  area: string;
  message: string;
  prompt?: string;
  entryId?: string;
  fix?: {
    target: LessonApplyTarget;
    text: string;
    actionLabel: string;
    asQuestions?: boolean;
  };
}

const STUDENT_NEED_KEYWORDS = [
  { pattern: /\b(send|special needs|disabilit|lsa)\b/i, tag: "send" },
  { pattern: /\b(eal|english language|bilingual)\b/i, tag: "eal" },
  { pattern: /\bmixed ability\b/i, tag: "mixed-ability" },
  { pattern: /\binclus/i, tag: "inclusion" },
  { pattern: /\bconfidence\b/i, tag: "confidence" },
  { pattern: /\bbehavio/i, tag: "behaviour" },
];

const FACILITY_KEYWORDS = [
  { pattern: /\bhall\b/i, label: "hall" },
  { pattern: /\b(pool|swim|aquatic)\b/i, label: "pool" },
  { pattern: /\boutdoor|yard|pitch|field\b/i, label: "outdoor" },
  { pattern: /\bgym|indoor\b/i, label: "indoor" },
];

function extractStudentNeeds(text: string): string[] {
  const needs: string[] = [];
  for (const { pattern, tag } of STUDENT_NEED_KEYWORDS) {
    if (pattern.test(text)) needs.push(tag);
  }
  return needs;
}

function extractFacilities(text: string): string[] {
  const facilities: string[] = [];
  for (const { pattern, label } of FACILITY_KEYWORDS) {
    if (pattern.test(text)) facilities.push(label);
  }
  return facilities;
}

function resolvePathwayFromResponse(
  _response: AssistantResponse,
  fallback?: PathwayId
): PathwayId | undefined {
  return fallback;
}

export function buildKnowledgeContextFromPrompt(
  prompt: string,
  response?: AssistantResponse | null,
  defaults?: { yearGroup?: YearGroupId; pathway?: PathwayId }
): LessonKnowledgeContext {
  const parsed = parseAssistantQuery(prompt);
  const ctx = response?.detectedContext;

  let yearGroup = parsed.yearGroupId ?? defaults?.yearGroup;
  if (!yearGroup && ctx?.yearGroup) {
    yearGroup = migrateLegacyYearGroup(ctx.yearGroup) ?? undefined;
  }

  const pathway =
    parsed.pathwayIds[0] ??
    (response ? resolvePathwayFromResponse(response, defaults?.pathway) : defaults?.pathway);

  const topicId = parsed.topicId ?? response?.relatedTopicIds?.[0];
  const activityArea = topicId
    ? getPlanningTopicDisplayName(topicId)
    : ctx?.topic ?? parsed.topicLabel ?? undefined;

  const lessonAim =
    parsed.intent === "create-lesson" || parsed.intent === "create-scheme"
      ? prompt
      : response?.lessonPreview?.walt ?? undefined;

  return {
    yearGroup,
    pathway,
    topicId,
    activityArea,
    lessonAim,
    studentNeeds: extractStudentNeeds(prompt),
    availableFacilities: extractFacilities(prompt),
  };
}

export function toPEKnowledgeCardViewModel(
  suggestion: SuggestedKnowledgeEntry,
  context?: LessonKnowledgeContext
): PEKnowledgeCardViewModel {
  const { entry, reasons } = suggestion;
  const tgfuEnrich =
    context &&
    (entry.id === "tgfu-master" || entry.id === "tgfu") &&
    isTGfURelevantTopic(context.topicId, context.activityArea)
      ? enrichTGfUKnowledgeCard(context)
      : null;

  return {
    entry: entry.id === "tgfu" && tgfuEnrich ? TGfU_MASTER_PE_ENTRY : entry,
    reason: tgfuEnrich?.reason ?? reasons[0] ?? entry.summary.slice(0, 120),
    planningPrompts: tgfuEnrich?.planningPrompts ?? entry.lessonPlanningPrompts.slice(0, 3),
    assessmentPrompt:
      tgfuEnrich?.assessmentPrompt ??
      entry.assessmentPrompts[0] ??
      "What evidence will show learning today?",
    differentiationPrompt:
      tgfuEnrich?.differentiationPrompt ??
      entry.differentiationPrompts[0] ??
      "How will all learners access this task?",
  };
}

export function getPlanningAssistantKnowledgeSuggestions(
  prompt: string,
  response?: AssistantResponse | null,
  defaults?: { yearGroup?: YearGroupId; pathway?: PathwayId },
  limit = 5
): PEKnowledgeCardViewModel[] {
  const context = buildKnowledgeContextFromPrompt(prompt, response, defaults);
  return suggestRelevantPEKnowledge(context, limit).map((s) =>
    toPEKnowledgeCardViewModel(s, context)
  );
}

function lessonToKnowledgeContext(lesson: LessonBuilderFormData): LessonKnowledgeContext {
  const pathway =
    lesson.selectedPathways?.[0] ?? (lesson.pathwayId as PathwayId | undefined);
  const activityArea = lesson.topicId
    ? getPlanningTopicDisplayName(lesson.topicId)
    : undefined;

  const studentNeeds: string[] = [];
  const diff = `${lesson.differentiation ?? ""}`.toLowerCase();
  if (diff.includes("support") || diff.includes("easier")) studentNeeds.push("mixed-ability");
  if (diff.includes("send") || diff.includes("lsa")) studentNeeds.push("send");

  const equipment = lesson.equipment?.toLowerCase() ?? "";
  const facilities: string[] = [];
  if (equipment.includes("mat") || equipment.includes("hall")) facilities.push("hall");
  if (equipment.includes("pool")) facilities.push("pool");

  return {
    yearGroup: lesson.yearGroup,
    pathway,
    topicId: lesson.topicId,
    skillId: lesson.skillId,
    activityArea,
    lessonAim: lesson.walt || lesson.learningIntention || undefined,
    studentNeeds,
    availableFacilities: facilities,
  };
}

function waltLooksLikeActivity(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /\b(we are )?play(ing)?\b/.test(lower) ||
    /\bpractise\b/.test(lower) ||
    (lower.includes("we are learning") === false && lower.length > 0)
  );
}

export function buildLessonPedagogyCoachReport(
  lesson: LessonBuilderFormData
): LessonPedagogyCoachReport {
  const context = lessonToKnowledgeContext(lesson);
  const knowledgeSuggestions = suggestRelevantPEKnowledge(context, 4);

  const pedagogyEntry =
    lesson.pedagogicalModels?.[0]
      ? getPEKnowledgeEntryById(lesson.pedagogicalModels[0])
      : knowledgeSuggestions.find((s) => s.entry.category === "pedagogy-model")?.entry ??
        getPEKnowledgeEntryById("tgfu");

  const waltWilfTips: string[] = [];
  if (!lesson.walt?.trim() && !lesson.learningIntention?.trim()) {
    waltWilfTips.push(
      getPEKnowledgeEntryById("learning-intention-clarity")?.lessonPlanningPrompts[0] ??
        "Write WALT as We are learning to… — focus on learning, not activity."
    );
  } else if (waltLooksLikeActivity(lesson.walt ?? lesson.learningIntention ?? "")) {
    waltWilfTips.push(
      "Reframe WALT: describe what students will learn, not what they will do (e.g. decision-making, not playing football)."
    );
  }
  if (!lesson.successCriteria?.trim()) {
    waltWilfTips.push(
      getPEKnowledgeEntryById("success-criteria-wilf")?.lessonPlanningPrompts[0] ??
        "Add 2–3 I can… WILF lines students can self-check."
    );
  }

  const questioningPrompts: string[] = [];
  const tgfu = getPEKnowledgeEntryById("tgfu");
  const guided = getPEKnowledgeEntryById("guided-discovery");
  const tgfuRelevant = isTGfURelevantTopic(lesson.topicId, context.activityArea);
  const tgfuApproach = tgfuRelevant ? suggestTGfUApproach(context) : null;

  if (
    pedagogyEntry?.id === "tgfu" ||
    pedagogyEntry?.id === "tgfu-master" ||
    pedagogyEntry?.id === "guided-discovery" ||
    tgfuRelevant
  ) {
    if (tgfuApproach) {
      questioningPrompts.push(
        ...tgfuApproach.questioningPrompts,
        `Tactical focus: ${tgfuApproach.tacticalProblem.replace(/-/g, " ")}`
      );
    } else {
      questioningPrompts.push(
        ...(tgfu?.lessonPlanningPrompts.slice(0, 2) ?? []),
        ...(guided?.lessonPlanningPrompts.slice(0, 1) ?? [])
      );
    }
  }

  const differentiationIdeas = tgfuApproach
    ? [...new Set(tgfuApproach.differentiationIdeas)]
    : [
        ...new Set(
          knowledgeSuggestions.flatMap((s) => s.entry.differentiationPrompts.slice(0, 1))
        ),
      ].slice(0, 3);

  const assessmentEvidence = tgfuApproach
    ? tgfuApproach.assessmentEvidence
    : [
        ...new Set(
          knowledgeSuggestions.flatMap((s) => s.entry.assessmentPrompts.slice(0, 1))
        ),
      ].slice(0, 3);

  let commonMistakes = pedagogyEntry
    ? pedagogyEntry.commonMistakes.slice(0, 3)
    : knowledgeSuggestions.flatMap((s) => s.entry.commonMistakes.slice(0, 1)).slice(0, 3);

  if (tgfuApproach) {
    commonMistakes = [
      tgfuApproach.commonMistakeWarning,
      ...commonMistakes,
    ].slice(0, 3);
  }

  const lessonText = `${lesson.walt ?? ""} ${lesson.activities ?? ""} ${(lesson.structuredActivities ?? []).map((a) => a.taskDescription).join(" ")}`;
  const tgfuFlags = tgfuRelevant ? flagTGfUPlanningIssues(lessonText) : [];
  if (tgfuFlags.length > 0) {
    commonMistakes = [...tgfuFlags, ...commonMistakes].slice(0, 3);
  }

  const teachingModel =
    tgfuApproach && (pedagogyEntry?.id === "tgfu" || tgfuRelevant)
      ? {
          title: "TGfU — " + tgfuApproach.categoryLabel,
          summary: `${tgfuApproach.modifiedGameIdea}. Problem: ${tgfuApproach.tacticalProblem.replace(/-/g, " ")}.`,
          entryId: "tgfu-master",
        }
      : pedagogyEntry
        ? {
            title: pedagogyEntry.title,
            summary: pedagogyEntry.summary,
            entryId: pedagogyEntry.id,
          }
        : null;

  return {
    teachingModel,
    waltWilfTips,
    questioningPrompts: [...new Set(questioningPrompts)].slice(0, 3),
    differentiationIdeas,
    assessmentEvidence,
    commonMistakes,
    knowledgeSuggestions,
  };
}

function schemeHasAssessmentLesson(scheme: Pick<SchemeOfWork, "lessons">): boolean {
  const last = scheme.lessons[scheme.lessons.length - 1];
  if (!last) return false;
  const text = `${last.walt} ${last.activities}`.toLowerCase();
  return /assess|review|consolidat/.test(text);
}

export function buildSchemeProgressionCoachReport(
  scheme: Pick<
    SchemeOfWork,
    "lessons" | "topicId" | "yearGroup" | "pathway" | "selectedPathways" | "pedagogicalModels"
  >
): SchemeProgressionCoachReport {
  const pathway = scheme.selectedPathways?.[0] ?? scheme.pathway;
  const context: LessonKnowledgeContext = {
    yearGroup: scheme.yearGroup,
    pathway,
    topicId: scheme.topicId,
    activityArea: scheme.topicId ? getPlanningTopicDisplayName(scheme.topicId) : undefined,
    lessonAim: scheme.lessons[0]?.walt,
  };

  const knowledgeSuggestions = suggestRelevantPEKnowledge(context, 5);
  const tgfuUnit = isTGfURelevantTopic(scheme.topicId, context.activityArea);
  const schemeLogic = getPEKnowledgeEntryById("scheme-progression-logic");
  const spaced = getPEKnowledgeEntryById("spaced-practice");
  const holistic = getPEKnowledgeEntryById("holistic-pe-assessment");

  const sequencingTips: string[] = [];
  if (scheme.lessons.length > 0) {
    sequencingTips.push(
      tgfuUnit
        ? "TGfU unit: progress from simple tactical problem → modified game → decision under pressure → skill refinement → assessment game."
        : schemeLogic?.practicalApplications[0] ??
            "Aim for intro → develop → apply → assess across the scheme."
    );
    const emptyWalts = scheme.lessons.filter((l) => !l.walt.trim()).length;
    if (emptyWalts > 0) {
      sequencingTips.push(`${emptyWalts} lesson(s) still need WALT — clarify focus before delivery.`);
    }
    if (!schemeHasAssessmentLesson(scheme)) {
      sequencingTips.push(
        "Add a final assessment or consolidation lesson to close the progression loop."
      );
    }
  }

  const spacingTips = [
    spaced?.practicalApplications[0] ??
      "Revisit the scheme skill in lessons 1, 3, and 5 rather than teaching it once.",
    spaced?.lessonPlanningPrompts[0] ??
      "When will this skill appear again in the next three lessons?",
  ];

  const progressionTips = tgfuUnit
    ? getTGfUSchemeUnitProgressionTips(scheme.lessons.length).slice(0, 3)
    : [
        schemeLogic?.keyPrinciples[1] ?? "Spiral back to prior skills in new contexts.",
        getPEKnowledgeEntryById("desirable-difficulties")?.practicalApplications[0] ??
          "Increase challenge gradually — avoid jumping to full game rules too early.",
      ];

  const holisticBalanceTips = [
    holistic?.practicalApplications[0] ??
      "Include skill, decision-making, communication, and fair play in your rubric.",
    getPEKnowledgeEntryById("holistic-pe-assessment")?.lessonPlanningPrompts[0] ??
      "Which non-physical outcomes are assessable this week?",
  ];

  return {
    sequencingTips: sequencingTips.slice(0, 3),
    spacingTips: spacingTips.slice(0, 2),
    progressionTips: progressionTips.slice(0, 2),
    holisticBalanceTips: holisticBalanceTips.slice(0, 2),
    knowledgeSuggestions,
  };
}

export function buildKnowledgeQualityInsights(
  lesson: LessonBuilderFormData
): KnowledgeQualityInsight[] {
  const insights: KnowledgeQualityInsight[] = [];

  const waltEntry = getPEKnowledgeEntryById("learning-intention-clarity");
  const wilfEntry = getPEKnowledgeEntryById("success-criteria-wilf");
  const structureEntry = getPEKnowledgeEntryById("lesson-structure-phases");
  const aflEntry = getPEKnowledgeEntryById("assessment-for-learning");
  const udlEntry = getPEKnowledgeEntryById("inclusion-universal-design");
  const progressionEntry = getPEKnowledgeEntryById("spaced-practice");
  const guidedEntry = getPEKnowledgeEntryById("guided-discovery");

  const hasWalt = Boolean(lesson.walt?.trim() || lesson.learningIntention?.trim());
  const hasWilf = Boolean(lesson.successCriteria?.trim());
  const hasActivities = (lesson.structuredActivities ?? []).length > 0 || Boolean(lesson.activities?.trim());
  const hasDifferentiation =
    (lesson.structuredActivities ?? []).some(
      (a) => a.differentiationEasier.trim() || a.differentiationHarder.trim()
    ) || Boolean(lesson.differentiation?.trim());
  const hasAssessment =
    Boolean(lesson.assessmentNotes?.trim()) ||
    (lesson.lessonEndings ?? []).some((e) => e.type === "assessment" || e.type === "quick-questioning");
  const hasReflection =
    Boolean(lesson.reflectionNotes?.trim()) ||
    (lesson.lessonEndings ?? []).some((e) => e.type === "reflection");
  const hasProgression = (lesson.structuredActivities ?? []).some((a) =>
    a.progressions.some((p) => p.trim())
  );

  const topicLabel = lesson.topicId ? getPlanningTopicDisplayName(lesson.topicId) : "this activity";

  if (!hasWalt || waltLooksLikeActivity(lesson.walt ?? lesson.learningIntention ?? "")) {
    insights.push({
      id: "learning-intention",
      area: "Learning intention",
      message: hasWalt
        ? "WALT may describe activity rather than learning."
        : "Learning intention / WALT is missing or unclear.",
      prompt: waltEntry?.lessonPlanningPrompts[0],
      entryId: waltEntry?.id,
      fix: {
        target: "walt",
        text: buildImprovedWalt(topicLabel, lesson.skillId),
        actionLabel: "Use this fix",
      },
    });
  }

  if (hasActivities && !hasWalt) {
    insights.push({
      id: "activity-purpose",
      area: "Activity purpose",
      message: "Activities are present but not clearly linked to a learning intention.",
      prompt: structureEntry?.lessonPlanningPrompts[0],
      entryId: structureEntry?.id,
      fix: {
        target: "walt",
        text: buildImprovedWalt(topicLabel),
        actionLabel: "Add WALT",
      },
    });
  }

  if (!hasWilf) {
    insights.push({
      id: "wilf",
      area: "Success criteria",
      message: "No WILF / success criteria for students to self-check.",
      prompt: wilfEntry?.lessonPlanningPrompts[0],
      entryId: wilfEntry?.id,
      fix: {
        target: "successCriteria",
        text: buildImprovedWilf(wilfEntry?.assessmentPrompts ?? ["perform the skill with control"]),
        actionLabel: "Use this fix",
      },
    });
  }

  if (!hasAssessment) {
    insights.push({
      id: "assessment",
      area: "Assessment evidence",
      message: "No assessment opportunity or evidence plan noted.",
      prompt: aflEntry?.assessmentPrompts[0],
      entryId: aflEntry?.id,
      fix: {
        target: "assessmentNotes",
        text: aflEntry?.assessmentPrompts[0] ?? "Observe students against WILF during main activity.",
        actionLabel: "Add evidence",
      },
    });
  }

  if (!hasDifferentiation) {
    insights.push({
      id: "differentiation",
      area: "Differentiation",
      message: "No differentiation strategy documented for mixed ability.",
      prompt: udlEntry?.differentiationPrompts[0],
      entryId: udlEntry?.id,
      fix: {
        target: "differentiation",
        text: udlEntry?.differentiationPrompts[0] ?? "Offer support, core, and extend task options.",
        actionLabel: "Add differentiation",
      },
    });
  }

  if (!hasReflection) {
    const questions = buildQuestioningFixPrompts(guidedEntry?.lessonPlanningPrompts ?? []);
    insights.push({
      id: "questioning",
      area: "Questioning / reflection",
      message: "No reflection or questioning phase in the lesson ending.",
      prompt: guidedEntry?.lessonPlanningPrompts[0],
      entryId: guidedEntry?.id,
      fix: {
        target: "reflectionNotes",
        text: questions.join("\n"),
        actionLabel: "Add questions",
        asQuestions: true,
      },
    });
  }

  if (hasActivities && !hasProgression) {
    insights.push({
      id: "progression",
      area: "Progression",
      message: "Activities lack explicit progression within the lesson.",
      prompt: progressionEntry?.lessonPlanningPrompts[0],
      entryId: progressionEntry?.id,
      fix: {
        target: "teacherNotes",
        text: progressionEntry?.lessonPlanningPrompts[0] ?? "Plan a clear progression within the main activity.",
        actionLabel: "Add note",
      },
    });
  }

  if (!hasDifferentiation && !lesson.safetyConsiderations?.trim()) {
    insights.push({
      id: "inclusion",
      area: "Inclusion",
      message: "Consider access and inclusion — no differentiation or safety notes yet.",
      prompt: udlEntry?.lessonPlanningPrompts[0],
      entryId: udlEntry?.id,
      fix: {
        target: "differentiation",
        text: udlEntry?.differentiationPrompts[0] ?? "Same learning intention with varied task access.",
        actionLabel: "Add inclusion idea",
      },
    });
  }

  if (lesson.selectedLearningOutcomeIds.length === 0) {
    insights.push({
      id: "curriculum",
      area: "Curriculum alignment",
      message: "Link official curriculum outcomes to strengthen alignment.",
      prompt: getPEKnowledgeEntryById("malta-curriculum-pathways")?.lessonPlanningPrompts[0],
      entryId: "malta-curriculum-pathways",
      fix: {
        target: "teacherNotes",
        text: "Link curriculum outcomes in Curriculum Reference before saving.",
        actionLabel: "Add reminder",
      },
    });
  }

  return insights.slice(0, 6);
}

export function formatYearGroupForContext(yearGroup?: string): string | undefined {
  if (!yearGroup) return undefined;
  return getYearGroupLabel(yearGroup as YearGroupId);
}
