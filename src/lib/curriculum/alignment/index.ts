export type { AlignmentInput, AlignmentQuery, AlignmentResult } from "./types";

export {
  alignCurriculum,
  alignCurriculumFromInput,
  findLearningOutcomes,
  findRelevantSkills,
  findRelevantTopics,
  findRelevantValues,
  resolveAlignmentQuery,
  validateAlignmentQuery,
} from "./alignment-engine";
