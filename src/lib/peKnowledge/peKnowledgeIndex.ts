import { isYearGroupId, type YearGroupId } from "@/lib/year-groups";
import type { PathwayId } from "@/lib/types";
import { ASSESSMENT_ENTRIES } from "./assessment";
import { CHILD_DEVELOPMENT_ENTRIES } from "./childDevelopment";
import { CURRICULUM_DESIGN_ENTRIES } from "./curriculumDesign";
import { INCLUSION_ENTRIES } from "./inclusion";
import { LEARNING_SCIENCE_ENTRIES } from "./learningScience";
import { MALTA_CONTEXT_ENTRIES } from "./maltaContext";
import { MOTIVATION_ENTRIES } from "./motivation";
import { PEDAGOGY_MODEL_ENTRIES } from "./pedagogyModels";
import { PHYSICAL_LITERACY_ENTRIES } from "./physicalLiteracy";
import { isTGfURelevantTopic, TGfU_MASTER_PE_ENTRY } from "./tgfuMaster";
import type {
  AgePhase,
  LessonKnowledgeContext,
  PEKnowledgeCategory,
  PEKnowledgeEntry,
  SuggestedKnowledgeEntry,
} from "./types";

export const ALL_PE_KNOWLEDGE_ENTRIES: PEKnowledgeEntry[] = [
  ...LEARNING_SCIENCE_ENTRIES,
  ...PEDAGOGY_MODEL_ENTRIES,
  TGfU_MASTER_PE_ENTRY,
  ...PHYSICAL_LITERACY_ENTRIES,
  ...MOTIVATION_ENTRIES,
  ...INCLUSION_ENTRIES,
  ...ASSESSMENT_ENTRIES,
  ...CURRICULUM_DESIGN_ENTRIES,
  ...CHILD_DEVELOPMENT_ENTRIES,
  ...MALTA_CONTEXT_ENTRIES,
];

const ENTRY_BY_ID = new Map(ALL_PE_KNOWLEDGE_ENTRIES.map((entry) => [entry.id, entry]));

export function getPEKnowledgeEntryById(id: string): PEKnowledgeEntry | undefined {
  return ENTRY_BY_ID.get(id);
}

export function getAllPEKnowledgeEntries(): PEKnowledgeEntry[] {
  return ALL_PE_KNOWLEDGE_ENTRIES;
}

export function getPEKnowledgeEntriesByCategory(
  category: PEKnowledgeCategory
): PEKnowledgeEntry[] {
  return ALL_PE_KNOWLEDGE_ENTRIES.filter((entry) => entry.category === category);
}

export function yearGroupToAgePhase(yearGroup: string): AgePhase | null {
  if (!isYearGroupId(yearGroup)) return null;

  const primary: YearGroupId[] = ["year-1", "year-2", "year-3", "year-4", "year-5", "year-6"];
  const middle: YearGroupId[] = ["year-7", "year-8"];
  const secondary: YearGroupId[] = ["year-9", "year-10", "year-11"];

  if (primary.includes(yearGroup)) return "primary";
  if (middle.includes(yearGroup)) return "middle-school";
  if (secondary.includes(yearGroup)) return "secondary";
  return null;
}

export function getPEKnowledgeEntriesByAgePhase(agePhase: AgePhase): PEKnowledgeEntry[] {
  return ALL_PE_KNOWLEDGE_ENTRIES.filter(
    (entry) => entry.agePhaseRelevance.includes(agePhase) || entry.agePhaseRelevance.includes("all")
  );
}

export function getPEKnowledgeEntriesByYearGroup(yearGroup: string): PEKnowledgeEntry[] {
  const phase = yearGroupToAgePhase(yearGroup);
  if (!phase) return ALL_PE_KNOWLEDGE_ENTRIES.filter((e) => e.agePhaseRelevance.includes("all"));
  return getPEKnowledgeEntriesByAgePhase(phase);
}

