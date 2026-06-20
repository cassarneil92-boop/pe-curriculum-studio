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

function normalise(raw: string): string {
  return raw.trim().toLowerCase().replace(/['']/g, "'").replace(/\s+/g, " ");
}

function detectIntent(q: string): AssistantIntent {
  for (const [intent, phrases] of Object.entries(INTENT_PHRASES)) {
    if (phrases.some((phrase) => q.includes(phrase))) {
      return intent as AssistantIntent;
    }
  }

  if (/\b(sow|scheme)\b/.test(q) && /\b(create|plan|build|start|make)\b/.test(q)) {
    return "create-scheme";
  }

  if (/\boutcomes?\b/.test(q) && /\b(find|show|list|year|form)\b/.test(q)) {
    return "find-outcomes";
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

function detectOutcomeCode(raw: string): string | null {
  const match = raw.match(/\b([A-Z]{1,3}\d+\.\d+[a-z]?)\b/i);
  return match ? match[1].toUpperCase() : null;
}

function inferIntentFromContext(
  intent: AssistantIntent,
  q: string,
  topicId: string | null,
  yearGroupId: YearGroupId | null
): AssistantIntent {
  if (intent !== "unknown") return intent;

  if (q.includes("missing") && q.includes("scheme")) return "missing-scheme";
  if (topicId && yearGroupId) return "find-outcomes";
  if (topicId) return "find-outcomes";

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

  intent = inferIntentFromContext(intent, normalised, topic.topicId, year.id);

  if (intent === "unknown" && (normalised.includes("coverage") || normalised.includes("not taught"))) {
    intent = normalised.includes("not taught") ? "show-gaps" : "coverage";
  }

  if (
    intent === "unknown" &&
    normalised.includes("create") &&
    (topic.topicId || normalised.includes("sow"))
  ) {
    intent = "create-scheme";
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
    skillHint: null,
    lessonCount,
    outcomeCode,
    confidence,
    matchedTerms: [...new Set(matchedTerms)],
  };
}
