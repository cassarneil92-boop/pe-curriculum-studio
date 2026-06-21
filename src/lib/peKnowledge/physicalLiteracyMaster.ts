/**
 * Physical Literacy Master Pack v1 — original educational content.
 * Not copied from copyrighted sources. No fabricated citations.
 */

import type { PEKnowledgeEntry } from "./types";

export type PLAttributeId =
  | "motivation"
  | "confidence"
  | "physical-competence"
  | "knowledge"
  | "understanding";

export type PLQuestionAgeBand = "primary" | "lower-secondary" | "upper-secondary";

export interface PLAttribute {
  id: PLAttributeId;
  name: string;
  description: string;
  whyItMatters: string;
  primaryExamples: string[];
  secondaryExamples: string[];
  lessonImplications: string[];
  assessmentOpportunities: string[];
  commonMistakes: string[];
}

export interface MovementExperienceCategory {
  id: string;
  name: string;
  developmentalValue: string;
  confidenceContribution: string;
  competenceContribution: string;
  planningPrompts: string[];
}

export const PHYSICAL_LITERACY_CORE_MESSAGE =
  "Physical literacy asks not only whether a learner can perform, but whether the lesson develops a motivated, confident, knowledgeable individual who values lifelong movement.";

export const PHYSICAL_LITERACY_FRAMEWORK: PLAttribute[] = [
  {
    id: "motivation",
    name: "Motivation",
    description:
      "The desire to participate in physical activity — driven by enjoyment, relevance, autonomy, and meaningful challenge.",
    whyItMatters:
      "Without motivation, competence alone does not sustain participation. Students who enjoy movement are more likely to stay active beyond school.",
    primaryExamples: [
      "Choosing between two valid task options",
      "Personal best challenges instead of class rankings",
    ],
    secondaryExamples: [
      "Student-led warm-up ideas",
      "Connecting activity to interests outside school",
    ],
    lessonImplications: [
      "Offer choice within the same learning intention",
      "Minimise waiting time and passive instruction",
      "Make relevance explicit in the first five minutes",
    ],
    assessmentOpportunities: [
      "Self-reported enjoyment or effort scale",
      "Observation of voluntary engagement and persistence",
    ],
    commonMistakes: [
      "Only rewarding winning or fastest performance",
      "Long queues with little activity time",
      "Activities with no clear purpose for pupils",
    ],
  },
  {
    id: "confidence",
    name: "Confidence",
    description:
      "Belief in one's ability to participate, attempt new movements, and recover from mistakes without fear of ridicule.",
    whyItMatters:
      "Low confidence leads to opt-out behaviour, modified effort, and avoidance of PE. Confidence unlocks honest participation and assessment.",
    primaryExamples: [
      "Achievable success in the opening task",
      "Private self-assessment before public sharing",
    ],
    secondaryExamples: [
      "Gradual exposure in swimming or gymnastics",
      "Celebrating improvement over comparison",
    ],
    lessonImplications: [
      "Plan early success for every learner",
      "Protect dignity during demonstrations",
      "Use language that focuses on effort and progress",
    ],
    assessmentOpportunities: [
      "Willingness to attempt the skill",
      "Confidence self-rating before and after",
    ],
    commonMistakes: [
      "Public ranking or elimination",
      "Forcing participation without graduated exposure",
      "Ignoring pupils who hide at the back",
    ],
  },
  {
    id: "physical-competence",
    name: "Physical Competence",
    description:
      "The ability to move with control, efficiency, and adaptability across diverse movement contexts.",
    whyItMatters:
      "Competence enables participation and reduces injury risk. It develops across locomotor, stability, and object-control skills.",
    primaryExamples: [
      "Controlled running, jumping, throwing progressions",
      "Skill application in game or challenge context",
    ],
    secondaryExamples: [
      "Balance and rotation in gymnastics",
      "Sending and receiving in net games",
    ],
    lessonImplications: [
      "Teach quality before speed",
      "Apply skills in representative contexts",
      "Progress from simple to complex movement",
    ],
    assessmentOpportunities: [
      "Movement quality against WILF",
      "Skill execution under light pressure",
    ],
    commonMistakes: [
      "Equating competence with elite performance only",
      "Isolated drills with no application",
      "Neglecting object control or stability",
    ],
  },
  {
    id: "knowledge",
    name: "Knowledge",
    description:
      "What learners know about movement, activity rules, health benefits, and how to participate safely.",
    whyItMatters:
      "Knowledge supports independent participation — pupils can join community activities, train safely, and make informed choices.",
    primaryExamples: [
      "Knowing rules and roles in a modified game",
      "Understanding why warm-up matters",
    ],
    secondaryExamples: [
      "Identifying local participation opportunities",
      "Basic safety and equipment knowledge",
    ],
    lessonImplications: [
      "Make rules and health links explicit",
      "Use pupil explanation not only teacher telling",
      "Connect to activities beyond the classroom",
    ],
    assessmentOpportunities: [
      "Can pupils explain how to participate?",
      "Do they know health or safety reasons for the activity?",
    ],
    commonMistakes: [
      "Assuming pupils already know rules",
      "No link to health or lifelong activity",
      "Knowledge tested as quiz only, not applied",
    ],
  },
  {
    id: "understanding",
    name: "Understanding",
    description:
      "Deep grasp of why movement matters, how skills connect, and how to adapt behaviour in different contexts.",
    whyItMatters:
      "Understanding transforms performance into lifelong physical literacy — pupils value movement and take responsibility for their activity.",
    primaryExamples: [
      "Explaining why a tactic or technique works",
      "Reflecting on how challenge affects learning",
    ],
    secondaryExamples: [
      "Transferring ideas across activity areas",
      "Understanding personal strengths and next steps",
    ],
    lessonImplications: [
      "Use reflection and questioning to build meaning",
      "Link today's learning to future participation",
      "Encourage self-regulation and goal setting",
    ],
    assessmentOpportunities: [
      "Pupils explain decisions and learning in their own words",
      "Reflection shows changed attitude or intention",
    ],
    commonMistakes: [
      "Reflection as tick-box with no depth",
      "No connection between lessons across a scheme",
      "Understanding assumed from performance alone",
    ],
  },
];

