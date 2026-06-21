/**
 * Sport Curriculum Master Pack — structured sport intelligence.
 */

import type { PEKnowledgeEntry } from "./types";

export const SPORT_CURRICULUM_CORE_MESSAGE =
  "Sport intelligence connects technical skills, tactical problems, and appropriate pedagogy so every lesson progresses pupils meaningfully through the activity.";

export const SPORT_KNOWLEDGE_TOPICS = [
  "Technical skills",
  "Tactical awareness",
  "Skill progressions",
  "TGfU",
  "Constraints led coaching",
  "Sport Education",
  "Assessment in sport",
  "Equipment and resources",
] as const;

export const SPORT_CURRICULUM_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "sport-curriculum-master",
  title: "Sport Intelligence Layer",
  category: "pedagogy-model",
  summary: SPORT_CURRICULUM_CORE_MESSAGE,
  keyPrinciples: [
    "Skills progress from isolated technique to opposed and game contexts.",
    "Pedagogy must match the sport — TGfU for invasion games, Whole-Part-Whole for gymnastics.",
    "Assessment should capture technique, decision-making, and fair play.",
    "Resources and space constraints shape realistic lesson design.",
  ],
  whyItMattersInPE:
    "Teachers need sport-specific progressions, not generic warm-up → drill → game for every activity. Sport intelligence grounds planning in how each activity actually develops.",
  whenToUse: [
    "Team game units (football, basketball, handball, volleyball)",
    "Individual activity blocks (athletics, gymnastics, dance)",
    "Racket sport skill development",
    "Scheme sequencing across a half-term",
  ],
  commonMistakes: [
    "Isolated drills with no transfer to game context.",
    "Same lesson structure for invasion games and gymnastics.",
    "Skipping prerequisite skills in progression sequences.",
    "Assessment that only measures technique, not decision-making.",
  ],
  practicalApplications: [
    "Name the skill and phase in every WALT (technique → opposed → game).",
    "Use TGfU modified games before full rules for invasion sports.",
    "Sequence athletics: technique → application → measurement.",
    "Volleyball: build cooperative rally before competitive scoring.",
  ],
  lessonPlanningPrompts: [
    "Which skill is today's focus and what came before it?",
    "Which pedagogy model suits this sport and phase?",
    "How will pupils apply the skill under pressure?",
    "What equipment is essential vs optional?",
  ],
  assessmentPrompts: [
    "Can pupils perform the skill with consistency?",
    "Do they make appropriate tactical decisions?",
    "Can they cooperate and communicate effectively?",
  ],
  differentiationPrompts: [
    "Adapt space, equipment, or rules — not just remove challenge.",
    "Pair stronger pupils as coaches in cooperative phases.",
  ],
  agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
  pathwayRelevance: ["general-pe", "primary-pe"],
  relatedModels: ["tgfu-overview", "cooperative-learning", "sport-education-model"],
  tags: [
    "sport-intelligence",
    "football",
    "basketball",
    "volleyball",
    "handball",
    "athletics",
    "gymnastics",
    "dance",
    "racket-sports",
    "skill-progression",
  ],
};

export function isSportCurriculumRelevant(prompt: string, topicId?: string): boolean {
  if (topicId && /football|basketball|volleyball|handball|athletics|gymnastics|dance|badminton|tennis|racket/i.test(topicId)) {
    return true;
  }
  return /\b(football|basketball|volleyball|handball|athletics|gymnastics|dance|badminton|passing|dribbling|serve|spike|tgfu|small sided|lay.?up|sprint|choreograph)\b/i.test(
    prompt
  );
}