export function getPEKnowledgeEntriesByPathway(pathway: PathwayId | "all"): PEKnowledgeEntry[] {
  return ALL_PE_KNOWLEDGE_ENTRIES.filter(
    (entry) => entry.pathwayRelevance.includes("all") || entry.pathwayRelevance.includes(pathway)
  );
}

export function getPEKnowledgeEntriesByTag(tag: string): PEKnowledgeEntry[] {
  const normalised = tag.trim().toLowerCase();
  return ALL_PE_KNOWLEDGE_ENTRIES.filter((entry) =>
    entry.tags.some((t) => t.toLowerCase() === normalised || t.toLowerCase().includes(normalised))
  );
}

function normaliseText(value: string): string {
  return value.trim().toLowerCase();
}

function textMatchesEntry(text: string, entry: PEKnowledgeEntry): boolean {
  const haystack = [
    entry.title,
    entry.summary,
    ...entry.tags,
    ...entry.relatedModels,
    entry.category,
  ]
    .join(" ")
    .toLowerCase();

  return text
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .some((word) => haystack.includes(word));
}

function scoreEntryForContext(
  entry: PEKnowledgeEntry,
  context: LessonKnowledgeContext
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (context.yearGroup) {
    const phase = yearGroupToAgePhase(context.yearGroup);
    if (phase && (entry.agePhaseRelevance.includes(phase) || entry.agePhaseRelevance.includes("all"))) {
      score += 3;
      reasons.push(`Relevant for ${phase.replace("-", " ")}`);
    }
    if (context.yearGroup === "year-1" && entry.agePhaseRelevance.includes("early-years")) {
      score += 2;
      reasons.push("Relevant for early years");
    }
  }

  if (context.pathway) {
    const pathway = context.pathway as PathwayId;
    if (entry.pathwayRelevance.includes("all") || entry.pathwayRelevance.includes(pathway)) {
      score += 3;
      reasons.push(`Matches ${pathway} pathway`);
    }
  }

  if (context.activityArea || context.topicId) {
    const area = normaliseText(`${context.topicId ?? ""} ${context.activityArea ?? ""}`);
    const areaMatches =
      entry.tags.some((tag) => area.includes(tag) || tag.includes(area)) ||
      textMatchesEntry(area, entry);
    if (areaMatches) {
      score += 4;
      reasons.push(`Links to ${context.activityArea ?? context.topicId}`);
    }
    if (
      isTGfURelevantTopic(context.topicId, context.activityArea) &&
      (entry.id === "tgfu-master" || entry.id === "tgfu")
    ) {
      score += 8;
      reasons.push("TGfU specialist guidance for this game category");
    }
  }

  if (context.lessonAim) {
    if (textMatchesEntry(normaliseText(context.lessonAim), entry)) {
      score += 3;
      reasons.push("Aligns with lesson aim");
    }
  }

  if (context.studentNeeds?.length) {
    for (const need of context.studentNeeds) {
      const needNorm = normaliseText(need);
      const needTags = ["send", "eal", "inclusion", "differentiation", "mixed-ability", "confidence"];
      const matchedTag = entry.tags.find(
        (tag) => needNorm.includes(tag) || tag.includes(needNorm.replace(/\s+/g, "-"))
      );
      if (matchedTag || needTags.some((t) => needNorm.includes(t) && entry.tags.includes(t))) {
        score += 4;
        reasons.push(`Supports ${need}`);
      }
    }
  }

  if (context.availableFacilities?.length) {
    for (const facility of context.availableFacilities) {
      const facilityNorm = normaliseText(facility);
      if (
        entry.tags.some((tag) => facilityNorm.includes(tag)) ||
        entry.id === "malta-facilities-context" ||
        (facilityNorm.includes("hall") && entry.tags.includes("hall"))
      ) {
        score += 2;
        reasons.push(`Considers ${facility} constraints`);
      }
    }
  }

  return { score, reasons: [...new Set(reasons)] };
}

