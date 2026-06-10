import { ASSESSMENT_IDEAS } from "./assessments";
import { LEARNING_OUTCOMES } from "./learning-outcomes";
import { PATHWAYS } from "./pathways";
import { SKILLS } from "./skills";
import { TOPICS } from "./topics";
import type {
  AssessmentIdea,
  CurriculumKnowledgeBase,
  CurriculumPathway,
  LearningOutcome,
  Skill,
  Topic,
  ValueBasedPrinciple,
} from "./types";
import { VALUES } from "./values";

/** Immutable curriculum knowledge base — single source of truth. */
export const KNOWLEDGE_BASE: CurriculumKnowledgeBase = {
  pathways: PATHWAYS,
  topics: TOPICS,
  skills: SKILLS,
  learningOutcomes: LEARNING_OUTCOMES,
  values: VALUES,
  assessmentIdeas: ASSESSMENT_IDEAS,
};

export function getPathwayById(id: string): CurriculumPathway | undefined {
  return PATHWAYS.find((p) => p.id === id);
}

export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

export function getLearningOutcomeById(id: string): LearningOutcome | undefined {
  return LEARNING_OUTCOMES.find((lo) => lo.id === id);
}

export function getValueById(id: string): ValueBasedPrinciple | undefined {
  return VALUES.find((v) => v.id === id);
}

export function getAssessmentById(id: string): AssessmentIdea | undefined {
  return ASSESSMENT_IDEAS.find((a) => a.id === id);
}

/** Learning outcomes owned by a pathway. */
export function getOutcomesByPathway(pathwayId: string): LearningOutcome[] {
  return LEARNING_OUTCOMES.filter((lo) => lo.pathwayId === pathwayId);
}

/** Skills available within a topic. */
export function getSkillsForTopic(topicId: string): Skill[] {
  const topic = getTopicById(topicId);
  if (!topic) return [];
  return SKILLS.filter((s) => topic.skillIds.includes(s.id));
}

/** Topics referenced by a learning outcome. */
export function getTopicsForOutcome(outcomeId: string): Topic[] {
  const outcome = getLearningOutcomeById(outcomeId);
  if (!outcome) return [];
  return TOPICS.filter((t) => outcome.topicIds.includes(t.id));
}

/** Values linked to a learning outcome. */
export function getValuesForOutcome(outcomeId: string): ValueBasedPrinciple[] {
  const outcome = getLearningOutcomeById(outcomeId);
  if (!outcome) return [];
  return VALUES.filter((v) => outcome.valueIds.includes(v.id));
}
