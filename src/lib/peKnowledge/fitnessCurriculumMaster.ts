/**
 * Fitness Curriculum Master Pack — original educational content.
 */

import type { PEKnowledgeEntry } from "./types";

export const FITNESS_CURRICULUM_CORE_MESSAGE =
  "Fitness curriculum develops health-related and skill-related fitness through principled training, meaningful testing, and lifelong activity habits.";

export const FITNESS_KNOWLEDGE_TOPICS = [
  "Components of fitness",
  "Principles of training",
  "Methods of training",
  "Fitness testing",
  "Goal setting",
  "Recovery",
  "Nutrition",
  "Exercise adherence",
] as const;

export const FITNESS_CURRICULUM_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "fitness-curriculum-master",
  title: "Fitness Curriculum Intelligence",
  category: "physical-literacy",
  summary: FITNESS_CURRICULUM_CORE_MESSAGE,
  keyPrinciples: [
    "Health related fitness underpins lifelong wellbeing.",
    "Training must follow specificity, overload, and progression.",
    "Fitness testing supports goal setting — not ranking alone.",
    "Recovery and nutrition are part of the programme, not add-ons.",
  ],
  whyItMattersInPE:
    "Secondary fitness units prepare students for independent activity. Teachers need clear links between components, methods, principles, and assessment.",
  whenToUse: [
    "Years 7–11 fitness units and schemes",
    "Cardiovascular and strength conditioning blocks",
    "Fitness testing and interpretation lessons",
    "Personal programme design in Form 4–5",
  ],
  commonMistakes: [
    "Fitness drills without named components or principles.",
    "Testing without teaching interpretation or goal setting.",
    "One-size-fits-all programmes ignoring recovery.",
    "Competitive ranking that reduces confidence for less fit students.",
  ],
  practicalApplications: [
    "Name the fitness component and training method in every WALT.",
    "Use interval and circuit structures with clear work:rest ratios.",
    "Pair test lessons with personal goal setting.",
    "Include recovery and nutrition in scheme plenaries.",
  ],
  lessonPlanningPrompts: [
    "Which fitness component is today's focus?",
    "Which training principle are students applying?",
    "How will students know if they are working at appropriate intensity?",
    "What recovery strategy will you teach today?",
  ],
  assessmentPrompts: [
    "Can students interpret test results against personal goals?",
    "Can they explain why a method suits a fitness target?",
    "Do they understand safe progression?",
  ],
  differentiationPrompts: [
    "Offer intensity choices within the same method.",
    "Use personal best rather than class ranking.",
    "Adapt resistance with bodyweight progressions.",
  ],
  agePhaseRelevance: ["middle-school", "secondary", "all"],
  pathwayRelevance: ["fitness-curriculum", "general-pe"],
  relatedModels: ["physical-literacy-overview", "motivation-autonomy", "cooperative-learning"],
  tags: [
    "fitness-curriculum",
    "hrf",
    "training-principles",
    "interval-training",
    "fitness-testing",
    "recovery",
    "nutrition",
  ],
};

export function isFitnessCurriculumRelevant(text: string, yearGroup?: string): boolean {
  if (yearGroup && /^year-(7|8|9|10|11)|form-[45]/i.test(yearGroup)) {
    if (/\bfitness|hrf|training|endurance|strength|interval|circuit|shuttle|plank|hexagon\b/i.test(text)) {
      return true;
    }
  }
  return /\b(fitness curriculum|health related fitness|hrf|interval training|continuous training|circuit training|fartlek|resistance training|fitness test|cardiovascular|muscular endurance|programme design)\b/i.test(
    text
  );
}

export function isFitnessYearGroup(yearGroup?: string): boolean {
  if (!yearGroup) return false;
  return /^year-(7|8|9|10|11)|form-[45]/i.test(yearGroup.toLowerCase());
}
