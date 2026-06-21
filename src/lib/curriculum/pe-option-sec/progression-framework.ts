import type {
  AnatomySubtopic,
  AssessmentRelevance,
  FitnessTrainingSubtopic,
  HealthLifestyleSubtopic,
  PerformanceAnalysisSubtopic,
  SecTopicCategory,
  SkillAcquisitionSubtopic,
  SportPsychologySubtopic,
} from "./types";

export const SEC_YEAR_LABELS = ["Year 9", "Year 10", "Year 11"] as const;

export const SEC_CATEGORY_LABELS: Record<SecTopicCategory, string> = {
  "anatomy-physiology": "Anatomy & Physiology",
  "fitness-training": "Fitness & Training",
  "skill-acquisition": "Skill Acquisition",
  "sport-psychology": "Sport Psychology",
  "performance-analysis": "Performance Analysis",
  "health-lifestyle": "Health & Lifestyle",
  "practical-sport": "Practical Sport",
};

export const ANATOMY_SUBTOPIC_LABELS: Record<AnatomySubtopic, string> = {
  "skeletal-system": "Skeletal system",
  "muscular-system": "Muscular system",
  "cardiovascular-system": "Cardiovascular system",
  "respiratory-system": "Respiratory system",
};

export const FITNESS_SUBTOPIC_LABELS: Record<FitnessTrainingSubtopic, string> = {
  "components-of-fitness": "Components of fitness",
  "principles-of-training": "Principles of training",
  "methods-of-training": "Methods of training",
};

export const SKILL_ACQUISITION_LABELS: Record<SkillAcquisitionSubtopic, string> = {
  "stages-of-learning": "Stages of learning",
  feedback: "Feedback",
  guidance: "Guidance",
  "practice-types": "Practice types",
};

export const SPORT_PSYCHOLOGY_LABELS: Record<SportPsychologySubtopic, string> = {
  motivation: "Motivation",
  "goal-setting": "Goal setting",
  confidence: "Confidence",
  anxiety: "Anxiety",
  concentration: "Concentration",
};

export const PERFORMANCE_ANALYSIS_LABELS: Record<PerformanceAnalysisSubtopic, string> = {
  observation: "Observation",
  evaluation: "Evaluation",
  "improvement-planning": "Improvement planning",
};

export const HEALTH_LIFESTYLE_LABELS: Record<HealthLifestyleSubtopic, string> = {
  "physical-activity": "Physical activity",
  nutrition: "Nutrition",
  recovery: "Recovery",
  wellbeing: "Wellbeing",
};

export const ASSESSMENT_RELEVANCE_LABELS: Record<AssessmentRelevance, string> = {
  formative: "Formative assessment",
  summative: "Summative assessment",
  coursework: "Coursework",
  "exam-paper": "Exam paper",
  "practical-assessment": "Practical assessment",
};

export const ALL_SEC_CATEGORIES: SecTopicCategory[] = [
  "anatomy-physiology",
  "fitness-training",
  "skill-acquisition",
  "sport-psychology",
  "performance-analysis",
  "health-lifestyle",
  "practical-sport",
];

/** Theory categories prioritised for exam revision. */
export const SEC_EXAM_THEORY_CATEGORIES: SecTopicCategory[] = [
  "anatomy-physiology",
  "fitness-training",
  "skill-acquisition",
  "sport-psychology",
  "health-lifestyle",
];

export const CATEGORY_STRONG_THRESHOLD = 2;
export const CATEGORY_THIN_THRESHOLD = 1;
export const DOMAIN_STRONG_THRESHOLD = 4;
export const PL_STRONG_THRESHOLD = 3;
export const ASSESSMENT_STRONG_THRESHOLD = 3;

export const SEC_REVISION_TOPIC_ORDER: SecTopicCategory[] = [
  "anatomy-physiology",
  "fitness-training",
  "skill-acquisition",
  "sport-psychology",
  "performance-analysis",
  "health-lifestyle",
  "practical-sport",
];
