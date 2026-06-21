/**
 * TGfU Master Pack v2 — tactical complexity ladders and unit progression.
 * Original educational content — not copied from copyrighted sources.
 */

import type { TGfUGameCategory } from "./tgfuMaster";
import { resolveTGfUGameCategory } from "./tgfuMaster";

export interface TacticalComplexityLevel {
  level: number;
  name: string;
  description: string;
}

export interface TGfUUnitLesson {
  lessonNumber: number;
  phase: string;
  focus: string;
  tacticalProblem?: string;
  questioningFocus: string;
  assessmentCheckpoint?: string;
  retrievalOpportunity?: string;
}

export interface TGfUUnitProgression {
  category: TGfUGameCategory;
  categoryLabel: string;
  lessons: TGfUUnitLesson[];
}

export const TACTICAL_COMPLEXITY_LADDERS: Record<TGfUGameCategory, TacticalComplexityLevel[]> = {
  invasion: [
    { level: 1, name: "Maintain possession", description: "Keep the ball or object under team control." },
    { level: 2, name: "Create space", description: "Use movement and passing to open options." },
    { level: 3, name: "Exploit space", description: "Attack into gaps before defenders recover." },
    { level: 4, name: "Progress forward", description: "Move the play toward scoring zones." },
    { level: 5, name: "Create numerical advantage", description: "Overload one area to gain an edge." },
    { level: 6, name: "Transition effectively", description: "Switch quickly from attack to defence." },
    { level: 7, name: "Control tempo", description: "Speed up or slow play to manage the game." },
  ],
  "net-wall": [
    { level: 1, name: "Keep rally alive", description: "Sustain cooperative or competitive exchanges." },
    { level: 2, name: "Move opponent", description: "Send to areas that force opponent movement." },
    { level: 3, name: "Create space", description: "Open court zones through placement." },
    { level: 4, name: "Force weak returns", description: "Apply pressure to limit opponent options." },
    { level: 5, name: "Manipulate tempo", description: "Vary speed and height to disrupt rhythm." },
  ],
  "striking-fielding": [
    { level: 1, name: "Contact and placement", description: "Strike with control toward intended space." },
    { level: 2, name: "Safe scoring", description: "Choose runs and strikes that limit risk." },
    { level: 3, name: "Field positioning", description: "Cover space and communicate as a unit." },
    { level: 4, name: "Strategic risk", description: "Balance extra runs or aggressive strikes." },
  ],
  target: [
    { level: 1, name: "Direction", description: "Send object toward intended target line." },
    { level: 2, name: "Distance", description: "Control how far the object travels." },
    { level: 3, name: "Accuracy", description: "Land close to or on the target." },
    { level: 4, name: "Risk reward decisions", description: "Choose safe or high-value scoring options." },
  ],
};

const UNIT_PHASES: Omit<TGfUUnitLesson, "lessonNumber">[] = [
  {
    phase: "Game appreciation",
    focus: "Rules, roles, scoring, and safe play in a simplified game form",
    questioningFocus: "What must we understand before we play?",
    assessmentCheckpoint: "Pupils explain how to succeed in the modified game",
  },
  {
    phase: "Simple tactical problem",
    focus: "Name one problem and play a modified game that exposes it",
    questioningFocus: "What did you notice? Where was the space?",
    retrievalOpportunity: "Recall rules and roles from lesson 1",
  },
  {
    phase: "Decision making",
    focus: "Increase opposition or constraints — pupils choose when and why",
    questioningFocus: "Why did you choose that option?",
    assessmentCheckpoint: "Observe decision quality under light pressure",
  },
  {
    phase: "Skill refinement in context",
    focus: "Brief technique linked to the problem, then immediate return to play",
    questioningFocus: "What technique helped your decision work?",
    retrievalOpportunity: "Revisit tactical problem from lesson 2",
  },
  {
    phase: "Pressure and complexity",
    focus: "Add time, space, or numerical constraints — integrate tactics and skills",
    questioningFocus: "What changed when the game got harder?",
    assessmentCheckpoint: "Movement off ball and support play under pressure",
  },
  {
    phase: "Assessment game",
    focus: "Representative game observing decision making, support, and adaptation",
    questioningFocus: "What pattern did you recognise? What would you try next time?",
    assessmentCheckpoint: "Holistic game performance against WILF",
  },
];

const CATEGORY_UNIT_ADAPTATIONS: Record<
  TGfUGameCategory,
  Partial<Record<number, { tacticalProblem: string; focus?: string }>>
