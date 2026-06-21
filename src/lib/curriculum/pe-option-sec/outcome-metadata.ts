import type { LearningOutcome } from "../types";
import type { LearningDomain, PhysicalLiteracyAttribute } from "../primary-pe/types";
import { isSecPlanningOutcome } from "./planning-bridge";
import { SEC_YEAR_LABELS } from "./progression-framework";
import type {
  AnatomySubtopic,
  AssessmentRelevance,
  ExamRelevance,
  FitnessTrainingSubtopic,
  HealthLifestyleSubtopic,
  PerformanceAnalysisSubtopic,
  SecProgressionMetadata,
  SecTopicCategory,
  SkillAcquisitionSubtopic,
  SportPsychologySubtopic,
} from "./types";

const EXPLICIT_METADATA: Record<string, Omit<SecProgressionMetadata, "outcomeId" | "inferred">> = {
  "lo-pe-option-sec-sec-lo1": {
    categories: ["skill-acquisition", "sport-psychology"],
    skillAcquisitionSubtopics: ["feedback", "guidance", "stages-of-learning"],
    psychologySubtopics: ["motivation", "goal-setting"],
    learningDomains: ["cognitive", "affective"],
    physicalLiteracy: ["motivation", "knowledge-understanding"],
    assessmentRelevance: ["exam-paper", "formative"],
    examRelevance: "high",
    yearLabels: ["Year 10", "Year 11"],
  },
  "lo-pe-option-sec-sec-lo2": {
    categories: ["fitness-training", "performance-analysis"],
    fitnessSubtopics: ["components-of-fitness", "principles-of-training", "methods-of-training"],
    performanceSubtopics: ["observation"],
    learningDomains: ["cognitive", "physical"],
    physicalLiteracy: ["competence", "knowledge-understanding"],
    assessmentRelevance: ["exam-paper", "formative", "practical-assessment"],
    examRelevance: "high",
    yearLabels: ["Year 10", "Year 11"],
  },
  "lo-pe-option-sec-sec-lo3": {
    categories: ["health-lifestyle"],
    lifestyleSubtopics: ["physical-activity", "wellbeing"],
    learningDomains: ["cognitive", "affective"],
    physicalLiteracy: ["motivation", "knowledge-understanding"],
    assessmentRelevance: ["exam-paper", "coursework"],
    examRelevance: "high",
    yearLabels: ["Year 10", "Year 11"],
  },
  "lo-pe-option-sec-sec-lo4": {
    categories: ["anatomy-physiology"],
    anatomySubtopics: ["muscular-system", "cardiovascular-system", "respiratory-system"],
    learningDomains: ["cognitive"],
    physicalLiteracy: ["knowledge-understanding"],
    assessmentRelevance: ["exam-paper", "formative"],
    examRelevance: "high",
    yearLabels: ["Year 10", "Year 11"],
  },
  "lo-pe-option-sec-sec-lo5": {
    categories: ["health-lifestyle"],
    lifestyleSubtopics: ["physical-activity", "wellbeing"],
    learningDomains: ["cognitive", "social"],
    physicalLiteracy: ["knowledge-understanding"],
    assessmentRelevance: ["exam-paper", "coursework"],
    examRelevance: "medium",
    yearLabels: ["Year 10", "Year 11"],
  },
  "lo-pe-option-sec-sec-lo6": {
    categories: ["practical-sport", "performance-analysis"],
    performanceSubtopics: ["observation", "evaluation"],
    learningDomains: ["physical", "cognitive"],
    physicalLiteracy: ["competence", "confidence"],
    assessmentRelevance: ["practical-assessment", "summative"],
    examRelevance: "practical-only",
    yearLabels: ["Year 10", "Year 11"],
  },
  "lo-pe-option-sec-sec-lo7": {
    categories: ["practical-sport", "performance-analysis"],
    performanceSubtopics: ["evaluation", "improvement-planning"],
    learningDomains: ["physical", "social", "affective"],
    physicalLiteracy: ["competence", "confidence", "motivation"],
    assessmentRelevance: ["practical-assessment", "coursework"],
    examRelevance: "practical-only",
    yearLabels: ["Year 10", "Year 11"],
  },
  "lo-pe-option-sec-sec-lo8": {
    categories: ["practical-sport", "performance-analysis"],
    performanceSubtopics: ["observation", "evaluation", "improvement-planning"],
    learningDomains: ["physical", "cognitive", "social"],
    physicalLiteracy: ["competence", "confidence", "knowledge-understanding"],
    assessmentRelevance: ["practical-assessment", "coursework", "summative"],
    examRelevance: "practical-only",
    yearLabels: ["Year 10", "Year 11"],
  },
  "lo-pe-option-sec-sec-lo9": {
    categories: ["practical-sport", "performance-analysis"],
    performanceSubtopics: ["observation", "evaluation", "improvement-planning"],
    learningDomains: ["physical", "cognitive", "social"],
    physicalLiteracy: ["competence", "confidence", "knowledge-understanding"],
    assessmentRelevance: ["practical-assessment", "coursework", "summative"],
    examRelevance: "practical-only",
    yearLabels: ["Year 10", "Year 11"],
  },
  "lo-pe-option-sec-sec-lo10": {
    categories: ["practical-sport", "performance-analysis"],
    performanceSubtopics: ["observation", "evaluation", "improvement-planning"],
    learningDomains: ["physical", "cognitive", "social"],
    physicalLiteracy: ["competence", "confidence", "knowledge-understanding"],
    assessmentRelevance: ["practical-assessment", "coursework", "summative"],
    examRelevance: "practical-only",
    yearLabels: ["Year 10", "Year 11"],
  },
  "opt-hb-pass-1": {
    categories: ["practical-sport", "performance-analysis"],
    performanceSubtopics: ["observation", "evaluation"],
    learningDomains: ["physical", "cognitive"],
    physicalLiteracy: ["competence", "knowledge-understanding"],
    assessmentRelevance: ["practical-assessment", "formative"],
    examRelevance: "practical-only",
    yearLabels: ["Year 10", "Year 11"],
  },
};

