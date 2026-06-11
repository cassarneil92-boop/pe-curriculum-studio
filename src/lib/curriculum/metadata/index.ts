export { METADATA_SKILL_PATTERNS } from "./skill-patterns";
export {
  inferSkillIdsFromText,
  mergeSkillIds,
  skillLabelsForIds,
} from "./infer-skills";
export {
  enhanceImportedOutcome,
  enhanceKnowledgeBaseOutcome,
  enhanceSkillMetadata,
  importedToLearningOutcome,
  type EnhancedSkillMetadata,
} from "./enhance";
export {
  getUnifiedCurriculumOutcomes,
  resolveLearningOutcomeById,
  resetUnifiedCurriculumOutcomesCache,
} from "./unified-outcomes";
export {
  runMetadataAudit,
  type MetadataAuditReport,
  type TopicAuditRow,
} from "./audit";
