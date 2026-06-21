/**
 * SEC PE Option Master Pack — original educational content.
 */

import type { PEKnowledgeEntry } from "./types";

export const SEC_PE_OPTION_CORE_MESSAGE =
  "SEC PE Option integrates theory (anatomy, fitness, psychology, skill acquisition) with practical performance, analysis, and officiating for examination readiness.";

export const SEC_KNOWLEDGE_TOPICS = [
  "Anatomy",
  "Physiology",
  "Training",
  "Psychology",
  "Skill acquisition",
  "Performance analysis",
  "Exam preparation",
  "Coursework",
] as const;

export const SEC_PE_OPTION_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "sec-pe-option-master",
  title: "SEC PE Option Intelligence",
  category: "physical-literacy",
  summary: SEC_PE_OPTION_CORE_MESSAGE,
  keyPrinciples: [
    "Theory strands (anatomy, fitness, psychology) underpin practical performance.",
    "Skill acquisition and feedback models connect classroom theory to coaching.",
    "Performance analysis requires observe → evaluate → plan improvement cycles.",
    "Exam readiness needs retrieval practice across all theory topics.",
  ],
  whyItMattersInPE:
    "SEC PE Option students face written papers and practical coursework. Teachers need structured revision, assessment opportunities, and theory-practice links.",
  whenToUse: [
    "Form 4–5 SEC PE Option schemes",
    "Anatomy and physiology theory lessons",
    "Revision blocks before mock exams",
    "Practical sport units with analysis and officiating",
  ],
  commonMistakes: [
    "Teaching practical sport without linking to analysis outcomes.",
    "Revision cramming without spaced retrieval across topics.",
    "Exam-style questions that do not match official outcome wording.",
    "Coursework tasks without clear observation and evaluation structure.",
  ],
  practicalApplications: [
    "Alternate theory and practical weeks within each half-term.",
    "Use retrieval prompts at the start of every SEC lesson.",
    "Pair anatomy diagrams with sport-specific application questions.",
    "Build coursework around observe → interview → evaluate → plan.",
  ],
  lessonPlanningPrompts: [
    "Which SEC theory topic does today's lesson address?",
    "How will students retrieve prior knowledge before new content?",
    "What exam-style question could assess this outcome?",
    "How does practical work evidence the selected LO?",
  ],
  assessmentPrompts: [
    "Can students explain cardiovascular response to exercise?",
    "Can they apply training principles to a personal programme?",
    "Can they analyse a performance using structured observation?",
    "Do revision tasks cover motivation, feedback, and goal setting?",
  ],
  differentiationPrompts: [
    "Provide scaffolded diagrams for anatomy recall.",
    "Offer tiered exam questions — describe, explain, apply.",
    "Use peer teaching for psychology revision topics.",
  ],
  agePhaseRelevance: ["secondary", "all"],
  pathwayRelevance: ["pe-option-sec", "general-pe"],
  relatedModels: ["physical-literacy-overview", "motivation-autonomy", "formative-assessment-overview"],
  tags: [
    "sec-pe-option",
    "anatomy",
    "physiology",
    "sport-psychology",
    "skill-acquisition",
    "exam-preparation",
    "performance-analysis",
  ],
};

export function isSecPeOptionRelevant(prompt: string, yearGroup?: string): boolean {
  const lower = prompt.toLowerCase();
  const secPattern =
    /\b(sec pe|pe option|matsec|anatomy|physiology|cardiovascular|respiratory|skill acquisition|sport psych|motivation|arousal|smart target|performance analys|revision|exam prep)\b/i;
  if (secPattern.test(lower)) return true;
  if (yearGroup && /year-(9|10|11)/.test(yearGroup)) {
    return /\b(theory|exam|coursework|officiat)\b/i.test(lower);
  }
  return false;
}

export function isSecPeOptionYearGroup(yearGroup?: string): boolean {
  if (!yearGroup) return false;
  return ["year-9", "year-10", "year-11", "Year 9", "Year 10", "Year 11", "Form 4", "Form 5"].some(
    (yg) => yearGroup.includes(yg.replace("year-", "Year "))
  );
}