const COGNITIVE = /\b(understand|explain|identify|describe|define|recognise|recognize|analyse|analyze|present|demonstrate knowledge)\b/i;
const SOCIAL = /\b(cooperat|team|partner|group|lead|communicat|leadership|interview)\b/i;
const AFFECTIVE = /\b(enjoy|motivat|confident|effort|positive|safe|willing|arousal|aggression|personality)\b/i;
const MOTIVATION = /\b(motivat|arousal|participat|active|commit)\b/i;
const CONFIDENCE = /\b(confident|attempt|willing|success|safe)\b/i;
const KNOWLEDGE = /\b(understand|know|explain|define|recognise|recognize|principle|system)\b/i;

function inferAnatomySubtopics(text: string): AnatomySubtopic[] {
  const topics = new Set<AnatomySubtopic>();
  const lower = text.toLowerCase();
  if (/skeletal|bone|joint/i.test(lower)) topics.add("skeletal-system");
  if (/muscular|musculoskeletal|muscle/i.test(lower)) topics.add("muscular-system");
  if (/cardio|cardiorespiratory|heart|circulat/i.test(lower)) topics.add("cardiovascular-system");
  if (/respirat|lung|breath|oxygen/i.test(lower)) topics.add("respiratory-system");
  return [...topics];
}

function inferFitnessSubtopics(text: string): FitnessTrainingSubtopic[] {
  const topics = new Set<FitnessTrainingSubtopic>();
  const lower = text.toLowerCase();
  if (/fitness component|component of fitness/i.test(lower)) topics.add("components-of-fitness");
  if (/principle|overload|progression|specificity/i.test(lower)) topics.add("principles-of-training");
  if (/training concept|method|interval|circuit|continuous/i.test(lower)) topics.add("methods-of-training");
  return [...topics];
}

