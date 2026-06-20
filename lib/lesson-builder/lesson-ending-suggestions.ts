import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";
import type { SuggestionBadge } from "@/lib/lesson-builder/planning-coach-labels";
import type { LessonEndingType } from "@/lib/types";
import { generateId } from "@/lib/storage";

export type EndingSuggestionCategory =
  | "reflection"
  | "exit-ticket"
  | "self-assessment"
  | "peer-assessment"
  | "cool-down";

export interface EndingSuggestion {
  id: string;
  category: EndingSuggestionCategory;
  text: string;
  title: string;
  endingType: LessonEndingType;
  badge: SuggestionBadge;
}

const CATEGORY_LABELS: Record<EndingSuggestionCategory, string> = {
  reflection: "Reflection questions",
  "exit-ticket": "Exit tickets",
  "self-assessment": "Self assessment prompts",
  "peer-assessment": "Peer assessment prompts",
  "cool-down": "Cool down ideas",
};

export function getEndingCategoryLabel(category: EndingSuggestionCategory): string {
  return CATEGORY_LABELS[category];
}

function stripICan(description: string): string {
  return description.trim().replace(/^i can\s+/i, "").replace(/[.!?]+$/, "");
}

export function buildLessonEndingSuggestions(input: {
  topicName: string;
  skillName: string;
  selectedOutcomeIds: string[];
}): EndingSuggestion[] {
  const skill = input.skillName.trim() || "the focus skill";
  const topic = input.topicName.trim() || "today's activity";
  const skillLower = skill.toLowerCase();

  const suggestions: EndingSuggestion[] = [
    {
      id: "reflect-improve",
      category: "reflection",
      text: `"What helped you improve your ${skillLower} today?"`,
      title: "Reflection",
      endingType: "reflection",
      badge: "CURRICULUM",
    },
    {
      id: "reflect-decision",
      category: "reflection",
      text: `"Which decision did you make well during the game?"`,
      title: "Reflection",
      endingType: "reflection",
      badge: "SKILL",
    },
    {
      id: "exit-confidence",
      category: "exit-ticket",
      text: `"Rate your ${skillLower} confidence from 1–5."`,
      title: "Quick Questioning",
      endingType: "quick-questioning",
      badge: "ASSESSMENT",
    },
    {
      id: "exit-one-thing",
      category: "exit-ticket",
      text: `"Write one thing you will try to do better next lesson in ${topic}."`,
      title: "Quick Questioning",
      endingType: "quick-questioning",
      badge: "ASSESSMENT",
    },
    {
      id: "self-criteria",
      category: "self-assessment",
      text: `"Which success criterion did you meet best today? Which needs more work?"`,
      title: "Assessment Opportunity",
      endingType: "assessment",
      badge: "ASSESSMENT",
    },
    {
      id: "self-technique",
      category: "self-assessment",
      text: `"How confident are you with your ${skillLower} technique? What would you change?"`,
      title: "Assessment Opportunity",
      endingType: "assessment",
      badge: "ASSESSMENT",
    },
    {
      id: "peer-strength",
      category: "peer-assessment",
      text: `"Tell your partner one strength you noticed in their ${skillLower}."`,
      title: "Assessment Opportunity",
      endingType: "assessment",
      badge: "ASSESSMENT",
    },
    {
      id: "peer-target",
      category: "peer-assessment",
      text: `"Give your partner one specific target to improve ${skillLower} next time."`,
      title: "Assessment Opportunity",
      endingType: "assessment",
      badge: "ASSESSMENT",
    },
    {
      id: "cool-stretch",
      category: "cool-down",
      text: "Light stretching focusing on muscles used during the session.",
      title: "Cool Down",
      endingType: "cool-down",
      badge: "SAFETY",
    },
    {
      id: "cool-breathing",
      category: "cool-down",
      text: "Controlled breathing and mobility to lower heart rate safely.",
      title: "Cool Down",
      endingType: "cool-down",
      badge: "SAFETY",
    },
  ];

  for (const outcomeId of input.selectedOutcomeIds.slice(0, 3)) {
    const outcome = resolveLearningOutcomeById(outcomeId);
    if (!outcome) continue;
    const core = stripICan(outcome.description);
    if (!core) continue;
    suggestions.push({
      id: `outcome-reflect-${outcome.id}`,
      category: "reflection",
      text: `"How well could you ${core.toLowerCase()} today?"`,
      title: "Reflection",
      endingType: "reflection",
      badge: "CURRICULUM",
    });
  }

  return suggestions;
}

export function endingSuggestionToComponent(
  suggestion: EndingSuggestion,
  order: number
): import("@/lib/types").LessonEndingComponent {
  return {
    id: generateId(),
    type: suggestion.endingType,
    title: suggestion.title,
    content: suggestion.text,
    order,
  };
}

export function buildEndingContextKey(input: {
  topicId: string;
  skillId: string;
  selectedOutcomeIds: string[];
}): string {
  return [
    input.topicId,
    input.skillId,
    [...input.selectedOutcomeIds].sort().join("\0"),
  ].join("|");
}

export function groupEndingSuggestions(
  suggestions: EndingSuggestion[]
): Record<EndingSuggestionCategory, EndingSuggestion[]> {
  const groups: Record<EndingSuggestionCategory, EndingSuggestion[]> = {
    reflection: [],
    "exit-ticket": [],
    "self-assessment": [],
    "peer-assessment": [],
    "cool-down": [],
  };
  for (const item of suggestions) {
    groups[item.category].push(item);
  }
  return groups;
}
