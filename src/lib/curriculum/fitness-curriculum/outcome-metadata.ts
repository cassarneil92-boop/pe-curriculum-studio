import { getFitnessStrandForCode } from "@/src/lib/intelligence/frameworks/fitness-strands";
import type { LearningOutcome } from "../types";
import type { LearningDomain, PhysicalLiteracyAttribute } from "../primary-pe/types";
import { isFitnessPlanningOutcome } from "./planning-bridge";
import { FITNESS_YEAR_LABELS } from "./progression-framework";
import type {
  FitnessCategory,
  FitnessProgressionMetadata,
  FitnessProgressionStage,
  FitnessTestType,
  HealthLifestyleTopic,
  HealthRelatedComponent,
  SkillRelatedComponent,
  TrainingMethod,
  TrainingPrinciple,
} from "./types";

const EXPLICIT_METADATA: Record<string, Omit<FitnessProgressionMetadata, "outcomeId" | "inferred">> = {
  "fit-end-1": {
    categories: ["health-related-fitness", "training-methods"],
    healthComponents: ["cardiovascular-endurance"],
    trainingMethods: ["continuous-training"],
    progressionStage: "application",
    learningDomains: ["physical", "cognitive"],
    physicalLiteracy: ["competence", "motivation"],
    yearLabels: ["Year 9", "Year 10", "Year 11"],
  },
  "fit-str-1": {
    categories: ["health-related-fitness", "training-methods", "training-principles"],
    healthComponents: ["muscular-strength"],
    trainingMethods: ["resistance-training"],
    trainingPrinciples: ["overload", "progression"],
    progressionStage: "application",
    learningDomains: ["physical"],
    physicalLiteracy: ["competence", "confidence"],
    yearLabels: ["Year 9", "Year 10", "Year 11"],
  },
};

const COGNITIVE = /\b(understand|explain|identify|describe|plan|design|interpret|analyse|analyze|know|goal|programme|program)\b/i;
const SOCIAL = /\b(cooperat|team|partner|group|lead|communicat|support)\b/i;
const AFFECTIVE = /\b(enjoy|motivat|confident|effort|positive|safe|willing)\b/i;
const MOTIVATION = /\b(enjoy|motivat|participat|active|adherence|commit)\b/i;
const CONFIDENCE = /\b(confident|attempt|willing|success|safe)\b/i;
const KNOWLEDGE = /\b(understand|know|explain|healthy|nutrition|sleep|recovery|principle)\b/i;

function inferHealthComponent(text: string, skillIds: string[]): HealthRelatedComponent[] {
  const components = new Set<HealthRelatedComponent>();
  const lower = text.toLowerCase();
  if (/cardio|aerobic|endurance|shuttle|continuous/i.test(lower) || skillIds.includes("endurance")) {
    components.add("cardiovascular-endurance");
  }
  if (/muscular endurance|repetition|plank/i.test(lower)) {
    components.add("muscular-endurance");
  }
  if (/strength|resist|bodyweight|lift/i.test(lower) || skillIds.includes("strength")) {
    components.add("muscular-strength");
  }
  if (/flexib|stretch|range of motion/i.test(lower) || skillIds.includes("flexibility")) {
    components.add("flexibility");
  }
  if (/body composition|bmi|healthy weight/i.test(lower)) {
    components.add("body-composition");
  }
  return [...components];
}

function inferSkillComponent(text: string, skillIds: string[]): SkillRelatedComponent[] {
  const components = new Set<SkillRelatedComponent>();
  const lower = text.toLowerCase();
  if (/agil|hexagon|change of direction/i.test(lower) || skillIds.includes("agility")) {
    components.add("agility");
  }
  if (/balance|stabil/i.test(lower) || skillIds.includes("balance")) {
    components.add("balance");
  }
  if (/coordin/i.test(lower) || skillIds.includes("coordination")) {
    components.add("coordination");
  }
  if (/power|explosive|jump/i.test(lower) || skillIds.includes("power")) {
    components.add("power");
  }
  if (/reaction|response time/i.test(lower)) {
    components.add("reaction-time");
  }
  if (/speed|sprint|fast/i.test(lower) || skillIds.includes("speed")) {
    components.add("speed");
  }
  return [...components];
}