function inferSkillAcquisitionSubtopics(text: string): SkillAcquisitionSubtopic[] {
  const topics = new Set<SkillAcquisitionSubtopic>();
  const lower = text.toLowerCase();
  if (/stage|learning|skill/i.test(lower)) topics.add("stages-of-learning");
  if (/feedback/i.test(lower)) topics.add("feedback");
  if (/guidance|information processing/i.test(lower)) topics.add("guidance");
  if (/practice|drill|repetition/i.test(lower)) topics.add("practice-types");
  return [...topics];
}

function inferPsychologySubtopics(text: string): SportPsychologySubtopic[] {
  const topics = new Set<SportPsychologySubtopic>();
  const lower = text.toLowerCase();
  if (/motivat|arousal|aggression/i.test(lower)) topics.add("motivation");
  if (/smart target|goal/i.test(lower)) topics.add("goal-setting");
  if (/confident|personality/i.test(lower)) topics.add("confidence");
  if (/anxiety|stress|arousal/i.test(lower)) topics.add("anxiety");
  if (/concentrat|focus/i.test(lower)) topics.add("concentration");
  return [...topics];
}

function inferPerformanceSubtopics(text: string): PerformanceAnalysisSubtopic[] {
  const topics = new Set<PerformanceAnalysisSubtopic>();
  const lower = text.toLowerCase();
  if (/observe|collect.*data|interview/i.test(lower)) topics.add("observation");
  if (/evaluat|analyse|analyze/i.test(lower)) topics.add("evaluation");
  if (/improve|plan|session plan|training session/i.test(lower)) topics.add("improvement-planning");
  return [...topics];
}

function inferLifestyleSubtopics(text: string): HealthLifestyleSubtopic[] {
  const topics = new Set<HealthLifestyleSubtopic>();
  const lower = text.toLowerCase();
  if (/physical activity|sport|leisure|active/i.test(lower)) topics.add("physical-activity");
  if (/nutrition|diet|food/i.test(lower)) topics.add("nutrition");
  if (/recover|rest/i.test(lower)) topics.add("recovery");
  if (/wellbeing|well-being|health|fitness/i.test(lower)) topics.add("wellbeing");
  return [...topics];
}

function inferCategories(
  anatomy: AnatomySubtopic[],
  fitness: FitnessTrainingSubtopic[],
  skillAcq: SkillAcquisitionSubtopic[],
  psychology: SportPsychologySubtopic[],
  performance: PerformanceAnalysisSubtopic[],
  lifestyle: HealthLifestyleSubtopic[],
  text: string
): SecTopicCategory[] {
  const categories = new Set<SecTopicCategory>();
  if (anatomy.length) categories.add("anatomy-physiology");
  if (fitness.length) categories.add("fitness-training");
  if (skillAcq.length) categories.add("skill-acquisition");
  if (psychology.length) categories.add("sport-psychology");
  if (performance.length) categories.add("performance-analysis");
  if (lifestyle.length) categories.add("health-lifestyle");
  if (/perform|officiat|trek|swim|athletic|precision|accuracy/i.test(text)) {
    categories.add("practical-sport");
  }
  if (categories.size === 0) categories.add("health-lifestyle");
  return [...categories];
}

function inferDomains(text: string, outcome: LearningOutcome): LearningDomain[] {
  const domains = new Set<LearningDomain>();
  if (/perform|demonstrate|practice|trek|swim|officiat/i.test(text)) domains.add("physical");
  if (COGNITIVE.test(text)) domains.add("cognitive");
  if (SOCIAL.test(text)) domains.add("social");
  if (AFFECTIVE.test(text)) domains.add("affective");
  if (outcome.skillIds.includes("analysis") || outcome.skillIds.includes("officiating")) {
    domains.add("cognitive");
  }
  if (domains.size === 0) domains.add("cognitive");
  return [...domains];
}

function inferPhysicalLiteracy(text: string, domains: LearningDomain[]): PhysicalLiteracyAttribute[] {
  const attrs = new Set<PhysicalLiteracyAttribute>();
  if (MOTIVATION.test(text)) attrs.add("motivation");
  if (CONFIDENCE.test(text)) attrs.add("confidence");
  if (KNOWLEDGE.test(text)) attrs.add("knowledge-understanding");
  if (domains.includes("physical")) attrs.add("competence");
  return [...attrs];
}

