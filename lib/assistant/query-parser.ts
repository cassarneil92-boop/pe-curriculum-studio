import type { PathwayId } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { migrateLegacyYearGroup } from "@/lib/year-groups";
import {
  INTENT_PHRASES,
  PATHWAY_SYNONYM_RULES,
  TOPIC_SYNONYM_MAP,
  YEAR_GROUP_SYNONYMS,
} from "./synonyms";

export type AssistantIntent =
  | "find-outcomes"
  | "create-lesson"
  | "create-scheme"
  | "suggest-lessons"
  | "activities"
  | "show-gaps"
  | "coverage"
  | "missing-scheme"
  | "unknown";

export interface ParsedAssistantQuery {
  raw: string;
  normalised: string;
  intent: AssistantIntent;
  yearGroupId: YearGroupId | null;
  yearGroupLabel: string | null;
  pathwayIds: PathwayId[];
  topicId: string | null;
  topicLabel: string | null;
  skillHint: string | null;
  lessonCount: number | null;
  outcomeCode: string | null;
  confidence: "high" | "medium" | "low";
  matchedTerms: string[];
}

const CREATION_VERBS =
  /\b(create|build|generate|make|plan|design|prepare)\b/;

const LESSON_ARTIFACTS = /\b(lessons?|sessions?|activities?)\b/;

const SCHEME_ARTIFACTS = /\b(schemes?|sow|unit|units?)\b/;

const EXPLICIT_FIND_OUTCOME_PHRASES = [
  "find outcomes",
  "show outcomes",
  "list outcomes",
  "what outcomes",
  "curriculum outcomes for",
  "outcomes for",
  "learning outcomes for",
  "find learning outcomes",
  "show learning outcomes",
];

function normalise(raw: string): string {
  return raw.trim().toLowerCase().replace(/['']/g, "'").replace(/\s+/g, " ");
}

function isExplicitFindOutcomesQuery(q: string): boolean {
  if (EXPLICIT_FIND_OUTCOME_PHRASES.some((phrase) => q.includes(phrase))) {
    return true;
  }
  if (/\boutcomes?\b/.test(q) && /\b(find|show|list|what|curriculum)\b/.test(q)) {
    return true;
  }
  return false;
}

function isCreationQuery(q: string): boolean {
  return CREATION_VERBS.test(q);
}

function detectCreationIntent(q: string): AssistantIntent | null {
  const hasSchemeArtifact = SCHEME_ARTIFACTS.test(q);
  const hasLessonArtifact = LESSON_ARTIFACTS.test(q);
  const hasNumberedLessons = /\b\d{1,2}\s*(?:lesson|week|session)s?\b/.test(q);
  const hasCreationVerb = isCreationQuery(q);

  if (!hasCreationVerb && !hasSchemeArtifact && !hasLessonArtifact) {
    return null;
  }

  if (hasSchemeArtifact || (hasNumberedLessons && /\b(sow|scheme|unit)\b/.test(q))) {
    return "create-scheme";
  }

  if (hasSchemeArtifact && !hasLessonArtifact) {
    return "create-scheme";
  }

  if (hasLessonArtifact && (hasCreationVerb || !hasSchemeArtifact)) {
    return "create-lesson";
  }

  if (/\bunit\b/.test(q)) {
    return "create-scheme";
  }

  if (hasCreationVerb) {
    return hasNumberedLessons ? "create-scheme" : "create-lesson";
  }

  return null;
}

function detectIntent(q: string): AssistantIntent {
  if (isExplicitFindOutcomesQuery(q)) {
    return "find-outcomes";
  }

  const creationIntent = detectCreationIntent(q);
  if (creationIntent) return creationIntent;

  for (const [intent, phrases] of Object.entries(INTENT_PHRASES)) {
    if (intent === "find-outcomes") continue;
    if (phrases.some((phrase) => q.includes(phrase))) {
      return intent as AssistantIntent;
    }
  }

  if (/\b(sow|scheme)\b/.test(q) && CREATION_VERBS.test(q)) {
    return "create-scheme";
  }

  if (/\bactivities?\b/.test(q)) return "activities";

  return "unknown";
}

function detectYearGroup(q: string): { id: YearGroupId | null; label: string | null; term?: string } {
  const sortedKeys = Object.keys(YEAR_GROUP_SYNONYMS).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (q.includes(key)) {
      const id = YEAR_GROUP_SYNONYMS[key];
      return { id, label: key, term: key };
    }
  }

  const yearWord = q.match(/\byear\s*(\d{1,2})\b/);
  if (yearWord) {
    const id = migrateLegacyYearGroup(`year ${yearWord[1]}`);
    if (id) return { id, label: `Year ${yearWord[1]}`, term: yearWord[0] };
  }

  const formWord = q.match(/\bform\s*([345])\b/);
  if (formWord) {
    const id = migrateLegacyYearGroup(`form ${formWord[1]}`);
    if (id) return { id, label: `Form ${formWord[1]}`, term: formWord[0] };
  }

  return { id: null, label: null };
}

