/** Sport intelligence dimensions for every activity area. */
export type SportDimension =
  | "technical"
  | "tactical"
  | "physical"
  | "psychological"
  | "social";

export type PedagogyModel =
  | "tgfu"
  | "whole-part-whole"
  | "whole-analytical-whole"
  | "constraints-led"
  | "sport-education"
  | "cooperative-learning";

export type SportId =
  | "football"
  | "basketball"
  | "volleyball"
  | "handball"
  | "athletics"
  | "gymnastics"
  | "dance"
  | "racket-sports";

export interface SportSkillDefinition {
  id: string;
  label: string;
  progressionOrder: number;
  prerequisiteIds?: string[];
}

export interface SportLessonPhase {
  id: string;
  label: string;
  order: number;
}

export interface SportDefinition {
  id: SportId;
  topicIds: string[];
  label: string;
  skills: SportSkillDefinition[];
  lessonPhases: SportLessonPhase[];
  recommendedPedagogy: PedagogyModel[];
  resources: string[];
  dimensions: SportDimension[];
}

export interface SportProgressionMetadata {
  outcomeId: string;
  sportId?: SportId;
  skillIds: string[];
  dimensions: SportDimension[];
  inferred: boolean;
}

export interface SportProgressionQuery {
  sportId?: SportId;
  topicId?: string;
  skillId?: string;
  yearGroup?: string;
  dimension?: SportDimension;
}

export interface SportProgressionResult {
  sport: SportDefinition | null;
  skill: SportSkillDefinition | null;
  outcomes: import("../types").LearningOutcome[];
  relatedSkills: SportSkillDefinition[];
  lessonPhases: SportLessonPhase[];
  recommendedPedagogy: PedagogyModel[];
  resources: string[];
  narrative?: string;
}

export interface SportDepthRow {
  sportId: SportId;
  label: string;
  outcomeCount: number;
  skillCount: number;
  skillsCovered: number;
  progressionCompleteness: number;
  status: "strong" | "thin" | "missing";
}

export interface SportSkillCoverageRow {
  sportId: SportId;
  sportLabel: string;
  skillId: string;
  skillLabel: string;
  outcomeCount: number;
  status: "strong" | "thin" | "missing";
}

export interface SportGapItem {
  id: string;
  title: string;
  status: "strong" | "thin" | "missing" | "needs-review";
  detail: string;
}

export interface SportIntelligenceDashboardSummary {
  totalSportOutcomes: number;
  sportsTracked: number;
  sportDepth: SportDepthRow[];
  skillCoverage: SportSkillCoverageRow[];
  gapAnalysis: SportGapItem[];
  missingSports: SportId[];
  overallStatus: "strong" | "thin" | "needs-review";
}

export interface SportLessonDesignHints {
  walt: string[];
  wilf: string[];
  activities: string[];
  assessment: string[];
  reflection: string[];
  pedagogy: string[];
  resources: string[];
}
