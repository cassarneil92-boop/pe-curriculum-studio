import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";
import type { LearningOutcome } from "@/src/lib/curriculum/types";
import { getPlanningSkillDisplayName } from "@/src/lib/curriculum/planning";

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
    },
    {
      id: "safety-space",
      field: "safetyConsiderations",
      text: "Check the playing area for hazards and maintain safe spacing between groups.",
      sourceLabel: "General PE safety",
    },
    {
      id: "safety-supervision",
      field: "safetyConsiderations",
      text: "Maintain clear sightlines and active supervision throughout the session.",
      sourceLabel: "General PE safety",
    },
  ];

  if (CONTACT_TOPICS.has(topic) || topic.includes("invasion")) {
    suggestions.push({
      id: "safety-contact",
      field: "safetyConsiderations",
      text: "Emphasise controlled contact, awareness of others, and safe use of space.",
      sourceLabel: "Contact / invasion activity",
    });
  }

  if (EQUIPMENT_TOPICS.has(topic)) {
    suggestions.push({
      id: "safety-equipment",
      field: "safetyConsiderations",
      text: "Inspect equipment before use and establish clear rules for safe handling.",
      sourceLabel: "Equipment-based activity",
    });
  }

  if (skillName) {
    suggestions.push({
      id: "safety-skill",
      field: "safetyConsiderations",
      text: `Introduce ${skillName.toLowerCase()} progressions gradually to reduce injury risk.`,
      sourceLabel: "Based on skill focus",
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
      sourceOutcomeCode: outcome.code,
    },
  ];

  const walt: DesignSuggestion[] = [
    {
      id: `${outcome.id}-walt`,
      field: "walt",
      text: toWalt(outcome),
      sourceLabel,
      sourceOutcomeCode: outcome.code,
    },
  ];

  const successCriteria: DesignSuggestion[] = splitSuccessCriteria(outcome).map((text, index) => ({
    id: `${outcome.id}-sc-${index}`,
    field: "successCriteria",
    text,
    sourceLabel,
    sourceOutcomeCode: outcome.code,
  }));

  const assessment: DesignSuggestion[] = [
    {
      id: `${outcome.id}-assess`,
      field: "assessmentNotes",
      text: toAssessmentCheck(outcome),
      sourceLabel,
      sourceOutcomeCode: outcome.code,
    },
  ];

  return { learningIntentions, walt, successCriteria, assessment };
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
