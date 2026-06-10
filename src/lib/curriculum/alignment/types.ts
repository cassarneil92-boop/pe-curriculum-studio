import type {
  LearningOutcome,
  PathwayId,
  Skill,
  Topic,
  ValueBasedPrinciple,
} from "../types";

/** Normalised query for strict curriculum alignment. */
export interface AlignmentQuery {
  pathwayId: PathwayId;
  yearGroup?: string;
  topicId: string;
  skillIds: string[];
}

/** Teacher-friendly alignment input — resolved to IDs before matching. */
export interface AlignmentInput {
  pathway: PathwayId | string;
  yearGroup?: string;
  topic: string;
  skill: string | string[];
}

/** Strict alignment result across curriculum entities. */
export interface AlignmentResult {
  learningOutcomes: LearningOutcome[];
  values: ValueBasedPrinciple[];
  skills: Skill[];
  topics: Topic[];
}
