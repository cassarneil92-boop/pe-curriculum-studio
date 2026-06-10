/**
 * Curriculum Knowledge Base — core models.
 * Intelligence architecture only. No AI, exports, or lesson generation.
 */

export type PathwayId =
  | "early-years-pe"
  | "primary-pe"
  | "middle-school-pe"
  | "secondary-pe"
  | "pe-option-sec"
  | "alp-pe"
  | "alp-sports-vocational"
  | "fitness-curriculum";

export type ValueTheme =
  | "fair-play"
  | "respect"
  | "teamwork"
  | "responsibility"
  | "inclusion"
  | "leadership";

/** Malta curriculum pathway. Owns learning outcomes. */
export interface CurriculumPathway {
  id: PathwayId;
  label: string;
  description: string;
}

/** Motor or tactical capability. Belongs to one or more topics. */
export interface Skill {
  id: string;
  name: string;
  topicIds: string[];
}

/**
 * Activity domain (e.g. Handball, Football).
 * Owns skills. Learning outcomes attach here.
 */
export interface Topic {
  id: string;
  name: string;
  skillIds: string[];
}

/** Formal curriculum outcome within a pathway. */
export interface LearningOutcome {
  id: string;
  code: string;
  description: string;
  pathwayId: PathwayId;
  topicIds: string[];
  skillIds: string[];
  valueIds: string[];
  assessmentIds: string[];
  strand: string;
  /** Optional year groups when sourced from imported curriculum data. */
  yearGroups?: string[];
}

/** Personal and social development principle linked to outcomes. */
export interface ValueBasedPrinciple {
  id: string;
  code: string;
  description: string;
  theme: ValueTheme;
  topicIds: string[];
  skillIds: string[];
}

/** Assessment approach aligned to a topic-skill combination. */
export interface AssessmentIdea {
  id: string;
  code: string;
  description: string;
  topicIds: string[];
  skillIds: string[];
}

/** Teacher planning context for strict curriculum matching. */
export interface StrictMatchContext {
  pathwayId: PathwayId;
  topicId: string;
  skillIds: string[];
}

/** Strict match result — only context-aligned curriculum intelligence. */
export interface StrictMatchResult {
  learningOutcomes: LearningOutcome[];
  values: ValueBasedPrinciple[];
  assessmentIdeas: AssessmentIdea[];
}

/** Full knowledge base catalogue. */
export interface CurriculumKnowledgeBase {
  pathways: CurriculumPathway[];
  topics: Topic[];
  skills: Skill[];
  learningOutcomes: LearningOutcome[];
  values: ValueBasedPrinciple[];
  assessmentIdeas: AssessmentIdea[];
}