export const MOVEMENT_EXPERIENCE_FRAMEWORK: MovementExperienceCategory[] = [
  {
    id: "locomotion",
    name: "Locomotion",
    developmentalValue: "Foundation for running, jumping, dodging, and spatial awareness.",
    confidenceContribution: "Achievable travel tasks build willingness to move in open space.",
    competenceContribution: "Efficient gait, direction change, and acceleration patterns.",
    planningPrompts: ["Where will pupils travel with purpose?", "How will less confident movers succeed?"],
  },
  {
    id: "balance",
    name: "Balance",
    developmentalValue: "Static and dynamic stability for gymnastics, sport, and daily movement.",
    confidenceContribution: "Low-height, supported tasks reduce fear of falling.",
    competenceContribution: "Control of centre of mass during hold and transition.",
    planningPrompts: ["What balance challenge is achievable first?", "How is dignity protected?"],
  },
  {
    id: "coordination",
    name: "Coordination",
    developmentalValue: "Links upper and lower body for complex movement sequences.",
    confidenceContribution: "Rhythm and pattern tasks allow success before speed.",
    competenceContribution: "Timing, sequencing, and bilateral integration.",
    planningPrompts: ["Can pupils combine two movement patterns?", "Is tempo adjustable?"],
  },
  {
    id: "object-control",
    name: "Object control",
    developmentalValue: "Throwing, catching, striking, and dribbling underpin many activities.",
    confidenceContribution: "Soft equipment and larger targets increase early success.",
    competenceContribution: "Accuracy, force control, and manipulation under pressure.",
    planningPrompts: ["Which object skill connects to today's activity?", "Is equipment adapted?"],
  },
  {
    id: "rhythm-expression",
    name: "Rhythm and expression",
    developmentalValue: "Creative movement supports body awareness and affective engagement.",
    confidenceContribution: "Non-comparative creative tasks reduce performance anxiety.",
    competenceContribution: "Timing, flow, and intentional movement quality.",
    planningPrompts: ["Is there space for creative response?", "How is effort celebrated?"],
  },
  {
    id: "outdoor-adventurous",
    name: "Outdoor and adventurous activity",
    developmentalValue: "Problem solving, resilience, and cooperation in varied environments.",
    confidenceContribution: "Team roles allow contribution beyond physical dominance.",
    competenceContribution: "Navigation, risk awareness, and adaptive movement.",
    planningPrompts: ["Can all pupils contribute to the team outcome?", "Are roles rotated?"],
  },
  {
    id: "games",
    name: "Games",
    developmentalValue: "Decision making, cooperation, and tactical understanding in play.",
    confidenceContribution: "Modified rules and roles structure participation for all.",
    competenceContribution: "Skill execution integrated with tactical choices.",
    planningPrompts: ["Does every pupil touch the play?", "Is the game modified for inclusion?"],
  },
  {
    id: "health-fitness",
    name: "Health and fitness",
    developmentalValue: "Understanding intensity, recovery, and personal fitness habits.",
    confidenceContribution: "Personal best and self-paced work reduce comparison stress.",
    competenceContribution: "Safe technique and self-monitoring of effort.",
    planningPrompts: ["Is fitness linked to health understanding?", "Can pupils work at their level?"],
  },
  {
    id: "movement-exploration",
    name: "Movement exploration",
    developmentalValue: "Discovery of capacity, preference, and enjoyment across contexts.",
    confidenceContribution: "Low-stakes exploration invites trying new movements.",
    competenceContribution: "Adaptability and problem solving in novel tasks.",
    planningPrompts: ["Are pupils invited to explore options?", "Is failure framed as learning?"],
  },
];