function inferAssessmentRelevance(text: string, categories: SecTopicCategory[]): AssessmentRelevance[] {
  const relevance = new Set<AssessmentRelevance>();
  if (categories.includes("practical-sport")) {
    relevance.add("practical-assessment");
    relevance.add("coursework");
  }
  if (/test|exam|define|explain|understand/i.test(text)) relevance.add("exam-paper");
  if (/observe|evaluat|interview|session plan/i.test(text)) relevance.add("coursework");
  relevance.add("formative");
  return [...relevance];
}

function inferExamRelevance(categories: SecTopicCategory[]): ExamRelevance {
  if (categories.includes("practical-sport") && categories.length === 1) return "practical-only";
  if (
    categories.includes("anatomy-physiology") ||
    categories.includes("fitness-training") ||
    categories.includes("skill-acquisition") ||
    categories.includes("sport-psychology")
  ) {
    return "high";
  }
  return "medium";
}

function normaliseYearLabels(outcome: LearningOutcome): string[] {
  const labels = (outcome.yearGroups ?? []).filter(
    (yg) =>
      SEC_YEAR_LABELS.includes(yg as (typeof SEC_YEAR_LABELS)[number]) ||
      yg === "Form 4" ||
      yg === "Form 5"
  );
  return labels.length > 0 ? labels : [...SEC_YEAR_LABELS];
}

export function buildSecProgressionMetadata(
  outcome: LearningOutcome
): SecProgressionMetadata | null {
  if (!isSecPlanningOutcome(outcome)) return null;

  const explicit = EXPLICIT_METADATA[outcome.id];
  if (explicit) {
    return { outcomeId: outcome.id, ...explicit, inferred: false };
  }

  const text = outcome.description;
  const anatomySubtopics = inferAnatomySubtopics(text);
  const fitnessSubtopics = inferFitnessSubtopics(text);
  const skillAcquisitionSubtopics = inferSkillAcquisitionSubtopics(text);
  const psychologySubtopics = inferPsychologySubtopics(text);
  const performanceSubtopics = inferPerformanceSubtopics(text);
  const lifestyleSubtopics = inferLifestyleSubtopics(text);
  const categories = inferCategories(
    anatomySubtopics,
    fitnessSubtopics,
    skillAcquisitionSubtopics,
    psychologySubtopics,
    performanceSubtopics,
    lifestyleSubtopics,
    text
  );
  const learningDomains = inferDomains(text, outcome);
  const physicalLiteracy = inferPhysicalLiteracy(text, learningDomains);
  const assessmentRelevance = inferAssessmentRelevance(text, categories);
  const examRelevance = inferExamRelevance(categories);

  return {
    outcomeId: outcome.id,
    categories,
    anatomySubtopics: anatomySubtopics.length ? anatomySubtopics : undefined,
    fitnessSubtopics: fitnessSubtopics.length ? fitnessSubtopics : undefined,
    skillAcquisitionSubtopics: skillAcquisitionSubtopics.length ? skillAcquisitionSubtopics : undefined,
    psychologySubtopics: psychologySubtopics.length ? psychologySubtopics : undefined,
    performanceSubtopics: performanceSubtopics.length ? performanceSubtopics : undefined,
    lifestyleSubtopics: lifestyleSubtopics.length ? lifestyleSubtopics : undefined,
    learningDomains,
    physicalLiteracy: physicalLiteracy.length ? physicalLiteracy : undefined,
    assessmentRelevance,
    examRelevance,
    yearLabels: normaliseYearLabels(outcome),
    inferred: true,
  };
}

export function buildSecMetadataIndex(
  outcomes: LearningOutcome[]
): Map<string, SecProgressionMetadata> {
  const index = new Map<string, SecProgressionMetadata>();
  for (const outcome of outcomes) {
    const metadata = buildSecProgressionMetadata(outcome);
    if (metadata) index.set(outcome.id, metadata);
  }
  return index;
}