> = {
  invasion: {
    2: { tacticalProblem: "creating space" },
    3: { tacticalProblem: "maintaining possession under pressure" },
    5: { tacticalProblem: "transition effectively" },
  },
  "net-wall": {
    2: { tacticalProblem: "sending into space" },
    3: { tacticalProblem: "forcing weak returns" },
    5: { tacticalProblem: "manipulate tempo" },
  },
  "striking-fielding": {
    2: { tacticalProblem: "safe scoring moments" },
    3: { tacticalProblem: "field placement and communication" },
    5: { tacticalProblem: "strategic risk on runs" },
  },
  target: {
    2: { tacticalProblem: "accuracy and direction" },
    3: { tacticalProblem: "force control for distance" },
    5: { tacticalProblem: "risk reward decisions" },
  },
};

export function getTacticalComplexityLevel(
  category: TGfUGameCategory,
  level: number
): TacticalComplexityLevel | null {
  const ladder = TACTICAL_COMPLEXITY_LADDERS[category];
  return ladder.find((l) => l.level === level) ?? null;
}

export function getTacticalComplexityLadder(category: TGfUGameCategory): TacticalComplexityLevel[] {
  return TACTICAL_COMPLEXITY_LADDERS[category];
}

export function suggestNextComplexityStep(
  category: TGfUGameCategory,
  currentLevel: number
): TacticalComplexityLevel | null {
  const ladder = TACTICAL_COMPLEXITY_LADDERS[category];
  const next = ladder.find((l) => l.level === currentLevel + 1);
  return next ?? null;
}

export function inferComplexityLevelFromLessonIndex(
  category: TGfUGameCategory,
  lessonIndex: number
): number {
  const maxLevel = TACTICAL_COMPLEXITY_LADDERS[category].length;
  return Math.min(lessonIndex + 1, maxLevel);
}

export function buildTGfUUnitProgression(
  topicId?: string,
  activityArea?: string,
  lessonCount = 6
): TGfUUnitProgression | null {
  const category = resolveTGfUGameCategory(topicId, activityArea);
  if (!category) return null;

  const categoryLabels: Record<TGfUGameCategory, string> = {
    invasion: "Invasion games",
    "net-wall": "Net and wall games",
    "striking-fielding": "Striking and fielding",
    target: "Target games",
  };

  const adaptations = CATEGORY_UNIT_ADAPTATIONS[category];
  const count = Math.min(Math.max(lessonCount, 1), 6);

  const lessons: TGfUUnitLesson[] = UNIT_PHASES.slice(0, count).map((phase, index) => {
    const lessonNum = index + 1;
    const adapt = adaptations[lessonNum];
    const complexity = getTacticalComplexityLevel(category, inferComplexityLevelFromLessonIndex(category, index));
    return {
      lessonNumber: lessonNum,
      ...phase,
      focus: adapt?.focus ?? (complexity ? `${phase.focus} — ${complexity.name}` : phase.focus),
      tacticalProblem: adapt?.tacticalProblem ?? complexity?.name.toLowerCase(),
    };
  });

  return {
    category,
    categoryLabel: categoryLabels[category],
    lessons,
  };
}

export function getSchemeProgressionV2Tips(
  topicId: string | undefined,
  activityArea: string | undefined,
  lessonCount: number,
  activeLessonIndex = 0
): {
  complexityTips: string[];
  retrievalTips: string[];
  assessmentTips: string[];
  questioningTips: string[];
} {
  const unit = buildTGfUUnitProgression(topicId, activityArea, lessonCount);
  if (!unit) {
    return { complexityTips: [], retrievalTips: [], assessmentTips: [], questioningTips: [] };
  }

  const active = unit.lessons[activeLessonIndex] ?? unit.lessons[0];
  const nextLevel = suggestNextComplexityStep(
    unit.category,
    inferComplexityLevelFromLessonIndex(unit.category, activeLessonIndex)
  );

  const complexityTips = [
    active.tacticalProblem
      ? `Lesson ${active.lessonNumber}: tactical focus — ${active.tacticalProblem}.`
      : active.focus,
    nextLevel
      ? `Next step: ${nextLevel.name} — ${nextLevel.description}`
      : "At peak complexity — consolidate through assessment game.",
  ];

  const retrievalTips = unit.lessons
    .filter((l) => l.retrievalOpportunity)
    .map((l) => `Lesson ${l.lessonNumber}: ${l.retrievalOpportunity}`);

  const assessmentTips = unit.lessons
    .filter((l) => l.assessmentCheckpoint)
    .map((l) => `Lesson ${l.lessonNumber}: ${l.assessmentCheckpoint}`);

  const questioningTips = active
    ? [`Questioning focus: ${active.questioningFocus}`]
    : [];

  return {
    complexityTips: complexityTips.slice(0, 2),
    retrievalTips: retrievalTips.slice(0, 2),
    assessmentTips: assessmentTips.slice(0, 2),
    questioningTips,
  };
}