export const PHYSICAL_LITERACY_QUESTION_BANK = {
  reflection: {
    primary: [
      "What did you enjoy today?",
      "What would you try again?",
      "What did your body learn?",
    ],
    "lower-secondary": [
      "What would you try differently next time?",
      "What helped your team succeed?",
      "What pattern did you notice?",
    ],
    "upper-secondary": [
      "How did your approach change during the lesson?",
      "What evidence shows you improved?",
      "What would you focus on next lesson?",
    ],
  },
  confidence: {
    primary: [
      "What are you more confident doing today?",
      "What helped you succeed?",
      "What challenge did you overcome?",
    ],
    "lower-secondary": [
      "What are you more confident doing today?",
      "What helped you succeed?",
      "What challenge did you overcome?",
    ],
    "upper-secondary": [
      "Where did you take a risk that paid off?",
      "How did you recover from a mistake?",
      "What would you like to improve next?",
    ],
  },
  awareness: {
    primary: ["How did your body feel?", "When did you work hardest?", "What was tricky?"],
    "lower-secondary": [
      "Which part of the skill needs most work?",
      "How did effort affect your performance?",
      "What did you notice about others' movement?",
    ],
    "upper-secondary": [
      "How did you self-regulate intensity or focus?",
      "What feedback changed your approach?",
      "How does today's learning connect to health?",
    ],
  },
  transfer: {
    primary: ["Where else could you use this?", "What other sport is like this?"],
    "lower-secondary": [
      "Where else could you use this skill?",
      "How might this help you outside school?",
      "What activity could you try at home or in the community?",
    ],
    "upper-secondary": [
      "How does this transfer to another activity area?",
      "What lifelong participation pathway connects here?",
      "How would you adapt this skill in a new context?",
    ],
  },
  selfAssessment: {
    primary: ["Did you try your best?", "What went well?", "What next?"],
    "lower-secondary": [
      "Rate your confidence before and after",
      "Which WILF did you achieve?",
      "What is your next personal target?",
    ],
    "upper-secondary": [
      "Evidence against success criteria",
      "Honest self-assessment of competence and confidence",
      "Personal goal for the next unit",
    ],
  },
};

