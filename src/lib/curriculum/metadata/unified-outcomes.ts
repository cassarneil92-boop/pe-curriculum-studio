import { IMPORTED_LEARNING_OUTCOMES } from "../coverage/coverage-engine";
import { LEARNING_OUTCOMES } from "../learning-outcomes";
import type { LearningOutcome } from "../types";
import {
  enhanceImportedOutcome,
  enhanceKnowledgeBaseOutcome,
  importedToLearningOutcome,
} from "./enhance";

let cachedOutcomes: LearningOutcome[] | null = null;
let cachedById: Map<string, LearningOutcome> | null = null;
let cachedByCode: Map<string, LearningOutcome> | null = null;

function buildOutcomeCaches(): void {
  if (cachedOutcomes && cachedById && cachedByCode) return;

  const byId = new Map<string, LearningOutcome>();
  const byCode = new Map<string, LearningOutcome>();

  for (const imported of IMPORTED_LEARNING_OUTCOMES) {
    const enhanced = enhanceImportedOutcome(imported);
    const outcome = importedToLearningOutcome(enhanced);
    byId.set(outcome.id, outcome);
    if (outcome.code) byCode.set(outcome.code.toLowerCase(), outcome);
  }

  for (const kb of LEARNING_OUTCOMES) {
    const enhanced = enhanceKnowledgeBaseOutcome(kb);
    byId.set(enhanced.id, enhanced);
    if (enhanced.code) byCode.set(enhanced.code.toLowerCase(), enhanced);
  }

  cachedOutcomes = [...byId.values()];
  cachedById = byId;
  cachedByCode = byCode;
}

/** All curriculum outcomes: knowledge base + imported JSON, with metadata enhancement applied. */
export function getUnifiedCurriculumOutcomes(): LearningOutcome[] {
  buildOutcomeCaches();
  return cachedOutcomes!;
}

/** Resolve a stored outcome id (or legacy code) against the full curriculum catalogue. */
export function resolveLearningOutcomeById(idOrCode: string): LearningOutcome | undefined {
  const trimmed = idOrCode.trim();
  if (!trimmed) return undefined;

  buildOutcomeCaches();
  return cachedById!.get(trimmed) ?? cachedByCode!.get(trimmed.toLowerCase());
}

export function resetUnifiedCurriculumOutcomesCache(): void {
  cachedOutcomes = null;
  cachedById = null;
  cachedByCode = null;
}