/** Suggest the most relevant knowledge entries for a lesson planning context. */
export function suggestRelevantPEKnowledge(
  context: LessonKnowledgeContext,
  limit = 6
): SuggestedKnowledgeEntry[] {
  const scored = ALL_PE_KNOWLEDGE_ENTRIES.map((entry) => {
    const { score, reasons } = scoreEntryForContext(entry, context);
    return { entry, relevanceScore: score, reasons };
  })
    .filter((item) => item.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  if (scored.length === 0) {
    return ALL_PE_KNOWLEDGE_ENTRIES.slice(0, limit).map((entry) => ({
      entry,
      relevanceScore: 1,
      reasons: ["General PE planning guidance"],
    }));
  }

  return scored.slice(0, limit);
}

export function searchPEKnowledge(query: string): PEKnowledgeEntry[] {
  const q = normaliseText(query);
  if (!q) return [];

  return ALL_PE_KNOWLEDGE_ENTRIES.filter(
    (entry) =>
      entry.title.toLowerCase().includes(q) ||
      entry.summary.toLowerCase().includes(q) ||
      entry.tags.some((tag) => tag.includes(q)) ||
      entry.keyPrinciples.some((p) => p.toLowerCase().includes(q))
  );
}

export {
  TGfU_CORE_DEFINITION,
  TGfU_SIX_PHASES,
  TGfU_GAME_CATEGORIES,
  TGfU_PEDAGOGICAL_PRINCIPLES,
  TGfU_QUESTION_BANK,
  TGfU_DIFFERENTIATION,
  TGfU_ASSESSMENT_DOMAINS,
  TGfU_PLANNING_MISTAKES,
  TGfU_SCHEME_UNIT_PROGRESSION,
  TGfU_LESSON_TEMPLATES_BY_CATEGORY,
  TGfU_MASTER_PE_ENTRY,
  isTGfURelevantTopic,
  resolveTGfUGameCategory,
  suggestTGfUApproach,
  buildTGfULessonTemplate,
  getTGfUQuestionsByGameCategory,
  getTGfUDifferentiationOptions,
  getTGfUSchemeUnitProgressionTips,
  getTGfULessonTemplateByCategory,
  enrichTGfUKnowledgeCard,
  flagTGfUPlanningIssues,
  type TGfUGameCategory,
  type TGfUApproachSuggestion,
  type TGfULessonTemplate,
} from "./tgfuMaster";

export {
  LEARNING_SCIENCE_ENTRIES,
  PEDAGOGY_MODEL_ENTRIES,
  PHYSICAL_LITERACY_ENTRIES,
  MOTIVATION_ENTRIES,
  INCLUSION_ENTRIES,
  ASSESSMENT_ENTRIES,
  CURRICULUM_DESIGN_ENTRIES,
  CHILD_DEVELOPMENT_ENTRIES,
  MALTA_CONTEXT_ENTRIES,
};

export {
  appendUniqueText,
  mergePromptList,
  buildAppliedSuggestionMessage,
  avoidDuplicateSuggestions,
  safeApplyText,
  applyTextToLessonForm,
  applyQuestioningToLesson,
  applyCommonMistakeNote,
  applyToSchemeLesson,
  buildImprovedWalt,
  buildImprovedWilf,
  buildMinimalLessonDraftFromContext,
} from "./applySuggestions";

export {
  buildKnowledgeContextFromPrompt,
  buildLessonPedagogyCoachReport,
  buildSchemeProgressionCoachReport,
  buildKnowledgeQualityInsights,
  getPlanningAssistantKnowledgeSuggestions,
  toPEKnowledgeCardViewModel,
  type PEKnowledgeCardViewModel,
  type LessonPedagogyCoachReport,
  type SchemeProgressionCoachReport,
  type KnowledgeQualityInsight,
} from "./coaching";

export type {
  PEKnowledgeEntry,
  PEKnowledgeCategory,
  AgePhase,
  LessonKnowledgeContext,
  SuggestedKnowledgeEntry,
} from "./types";