export const PL_QUALITY_WARNINGS = [
  {
    id: "confidence-damage",
    warning: "Lesson may damage confidence",
    explanation: "Public comparison, elimination, or repeated failure without support risks opt-out.",
    suggestedFix: "Use personal best tasks, private feedback, and early achievable success.",
  },
  {
    id: "limited-ownership",
    warning: "Limited learner ownership",
    explanation: "Teacher-dominated lessons reduce autonomy and self-regulation.",
    suggestedFix: "Add choice, pupil roles, or partner-led tasks within the learning intention.",
  },
  {
    id: "low-participation",
    warning: "Low participation opportunities",
    explanation: "Queues, large groups, or single-performer tasks limit active learning time.",
    suggestedFix: "Small groups, rotations, and parallel tasks so all pupils are active.",
  },
  {
    id: "performance-focus",
    warning: "Excessive performance focus",
    explanation: "Only the ablest succeed when success is defined by winning or ranking.",
    suggestedFix: "Define success through progress, effort, and personal criteria in WILF.",
  },
  {
    id: "weak-inclusion",
    warning: "Weak inclusion",
    explanation: "One pathway to success excludes pupils with different needs or confidence.",
    suggestedFix: "Multiple success routes, adapted equipment, and same intention different access.",
  },
  {
    id: "limited-challenge",
    warning: "Limited challenge adaptation",
    explanation: "Same task for all fails both struggling and extending learners.",
    suggestedFix: "Document easier and harder options in differentiation.",
  },
  {
    id: "limited-lifelong",
    warning: "Limited lifelong relevance",
    explanation: "No link to participation beyond school reduces physical literacy impact.",
    suggestedFix: "Add plenary link: what could you try this week outside school?",
  },
];

export function yearGroupToPLQuestionBand(yearGroup?: string): PLQuestionAgeBand {
  if (!yearGroup) return "lower-secondary";
  const y = yearGroup.toLowerCase();
  if (/year-[1-6]|primary|ks2|early/i.test(y)) return "primary";
  if (/year-[7-9]|year-10|lower|ks3/i.test(y)) return "lower-secondary";
  return "upper-secondary";
}

export function getPhysicalLiteracyQuestions(
  ageBand: PLQuestionAgeBand = "lower-secondary",
  count = 3
): string[] {
  const bank = PHYSICAL_LITERACY_QUESTION_BANK;
  return [
    bank.confidence[ageBand][0],
    bank.reflection[ageBand][0],
    bank.transfer[ageBand][0],
    bank.awareness[ageBand][0],
    bank.selfAssessment[ageBand][0],
  ].slice(0, count);
}

/** Virtual knowledge entry for PE Specialist Suggestions. */
export const PHYSICAL_LITERACY_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "physical-literacy-master",
  title: "Physical Literacy Master — Holistic development",
  category: "physical-literacy",
  summary: PHYSICAL_LITERACY_CORE_MESSAGE,
  keyPrinciples: PHYSICAL_LITERACY_FRAMEWORK.map((a) => a.name),
  whyItMattersInPE:
    "Lessons must develop the whole person — motivation, confidence, competence, knowledge, and understanding — not only performance.",
  whenToUse: [
    "All PE lessons and schemes",
    "When pupils avoid participation or lack confidence",
    "Scheme planning for balanced holistic outcomes",
  ],
  commonMistakes: PHYSICAL_LITERACY_FRAMEWORK.flatMap((a) => a.commonMistakes).slice(0, 5),
  practicalApplications: MOVEMENT_EXPERIENCE_FRAMEWORK.slice(0, 5).map(
    (m) => `${m.name}: ${m.developmentalValue}`
  ),
  lessonPlanningPrompts: PHYSICAL_LITERACY_FRAMEWORK.flatMap((a) => a.lessonImplications).slice(0, 6),
  assessmentPrompts: PHYSICAL_LITERACY_FRAMEWORK.flatMap((a) => a.assessmentOpportunities).slice(0, 4),
  differentiationPrompts: [
    "Multiple success routes within the same learning intention",
    "Personal best instead of class ranking",
    "Choice of role or task level",
  ],
  agePhaseRelevance: ["early-years", "primary", "middle-school", "secondary"],
  pathwayRelevance: ["all"],
  relatedModels: ["physical-literacy-overview", "movement-confidence", "motivation-autonomy"],
  tags: [
    "physical-literacy",
    "confidence",
    "motivation",
    "lifelong-participation",
    "inclusion",
    "holistic",
  ],
};

export function getPLAttributeById(id: PLAttributeId): PLAttribute | undefined {
  return PHYSICAL_LITERACY_FRAMEWORK.find((a) => a.id === id);
}
