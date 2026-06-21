import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";
import type { LearningOutcome } from "@/src/lib/curriculum/types";
import { getPlanningSkillDisplayName } from "@/src/lib/curriculum/planning";
import { buildFitnessLessonDesignHints } from "@/src/lib/peKnowledge/fitnessCurriculumEngines";
import { buildSecLessonDesignHints } from "@/src/lib/peKnowledge/secPeOptionEngines";
import { buildSportLessonDesignHints } from "@/src/lib/peKnowledge/sportCurriculumEngines";
import { resolveSportIdFromTopic } from "@/src/lib/curriculum/sport-curriculum";
import type { SuggestionBadge } from "@/lib/lesson-builder/planning-coach-labels";

export type LearningDesignField =
  | "learningIntention"
  | "walt"
  | "successCriteria"
  | "safetyConsiderations"
  | "assessmentNotes";

export interface DesignSuggestion {
  id: string;
  field: LearningDesignField;
  text: string;
  sourceLabel: string;
  badge: SuggestionBadge;
  sourceOutcomeCode?: string;
}

export interface LearningDesignSuggestionSet {
  learningIntentions: DesignSuggestion[];
  walt: DesignSuggestion[];
  successCriteria: DesignSuggestion[];
  safety: DesignSuggestion[];
  assessment: DesignSuggestion[];
}

export const LEARNING_DESIGN_FIELD_LABELS: Record<LearningDesignField, string> = {
  learningIntention: "Learning intentions",
  walt: "WALT",
  successCriteria: "Success criteria / WILF",
  safetyConsiderations: "Safety considerations",
  assessmentNotes: "Assessment checks",
};

function stripICan(description: string): string {
  return description.trim().replace(/^i can\s+/i, "").replace(/[.!?]+$/, "");
}

function ensureSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
}

function toLearningIntention(outcome: LearningOutcome): string {
  const core = stripICan(outcome.description);
  if (!core) return `Students will develop understanding linked to ${outcome.code}.`;
  const lower = core.charAt(0).toLowerCase() + core.slice(1);
  return ensureSentence(`Students will learn to ${lower}`);
}

function toWalt(outcome: LearningOutcome): string {
  const core = stripICan(outcome.description);
  if (!core) return `We are learning to apply skills from ${outcome.code}.`;
  const lower = core.charAt(0).toLowerCase() + core.slice(1);
  return ensureSentence(`We are learning to ${lower}`);
}

function toSuccessCriterion(outcome: LearningOutcome): string {
  const trimmed = outcome.description.trim();
  if (/^i can/i.test(trimmed)) {
    return ensureSentence(trimmed);
  }
  const core = stripICan(trimmed);
  return ensureSentence(`I can ${core.charAt(0).toLowerCase()}${core.slice(1)}`);
}

function splitSuccessCriteria(outcome: LearningOutcome): string[] {
  const primary = toSuccessCriterion(outcome);
  const core = stripICan(outcome.description).toLowerCase();

  const extras: string[] = [primary];

  if (core.includes("pass") || core.includes("receive")) {
    extras.push("I can pass with control and accuracy.");
    extras.push("I can receive the ball with good body position.");
    if (core.includes("game") || core.includes("variety")) {
      extras.push("I can choose the correct passing option during a game situation.");
    }
  } else if (core.includes("shoot") || core.includes("kick")) {
    extras.push("I can use correct technique when performing the skill.");
    extras.push("I can apply the skill appropriately in a game context.");
  } else if (core.includes("dribbl")) {
    extras.push("I can keep control of the ball while moving.");
    extras.push("I can protect the ball under light pressure.");
  } else if (core.includes("defend")) {
    extras.push("I can maintain good defensive body position.");
    extras.push("I can apply defensive principles in a game situation.");
  }

  return [...new Set(extras)];
}

function toAssessmentCheck(outcome: LearningOutcome): string {
  const core = stripICan(outcome.description);
  if (!core) {
    return `Observe whether students meet the expectations for ${outcome.code} during the lesson.`;
  }
  return `Observe whether students can ${core.toLowerCase()} during practice and game activities.`;
}