function inferTrainingMethods(text: string): TrainingMethod[] {
  const methods = new Set<TrainingMethod>();
  const lower = text.toLowerCase();
  if (/continuous|steady/i.test(lower)) methods.add("continuous-training");
  if (/interval|work.?rest/i.test(lower)) methods.add("interval-training");
  if (/circuit/i.test(lower)) methods.add("circuit-training");
  if (/fartlek/i.test(lower)) methods.add("fartlek-training");
  if (/resist|weight|bodyweight|strength training/i.test(lower)) methods.add("resistance-training");
  if (/stretch|flexib/i.test(lower)) methods.add("flexibility-training");
  return [...methods];
}

function inferTrainingPrinciples(text: string): TrainingPrinciple[] {
  const principles = new Set<TrainingPrinciple>();
  const lower = text.toLowerCase();
  if (/specific/i.test(lower)) principles.add("specificity");
  if (/overload|intensity|frequency/i.test(lower)) principles.add("overload");
  if (/progress/i.test(lower)) principles.add("progression");
  if (/reversib|detrain/i.test(lower)) principles.add("reversibility");
  if (/variety|variation/i.test(lower)) principles.add("variation");
  if (/recover|rest/i.test(lower)) principles.add("recovery");
  return [...principles];
}

function inferTestTypes(text: string): FitnessTestType[] {
  const tests = new Set<FitnessTestType>();
  const lower = text.toLowerCase();
  if (/shuttle|beep|aerobic|vo2/i.test(lower)) tests.add("aerobic-test");
  if (/strength test|1rm|rep max/i.test(lower)) tests.add("strength-test");
  if (/endurance test|plank|2.?minute/i.test(lower)) tests.add("endurance-test");
  if (/sit.?reach|flexib.*test/i.test(lower)) tests.add("flexibility-test");
  if (/hexagon|agility test/i.test(lower)) tests.add("agility-test");
  return [...tests];
}

function inferLifestyleTopics(text: string): HealthLifestyleTopic[] {
  const topics = new Set<HealthLifestyleTopic>();
  const lower = text.toLowerCase();
  if (/nutrition|diet|food|hydrat/i.test(lower)) topics.add("nutrition");
  if (/recover|rest day/i.test(lower)) topics.add("recovery");
  if (/sleep/i.test(lower)) topics.add("sleep");
  if (/physical activity|active lifestyle|active/i.test(lower)) topics.add("physical-activity");
  if (/sedentary|screen time|sitting/i.test(lower)) topics.add("sedentary-behaviour");
  if (/wellbeing|well-being|mental health/i.test(lower)) topics.add("wellbeing");
  return [...topics];
}

function inferProgressionStage(
  text: string,
  code: string,
  methods: TrainingMethod[],
  tests: FitnessTestType[]
): FitnessProgressionStage {
  const lower = text.toLowerCase();
  if (/design|programme|program|plan my|personal plan|goal setting/i.test(lower)) {
    return "programme-design";
  }
  if (tests.length > 0 || /interpret|analyse|analyze|compare result|record/i.test(lower)) {
    return "assessment-interpretation";
  }
  if (methods.length > 0 || /perform|participate|apply|train/i.test(lower)) {
    return "application";
  }
  if (/interval|continuous|circuit|method|principle/i.test(lower)) {
    return "training-methods";
  }
  const strand = getFitnessStrandForCode(code);
  if (strand === "personal-programme") return "programme-design";
  if (strand === "hybrid-fitness") return "application";
  return "foundational-knowledge";
}