function detectPathways(q: string): { pathways: PathwayId[]; terms: string[] } {
  const found = new Set<PathwayId>();
  const terms: string[] = [];

  for (const rule of PATHWAY_SYNONYM_RULES) {
    if (rule.patterns.some((pattern) => q.includes(pattern))) {
      for (const pathway of rule.pathways) found.add(pathway);
      terms.push(rule.patterns.find((p) => q.includes(p)) ?? rule.patterns[0]);
    }
  }

  return { pathways: [...found], terms };
}

function detectTopic(q: string): { topicId: string | null; label: string | null; term?: string } {
  const keys = Object.keys(TOPIC_SYNONYM_MAP).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    if (key.length < 3) continue;
    const pattern = new RegExp(`\\b${escapeRegex(key)}\\b`, "i");
    if (pattern.test(q) || q.includes(key)) {
      const topicId = TOPIC_SYNONYM_MAP[key];
      return { topicId, label: key, term: key };
    }
  }

  return { topicId: null, label: null };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectLessonCount(q: string): number | null {
  const match = q.match(/\b(\d{1,2})\s*(?:lesson|week|session)s?\b/);
  if (match) {
    const n = Number(match[1]);
    if (n >= 1 && n <= 52) return n;
  }
  return null;
}

function detectSkillHint(q: string): string | null {
  const skills = [
    "passing", "receiving", "dribbling", "finishing", "defending", "shooting",
    "serving", "spiking", "blocking", "lay-up", "rebounding", "sprint", "jump", "throw",
  ];
  return skills.find((s) => q.includes(s)) ?? null;
}

function detectOutcomeCode(raw: string): string | null {
  const match = raw.match(/\b([A-Z]{1,3}\d+\.\d+[a-z]?)\b/i);
  return match ? match[1].toUpperCase() : null;
}

function inferIntentFromContext(
  intent: AssistantIntent,
  q: string
): AssistantIntent {
  if (intent !== "unknown") return intent;

  if (q.includes("missing") && q.includes("scheme")) return "missing-scheme";

  return "unknown";
}

function scoreConfidence(params: {
  intent: AssistantIntent;
  topicId: string | null;
  yearGroupId: YearGroupId | null;
  pathwayIds: PathwayId[];
  outcomeCode: string | null;
}): "high" | "medium" | "low" {
  if (params.outcomeCode) return "high";

  let score = 0;
  if (params.intent !== "unknown") score += 2;
  if (params.topicId) score += 2;
  if (params.yearGroupId) score += 1;
  if (params.pathwayIds.length > 0) score += 1;

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

export function isPlanningCreationIntent(intent: AssistantIntent): boolean {
  return intent === "create-lesson" || intent === "create-scheme";
}

export function parseAssistantQuery(raw: string): ParsedAssistantQuery {
  const normalised = normalise(raw);
  const matchedTerms: string[] = [];

  const outcomeCode = detectOutcomeCode(raw);
  if (outcomeCode) matchedTerms.push(outcomeCode);

  let intent = detectIntent(normalised);
  const year = detectYearGroup(normalised);
  if (year.term) matchedTerms.push(year.term);

  const pathways = detectPathways(normalised);
  matchedTerms.push(...pathways.terms);

  const topic = detectTopic(normalised);
  if (topic.term) matchedTerms.push(topic.term);

  const lessonCount = detectLessonCount(normalised);
  if (lessonCount) matchedTerms.push(`${lessonCount} lessons`);

  const skillHint = detectSkillHint(normalised);
  if (skillHint) matchedTerms.push(skillHint);

  intent = inferIntentFromContext(intent, normalised);

  if (intent === "unknown" && (normalised.includes("coverage") || normalised.includes("not taught"))) {
    intent = normalised.includes("not taught") ? "show-gaps" : "coverage";
  }

  const confidence = scoreConfidence({
    intent,
    topicId: topic.topicId,
    yearGroupId: year.id,
    pathwayIds: pathways.pathways,
    outcomeCode,
  });

  return {
    raw,
    normalised,
    intent,
    yearGroupId: year.id,
    yearGroupLabel: year.label,
    pathwayIds: pathways.pathways,
    topicId: topic.topicId,
    topicLabel: topic.label,
    skillHint,
    lessonCount,
    outcomeCode,
    confidence,
    matchedTerms: [...new Set(matchedTerms)],
  };
}