const CONTACT_TOPICS = new Set([
  "basketball",
  "football",
  "handball",
  "hockey",
  "touch-rugby",
  "volleyball",
  "netball",
]);

const EQUIPMENT_TOPICS = new Set(["gymnastics", "athletics", "archery", "swimming", "swimming-aquatics"]);

function buildSafetySuggestions(topicId: string, skillName: string): DesignSuggestion[] {
  const topic = topicId.toLowerCase();
  const suggestions: DesignSuggestion[] = [
    {
      id: "safety-warmup",
      field: "safetyConsiderations",
      text: "Ensure a progressive warm-up before the main activity.",
      sourceLabel: "General PE safety",
      badge: "SAFETY",
    },
    {
      id: "safety-space",
      field: "safetyConsiderations",
      text: "Check the playing area for hazards and maintain safe spacing between groups.",
      sourceLabel: "General PE safety",
      badge: "SAFETY",
    },
    {
      id: "safety-supervision",
      field: "safetyConsiderations",
      text: "Maintain clear sightlines and active supervision throughout the session.",
      sourceLabel: "General PE safety",
      badge: "SAFETY",
    },
  ];

  if (CONTACT_TOPICS.has(topic) || topic.includes("invasion")) {
    suggestions.push({
      id: "safety-contact",
      field: "safetyConsiderations",
      text: "Emphasise controlled contact, awareness of others, and safe use of space.",
      sourceLabel: "Contact / invasion activity",
      badge: "SAFETY",
    });
  }

  if (EQUIPMENT_TOPICS.has(topic)) {
    suggestions.push({
      id: "safety-equipment",
      field: "safetyConsiderations",
      text: "Inspect equipment before use and establish clear rules for safe handling.",
      sourceLabel: "Equipment-based activity",
      badge: "SAFETY",
    });
  }

  if (skillName) {
    suggestions.push({
      id: "safety-skill",
      field: "safetyConsiderations",
      text: `Introduce ${skillName.toLowerCase()} progressions gradually to reduce injury risk.`,
      sourceLabel: "Professional insight · skill focus",
      badge: "SKILL",
    });
  }

  return suggestions;
}

function suggestionsFromOutcome(outcome: LearningOutcome): {
  learningIntentions: DesignSuggestion[];
  walt: DesignSuggestion[];
  successCriteria: DesignSuggestion[];
  assessment: DesignSuggestion[];
} {
  const sourceLabel = `Based on selected LO · ${outcome.code}`;

  const learningIntentions: DesignSuggestion[] = [
    {
      id: `${outcome.id}-li`,
      field: "learningIntention",
      text: toLearningIntention(outcome),
      sourceLabel,
      badge: "CURRICULUM",
      sourceOutcomeCode: outcome.code,
    },
  ];

  const walt: DesignSuggestion[] = [
    {
      id: `${outcome.id}-walt`,
      field: "walt",
      text: toWalt(outcome),
      sourceLabel,
      badge: "CURRICULUM",
      sourceOutcomeCode: outcome.code,
    },
  ];

  const successCriteria: DesignSuggestion[] = splitSuccessCriteria(outcome).map((text, index) => ({
    id: `${outcome.id}-sc-${index}`,
    field: "successCriteria",
    text,
    sourceLabel,
    badge: "CURRICULUM" as const,
    sourceOutcomeCode: outcome.code,
  }));

  const assessment: DesignSuggestion[] = [
    {
      id: `${outcome.id}-assess`,
      field: "assessmentNotes",
      text: toAssessmentCheck(outcome),
      sourceLabel,
      badge: "ASSESSMENT",
      sourceOutcomeCode: outcome.code,
    },
  ];

  return { learningIntentions, walt, successCriteria, assessment };
}

