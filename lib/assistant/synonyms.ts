import type { PathwayId } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { TOPICS } from "@/src/lib/curriculum/topics";
import { GENERIC_TOPIC_LABELS } from "@/src/lib/curriculum/planning/topic-labels";

/** Normalised phrase → canonical year group id. */
export const YEAR_GROUP_SYNONYMS: Record<string, YearGroupId> = {
  "year 1": "year-1",
  "year 2": "year-2",
  "year 3": "year-3",
  "year 4": "year-4",
  "year 5": "year-5",
  "year 6": "year-6",
  "year 7": "year-7",
  "year 8": "year-8",
  "year 9": "year-9",
  "year 10": "year-10",
  "year 11": "year-11",
  "form 3": "year-9",
  form3: "year-9",
  "form 4": "year-10",
  form4: "year-10",
  "form 5": "year-11",
  form5: "year-11",
  kg1: "year-1",
  "kg 1": "year-1",
};

export interface PathwaySynonymRule {
  /** Substrings to match in normalised query (any match applies rule). */
  patterns: string[];
  pathways: PathwayId[];
}

export const PATHWAY_SYNONYM_RULES: PathwaySynonymRule[] = [
  { patterns: ["alp student", "alp students", "alp class", "applied learning"], pathways: ["alp-pe", "alp-sports-vocational"] },
  { patterns: ["alp pe", "alp physical education"], pathways: ["alp-pe"] },
  { patterns: ["alp sports", "sports vocational", "alp vocational"], pathways: ["alp-sports-vocational"] },
  { patterns: ["alp"], pathways: ["alp-pe", "alp-sports-vocational"] },
  { patterns: ["general pe", "secondary pe", "general physical"], pathways: ["general-pe"] },
  { patterns: ["sport values", "sports values", "fair play"], pathways: ["sport-values"] },
  { patterns: ["fitness curriculum", "health related fitness", "hrf"], pathways: ["fitness-curriculum"] },
  { patterns: ["fitness", "wellbeing", "well-being"], pathways: ["fitness-curriculum", "general-pe"] },
  { patterns: ["pe option", "sec pe", "matsec pe"], pathways: ["pe-option-sec"] },
  { patterns: ["primary pe", "primary school", "primary students"], pathways: ["primary-pe"] },
  { patterns: ["early years", "kg", "kindergarten"], pathways: ["early-years-pe"] },
];

/** Teacher wording → curriculum topic id (longest keys matched first in parser). */
export const CUSTOM_TOPIC_SYNONYMS: Record<string, string> = {
  soccer: "football",
  "fundamental skills": "fundamentals",
  fundamentals: "fundamentals",
  "basic movement": "fundamentals",
  "movement skills": "fundamentals",
  "invasion games": "invasion-games",
  "invasion game": "invasion-games",
  "net games": "net-games",
  "net game": "net-games",
  "team games": "invasion-games",
  games: "games",
  "outdoor education": "outdoor-recreation",
  "outdoor recreation": "outdoor-recreation",
  orienteering: "orienteering",
  swimming: "swimming",
  aquatics: "swimming-aquatics",
  dance: "educational-dance",
  gymnastics: "gymnastics",
  athletics: "athletics",
  basketball: "basketball",
  football: "football",
  volleyball: "volleyball",
  handball: "handball",
  hockey: "hockey",
  badminton: "badminton",
  rugby: "touch-rugby",
  "touch rugby": "touch-rugby",
  pickleball: "pickleball",
  tchoukball: "tchoukball",
  "physical wellbeing": "healthy-lifestyle",
  "healthy lifestyle": "healthy-lifestyle",
  holistic: "holistic-development",
};

export function buildTopicSynonymMap(): Record<string, string> {
  const map: Record<string, string> = { ...CUSTOM_TOPIC_SYNONYMS };

  for (const topic of TOPICS) {
    map[topic.name.toLowerCase()] = topic.id;
    map[topic.id.toLowerCase()] = topic.id;
  }

  for (const [id, label] of Object.entries(GENERIC_TOPIC_LABELS)) {
    map[label.toLowerCase()] = id;
    map[id.toLowerCase()] = id;
  }

  return map;
}

export const TOPIC_SYNONYM_MAP = buildTopicSynonymMap();

export const INTENT_PHRASES: Record<string, string[]> = {
  "create-scheme": [
    "create a sow",
    "create sow",
    "scheme of work",
    "sow for",
    "plan a unit",
    "plan a term",
    "build a scheme",
    "start a scheme",
    "new scheme",
  ],
  "find-outcomes": [
    "find outcomes",
    "show outcomes",
    "learning outcomes",
    "curriculum outcomes",
    "what outcomes",
    "list outcomes",
    "outcomes for",
  ],
  "suggest-lessons": [
    "lesson ideas",
    "suggest lessons",
    "lesson plan",
    "plan a lesson",
    "what should i teach",
  ],
  activities: [
    "suggest activities",
    "activity ideas",
    "activities for",
    "warm up ideas",
    "drill ideas",
  ],
  "show-gaps": [
    "what have i not taught",
    "not taught yet",
    "gaps in my",
    "show gaps",
    "what am i missing",
    "still need to teach",
    "remaining outcomes",
  ],
  coverage: [
    "coverage",
    "analytics",
    "how much have i taught",
    "curriculum coverage",
    "teaching progress",
  ],
  "missing-scheme": [
    "missing in scheme",
    "missing outcomes in",
    "gaps in scheme",
    "scheme alignment",
    "uncovered in scheme",
  ],
};

export const SUGGESTED_PROMPT_CHIPS = [
  "Create a 6 lesson SOW for Form 5 ALP Basketball",
  "Find Year 9 Volleyball outcomes",
  "Suggest activities for invasion games",
  "Show gaps in my current scheme",
  "What have I not taught yet?",
] as const;