function inferCategories(
  health: HealthRelatedComponent[],
  skill: SkillRelatedComponent[],
  methods: TrainingMethod[],
  principles: TrainingPrinciple[],
  tests: FitnessTestType[],
  lifestyle: HealthLifestyleTopic[]
): FitnessCategory[] {
  const categories = new Set<FitnessCategory>();
  if (health.length > 0) categories.add("health-related-fitness");
  if (skill.length > 0) categories.add("skill-related-fitness");
  if (principles.length > 0) categories.add("training-principles");
  if (methods.length > 0) categories.add("training-methods");
  if (tests.length > 0) categories.add("fitness-testing");
  if (lifestyle.length > 0) categories.add("health-lifestyle");
  if (categories.size === 0) categories.add("health-related-fitness");
  return [...categories];
}

function inferDomains(text: string, outcome: LearningOutcome): LearningDomain[] {
  const domains = new Set<LearningDomain>(["physical"]);
  if (COGNITIVE.test(text)) domains.add("cognitive");
  if (SOCIAL.test(text)) domains.add("social");
  if (AFFECTIVE.test(text)) domains.add("affective");
  if (outcome.valueIds.length > 0) {
    domains.add("affective");
    domains.add("social");
  }
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

function normaliseYearLabels(outcome: LearningOutcome): string[] {
  const labels = (outcome.yearGroups ?? []).filter(
    (yg) =>
      FITNESS_YEAR_LABELS.includes(yg as (typeof FITNESS_YEAR_LABELS)[number]) ||
      yg === "Form 4" ||
      yg === "Form 5"
  );
  return labels.length > 0 ? labels : [...FITNESS_YEAR_LABELS];
}

export function buildFitnessProgressionMetadata(
  outcome: LearningOutcome
): FitnessProgressionMetadata | null {
  if (!isFitnessPlanningOutcome(outcome)) return null;

  const explicit = EXPLICIT_METADATA[outcome.id];
  if (explicit) {
    return { outcomeId: outcome.id, ...explicit, inferred: false };
  }

  const text = outcome.description;
  const skillIds = outcome.skillIds.map((id) => id.toLowerCase());
  const healthComponents = inferHealthComponent(text, skillIds);
  const skillComponents = inferSkillComponent(text, skillIds);
  const trainingMethods = inferTrainingMethods(text);
  const trainingPrinciples = inferTrainingPrinciples(text);
  const testTypes = inferTestTypes(text);
  const lifestyleTopics = inferLifestyleTopics(text);
  const categories = inferCategories(
    healthComponents,
    skillComponents,
    trainingMethods,
    trainingPrinciples,
    testTypes,
    lifestyleTopics
  );
  const learningDomains = inferDomains(text, outcome);
  const physicalLiteracy = inferPhysicalLiteracy(text, learningDomains);
  const progressionStage = inferProgressionStage(text, outcome.code, trainingMethods, testTypes);

  return {
    outcomeId: outcome.id,
    categories,
    healthComponents: healthComponents.length ? healthComponents : undefined,
    skillComponents: skillComponents.length ? skillComponents : undefined,
    trainingMethods: trainingMethods.length ? trainingMethods : undefined,
    trainingPrinciples: trainingPrinciples.length ? trainingPrinciples : undefined,
    testTypes: testTypes.length ? testTypes : undefined,
    lifestyleTopics: lifestyleTopics.length ? lifestyleTopics : undefined,
    progressionStage,
    learningDomains,
    physicalLiteracy: physicalLiteracy.length ? physicalLiteracy : undefined,
    yearLabels: normaliseYearLabels(outcome),
    inferred: true,
  };
}

export function buildFitnessMetadataIndex(
  outcomes: LearningOutcome[]
): Map<string, FitnessProgressionMetadata> {
  const index = new Map<string, FitnessProgressionMetadata>();
  for (const outcome of outcomes) {
    const metadata = buildFitnessProgressionMetadata(outcome);
    if (metadata) index.set(outcome.id, metadata);
  }
  return index;
}