export function buildLearningDesignContextKey(input: {
  selectedOutcomeIds: string[];
  topicId: string;
  skillId: string;
}): string {
  return [
    input.topicId,
    input.skillId,
    [...input.selectedOutcomeIds].sort().join("\0"),
  ].join("|");
}

export function buildLearningDesignSuggestions(input: {
  selectedOutcomeIds: string[];
  topicId: string;
  skillId: string;
}): LearningDesignSuggestionSet {
  const outcomes = input.selectedOutcomeIds
    .map((id) => resolveLearningOutcomeById(id))
    .filter((o): o is LearningOutcome => Boolean(o));

  const skillName = input.skillId ? getPlanningSkillDisplayName(input.skillId) : "";

  const learningIntentions: DesignSuggestion[] = [];
  const walt: DesignSuggestion[] = [];
  const successCriteria: DesignSuggestion[] = [];
  const assessment: DesignSuggestion[] = [];

  for (const outcome of outcomes) {
    const batch = suggestionsFromOutcome(outcome);
    learningIntentions.push(...batch.learningIntentions);
    walt.push(...batch.walt);
    successCriteria.push(...batch.successCriteria);
    assessment.push(...batch.assessment);
  }

  const safety = input.topicId
    ? buildSafetySuggestions(input.topicId, skillName)
    : buildSafetySuggestions("", skillName);

  const fitnessHints = buildFitnessLessonDesignHints({
    selectedOutcomeIds: input.selectedOutcomeIds,
    topicId: input.topicId,
    skillId: input.skillId,
  });

  for (const text of fitnessHints.walt) {
    walt.push({
      id: `fitness-walt-${walt.length}`,
      field: "walt",
      text: ensureSentence(text),
      sourceLabel: "Fitness Curriculum intelligence",
      badge: "SKILL",
    });
  }
  for (const text of fitnessHints.wilf) {
    successCriteria.push({
      id: `fitness-wilf-${successCriteria.length}`,
      field: "successCriteria",
      text: ensureSentence(text),
      sourceLabel: "Fitness Curriculum intelligence",
      badge: "CURRICULUM",
    });
  }
  for (const text of fitnessHints.assessment) {
    assessment.push({
      id: `fitness-assess-${assessment.length}`,
      field: "assessmentNotes",
      text: ensureSentence(text),
      sourceLabel: "Fitness Curriculum intelligence",
      badge: "ASSESSMENT",
    });
  }
  for (const text of fitnessHints.reflection) {
    learningIntentions.push({
      id: `fitness-reflect-${learningIntentions.length}`,
      field: "learningIntention",
      text: ensureSentence(text),
      sourceLabel: "Fitness reflection prompt",
      badge: "SKILL",
    });
  }

  if (input.topicId === "fitness") {
    safety.push({
      id: "safety-fitness-intensity",
      field: "safetyConsiderations",
      text: "Monitor intensity — students work at personal appropriate levels with hydration breaks.",
      sourceLabel: "Fitness Curriculum safety",
      badge: "SAFETY",
    });
  }

  const secHints = buildSecLessonDesignHints({
    selectedOutcomeIds: input.selectedOutcomeIds,
    topicId: input.topicId,
    skillId: input.skillId,
    pathwayId: outcomes.some((o) => o.pathwayId === "pe-option-sec") ? "pe-option-sec" : undefined,
  });

  for (const text of secHints.walt) {
    walt.push({
      id: `sec-walt-${walt.length}`,
      field: "walt",
      text: ensureSentence(text),
      sourceLabel: "SEC PE Option intelligence",
      badge: "SKILL",
    });
  }
  for (const text of secHints.wilf) {
    successCriteria.push({
      id: `sec-wilf-${successCriteria.length}`,
      field: "successCriteria",
      text: ensureSentence(text),
      sourceLabel: "SEC PE Option intelligence",
      badge: "CURRICULUM",
    });
  }
  for (const text of secHints.assessment) {
    assessment.push({
      id: `sec-assess-${assessment.length}`,
      field: "assessmentNotes",
      text: ensureSentence(text),
      sourceLabel: "SEC assessment intelligence",
      badge: "ASSESSMENT",
    });
  }
  for (const text of [...secHints.revisionTasks, ...secHints.retrievalPrompts]) {
    learningIntentions.push({
      id: `sec-revision-${learningIntentions.length}`,
      field: "learningIntention",
      text: ensureSentence(text),
      sourceLabel: "SEC revision task",
      badge: "SKILL",
    });
  }
  for (const text of secHints.examPrep) {
    assessment.push({
      id: `sec-exam-${assessment.length}`,
      field: "assessmentNotes",
      text: ensureSentence(text),
      sourceLabel: "SEC exam preparation",
      badge: "ASSESSMENT",
    });
  }

  if (input.topicId === "pe-option-theory") {
    safety.push({
      id: "safety-sec-theory",
      field: "safetyConsiderations",
      text: "Theory lessons — ensure practical links are planned where outcomes require application.",
      sourceLabel: "SEC PE Option safety",
      badge: "SAFETY",
    });
  }

  if (input.topicId && resolveSportIdFromTopic(input.topicId)) {
    const sportHints = buildSportLessonDesignHints({
      selectedOutcomeIds: input.selectedOutcomeIds,
      topicId: input.topicId,
      skillId: input.skillId,
    });

    for (const text of sportHints.walt) {
      walt.push({
        id: `sport-walt-${walt.length}`,
        field: "walt",
        text: ensureSentence(text),
        sourceLabel: "Sport intelligence",
        badge: "SKILL",
      });
    }
    for (const text of sportHints.wilf) {
      successCriteria.push({
        id: `sport-wilf-${successCriteria.length}`,
        field: "successCriteria",
        text: ensureSentence(text),
        sourceLabel: "Sport intelligence",
        badge: "CURRICULUM",
      });
    }
    for (const text of sportHints.activities) {
      learningIntentions.push({
        id: `sport-activity-${learningIntentions.length}`,
        field: "learningIntention",
        text: ensureSentence(text),
        sourceLabel: "Sport lesson phase",
        badge: "SKILL",
      });
    }
    for (const text of sportHints.assessment) {
      assessment.push({
        id: `sport-assess-${assessment.length}`,
        field: "assessmentNotes",
        text: ensureSentence(text),
        sourceLabel: "Sport assessment",
        badge: "ASSESSMENT",
      });
    }
    for (const text of sportHints.reflection) {
      learningIntentions.push({
        id: `sport-reflect-${learningIntentions.length}`,
        field: "learningIntention",
        text: ensureSentence(text),
        sourceLabel: "Sport reflection",
        badge: "SKILL",
      });
    }
  }

  return {
    learningIntentions: dedupeSuggestions(learningIntentions),
    walt: dedupeSuggestions(walt),
    successCriteria: dedupeSuggestions(successCriteria),
    safety: dedupeSuggestions(safety),
    assessment: dedupeSuggestions(assessment),
  };
}

function dedupeSuggestions(items: DesignSuggestion[]): DesignSuggestion[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.field}::${item.text.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function flattenSuggestions(set: LearningDesignSuggestionSet): DesignSuggestion[] {
  return [
    ...set.learningIntentions,
    ...set.walt,
    ...set.successCriteria,
    ...set.safety,
    ...set.assessment,
  ];
}

export function appendToField(current: string, addition: string): string {
  const next = addition.trim();
  if (!next) return current;
  if (!current.trim()) return next;

  const lines = current
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.some((line) => line.toLowerCase() === next.toLowerCase())) {
    return current;
  }
  return `${current.trim()}\n${next}`;
}

export function appendAllToFields(
  current: Record<LearningDesignField, string>,
  suggestions: DesignSuggestion[]
): Record<LearningDesignField, string> {
  const next = { ...current };
  for (const suggestion of suggestions) {
    next[suggestion.field] = appendToField(next[suggestion.field], suggestion.text);
  }
  return next;
}
