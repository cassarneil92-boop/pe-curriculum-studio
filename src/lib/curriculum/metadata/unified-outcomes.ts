import { IMPORTED_LEARNING_OUTCOMES } from "../coverage/coverage-engine";
import { LEARNING_OUTCOMES } from "../learning-outcomes";
import type { LearningOutcome } from "../types";
import {
  enhanceImportedOutcome,
  enhanceKnowledgeBaseOutcome,
  importedToLearningOutcome,
} from "./enhance";

let cachedOutcomes: LearningOutcome[] | null = null;

/** All curriculum outcomes: knowledge base + imported JSON, with metadata enhancement applied. */
export function getUnifiedCurriculumOutcomes(): LearningOutcome[] {
  if (cachedOutcomes) return cachedOutcomes;

  const byId = new Map<string, LearningOutcome>();

  for (const imported of IMPORTED_LEARNING_OUTCOMES) {
    const enhanced = enhanceImportedOutcome(imported);
    byId.set(enhanced.id, importedToLearningOutcome(enhanced));
  }

  for (const kb of LEARNING_OUTCOMES) {
    const enhanced = enhanceKnowledgeBaseOutcome(kb);
    byId.set(enhanced.id, enhanced);
  }

  cachedOutcomes = [...byId.values()];
  return cachedOutcomes;
}

export function resetUnifiedCurriculumOutcomesCache(): void {
  cachedOutcomes = null;
}
