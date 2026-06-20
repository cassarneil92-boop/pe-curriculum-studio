export {
  buildAssistantSchemeDraft,
  duplicateAssistantSchemeDraft,
  schemeDraftReviewMessage,
  type AssistantSchemeDraft,
  type AssistantSchemeDraftResult,
} from "./scheme-draft-builder";
export {
  buildAssistantSchemeQualityReport,
  type AssistantSchemeQualityReport,
} from "./scheme-quality";
export {
  computeAssistantConfidence,
  confidenceTone,
  type AssistantConfidenceLevel,
  type AssistantConfidenceReport,
} from "./assistant-confidence";
export { buildLessonBuilderDraftFromScheme } from "./scheme-to-lesson-builder";
export type { AssistantSchemeDraftSource } from "./responses";
export { parseAssistantQuery, type ParsedAssistantQuery, type AssistantIntent } from "./query-parser";
export {
  buildAssistantResponse,
  buildAssistantResponseFromPrompt,
  SUGGESTED_PROMPT_CHIPS,
  type AssistantResponse,
  type AssistantQueryContext,
  type DetectedContext,
  type CurriculumMatch,
  type PlanningSequenceStep,
  type AssistantAction,
} from "./responses";
export {
  SUGGESTED_PROMPT_CHIPS as PROMPT_CHIPS,
  TOPIC_SYNONYM_MAP,
  YEAR_GROUP_SYNONYMS,
  PATHWAY_SYNONYM_RULES,
} from "./synonyms";
