/**
 * Curriculum Knowledge Base
 *
 * Typed intelligence architecture for Malta PE curriculum.
 * Pathway → Learning Outcomes → Topics → Skills → Values
 *
 * No AI · No exports · No lesson generators
 */

export type {
  AssessmentIdea,
  CurriculumKnowledgeBase,
  CurriculumPathway,
  LearningOutcome,
  PathwayId,
  Skill,
  StrictMatchContext,
  StrictMatchResult,
  Topic,
  ValueBasedPrinciple,
  ValueTheme,
} from "./types";

export { PATHWAYS } from "./pathways";
export { TOPICS } from "./topics";
export { SKILLS } from "./skills";
export { LEARNING_OUTCOMES } from "./learning-outcomes";
export { VALUES } from "./values";
export { ASSESSMENT_IDEAS } from "./assessments";

export {
  KNOWLEDGE_BASE,
  getAssessmentById,
  getLearningOutcomeById,
  getOutcomesByPathway,
  getPathwayById,
  getSkillById,
  getSkillsForTopic,
  getTopicById,
  getTopicsForOutcome,
  getValueById,
  getValuesForOutcome,
} from "./registry";

export {
  strictMatch,
  strictMatchAssessments,
  strictMatchLearningOutcomes,
  strictMatchValues,
  validateContextSkills,
  validateStrictAlignment,
} from "./strict-match";

export type {
  AlignmentInput,
  AlignmentQuery,
  AlignmentResult,
} from "./alignment";

export {
  getUnifiedCurriculumOutcomes,
  enhanceImportedOutcome,
  enhanceKnowledgeBaseOutcome,
  inferSkillIdsFromText,
} from "./metadata";

export {
  alignCurriculum,
  alignCurriculumFromInput,
  findLearningOutcomes,
  findRelevantSkills,
  findRelevantTopics,
  findRelevantValues,
  resolveAlignmentQuery,
  validateAlignmentQuery,
} from "./alignment";

export {
  getPlanningOutcomes,
  filterPlanningOutcomes,
  getPlanningTopicOptions,
  getPlanningSkillOptions,
  getPlanningOutcomeSuggestions,
  getPlanningTopicDisplayName,
  getPlanningOutcomePathwayBadges,
} from "./planning";
