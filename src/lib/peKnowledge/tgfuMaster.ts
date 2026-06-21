/**
 * TGfU Master Pack v1 — original practical guidance for PE Curriculum Studio.
 * Not copied from copyrighted sources. No fabricated citations.
 */

import type { LessonKnowledgeContext, PEKnowledgeEntry } from "./types";

export type TGfUGameCategory = "invasion" | "net-wall" | "striking-fielding" | "target";

export type TGfUPhaseId =
  | "game-form"
  | "game-appreciation"
  | "tactical-awareness"
  | "decision-making"
  | "skill-execution"
  | "performance";

export interface TGfUPhase {
  id: TGfUPhaseId;
  name: string;
  teacherPurpose: string;
  pupilBehaviour: string;
  planningPrompts: string[];
  assessmentEvidence: string[];
  commonMistakes: string[];
}

export interface TGfUGameCategoryDefinition {
  id: TGfUGameCategory;
  label: string;
  sports: string[];
  tacticalProblems: string[];
}

export interface TGfUPedagogicalPrinciple {
  id: string;
  name: string;
  explanation: string;
  peExample: string;
  primaryExample: string;
  secondaryExample: string;
  commonMistake: string;
}

export interface TGfUPlanningMistake {
  id: string;
  mistake: string;
  whyItWeakensLearning: string;
  appFlag: string;
  practicalFix: string;
}

export interface TGfULessonTemplate {
  tacticalProblem: string;
  modifiedGame: string;
  guidedQuestions: string[];
  skillFocus: string;
  returnToGame: string;
  assessmentEvidence: string[];
  differentiation: { easier: string[]; harder: string[] };
}

export interface TGfUApproachSuggestion {
  recommendedGameCategory: TGfUGameCategory;
  categoryLabel: string;
  tacticalProblem: string;
  modifiedGameIdea: string;
  questioningPrompts: string[];
  differentiationIdeas: string[];
  assessmentEvidence: string[];
  commonMistakeWarning: string;
}

export interface TGfUContext extends LessonKnowledgeContext {
  topicId?: string;
  skillId?: string;
}

export const TGfU_CORE_DEFINITION =
  "TGfU is a learner-centred games teaching model where pupils develop tactical awareness, decision making, skill execution and performance through modified game forms before or alongside isolated technical practice.";

export const TGfU_SIX_PHASES: TGfUPhase[] = [
  {
    id: "game-form",
    name: "Game form",
    teacherPurpose: "Establish a playable, representative context that exposes the tactical problem you want pupils to solve.",
    pupilBehaviour: "Play within simplified rules, explore options, and begin noticing patterns in space and opposition.",
    planningPrompts: [
      "What is the smallest game that still feels like the real sport?",
      "Which one rule change will highlight today's tactical focus?",
    ],
    assessmentEvidence: [
      "Pupils engage in play without excessive stoppages.",
      "Initial decisions visible in first 5 minutes of game form.",
    ],
    commonMistakes: [
      "Game is too complex for first exposure.",
      "Game form does not resemble the full sport enough to transfer.",
    ],
  },
  {
    id: "game-appreciation",
    name: "Game appreciation",
    teacherPurpose: "Help pupils understand purpose, rules, scoring, and roles so they can focus on tactics not confusion.",
    pupilBehaviour: "Explain rules in their own words, recognise how scoring works, and understand team roles.",
    planningPrompts: [
      "What must pupils understand before the game starts?",
      "Can pupils restate the scoring system and why it matters?",
    ],
    assessmentEvidence: [
      "Pupils can describe how to win or succeed in the modified game.",
      "Roles and rotation are understood without teacher repetition.",
    ],
    commonMistakes: [
      "Long verbal briefing before any play.",
      "Assuming pupils know rules from watching professional sport.",
    ],
  },
  {
    id: "tactical-awareness",
    name: "Tactical awareness",
    teacherPurpose: "Draw attention to space, opponents, teammates, and the problem the team must solve.",
    pupilBehaviour: "Scan before acting, notice where space opens, and describe what they see during freezes.",
    planningPrompts: [
      "What tactical problem are we solving today?",
      "Where does the game break down for our team?",
    ],
    assessmentEvidence: [
      "Pupils identify space and pressure verbally during pauses.",
      "Movement off the ball increases after guided questioning.",
    ],
    commonMistakes: [
      "Teacher names the tactic before pupils discover it.",
      "Freezes happen too often and kill flow.",
    ],
  },
  {
    id: "decision-making",
    name: "Decision making",
    teacherPurpose: "Develop when and why to choose pass, move, shoot, defend, or recover — not only how.",
    pupilBehaviour: "Choose between options under light pressure, justify choices, and adapt when conditions change.",
    planningPrompts: [
      "When is pass better than dribble in this game?",
      "What information tells you this is the right moment?",
    ],
    assessmentEvidence: [
      "Pupils explain why they chose an action.",
      "Decision quality improves when constraints change mid-game.",
    ],
    commonMistakes: [
      "Only one correct answer is accepted.",
      "Decisions are not linked back to game conditions.",
    ],
  },
  {
    id: "skill-execution",
    name: "Skill execution",
    teacherPurpose: "Refine technique that serves the tactical problem — practice in context or brief isolated reps with immediate return to play.",
    pupilBehaviour: "Apply coached technique in modified game, self-correct, and connect skill to prior tactical discussion.",
    planningPrompts: [
      "Which technique solves the problem we identified?",
      "How quickly can pupils return to game after skill practice?",
    ],
    assessmentEvidence: [
      "Technique visible under low opposition before adding pressure.",
      "Skill success rate improves in return-to-game phase.",
    ],
    commonMistakes: [
      "Long drill block with no return to game.",
      "Technique taught with no link to tactical problem.",
    ],
  },
  {
    id: "performance",
    name: "Performance",
    teacherPurpose: "Consolidate learning in a challenging but fair game where pupils demonstrate integrated tactical and skill performance.",
    pupilBehaviour: "Sustain decisions under pressure, support teammates, and reflect on what improved.",
    planningPrompts: [
      "Does the final game challenge without overwhelming?",
      "What evidence will you collect during performance phase?",
    ],
    assessmentEvidence: [
      "Integrated performance against WILF in game context.",
      "Pupils reflect on progress from game form to performance.",
    ],
    commonMistakes: [
      "Final game introduces many new rules.",
      "No reflection after performance phase.",
    ],
  },
];

export const TGfU_GAME_CATEGORIES: TGfUGameCategoryDefinition[] = [
  {
    id: "invasion",
    label: "Invasion games",
    sports: ["football", "basketball", "handball", "rugby", "touch-rugby", "hockey", "invasion-games", "netball"],
    tacticalProblems: [
      "maintaining possession",
      "creating space",
      "exploiting space",
      "progressing forward",
      "finishing",
      "delaying attack",
      "denying space",
      "regaining possession",
    ],
  },
  {
    id: "net-wall",
    label: "Net and wall games",
    sports: ["volleyball", "badminton", "tennis", "net-games", "pickleball", "tchoukball"],
    tacticalProblems: [
      "sending into space",
      "recovering court position",
      "forcing weak returns",
      "defending space",
      "varying height, speed, direction",
    ],
  },
  {
    id: "striking-fielding",
    label: "Striking and fielding",
    sports: ["rounders", "cricket", "softball", "athletics"],
    tacticalProblems: [
      "striking away from fielders",
      "selecting safe scoring moments",
      "field placement",
      "communication",
      "limiting scoring",
    ],
  },
  {
    id: "target",
    label: "Target games",
    sports: ["bocce", "bowls", "golf", "target", "archery"],
    tacticalProblems: [
      "accuracy",
      "force control",
      "angle",
      "risk and reward",
      "consistency",
    ],
  },
];

export const TGfU_PEDAGOGICAL_PRINCIPLES: TGfUPedagogicalPrinciple[] = [
  {
    id: "sampling",
    name: "Sampling",
    explanation: "Expose pupils to a variety of game forms and problems rather than one sport only.",
    peExample: "Rotate invasion problems across football and handball mini-games in one unit.",
    primaryExample: "Try three different ways to keep possession in small games.",
    secondaryExample: "Compare decision making in basketball and hockey conditioned games.",
    commonMistake: "One sport drilled in isolation all term with no transfer tasks.",
  },
  {
    id: "representation",
    name: "Representation",
    explanation: "Design games that preserve key features of the full sport while simplifying complexity.",
    peExample: "3v3 football with wide goals rewards width and passing — like the full game.",
    primaryExample: "Use smaller courts so rallies happen often in net games.",
    secondaryExample: "Conditioned handball with limited steps keeps tactical shape.",
    commonMistake: "Activity looks like a drill, not a recognisable game.",
  },
  {
    id: "exaggeration",
    name: "Exaggeration",
    explanation: "Amplify a tactical feature through rules so pupils notice it quickly.",
    peExample: "Bonus point for a pass before a shot exaggerates build-up play.",
    primaryExample: "Must pass before moving in a simple invasion game.",
    secondaryExample: "Double points for deep returns in badminton.",
    commonMistake: "Too many exaggerated rules at once — pupils lose the learning focus.",
  },
  {
    id: "tactical-complexity",
    name: "Tactical complexity",
    explanation: "Increase decision load gradually as pupils show understanding.",
    peExample: "Add a defender, then two, then full small-sided game.",
    primaryExample: "Start unopposed sending, then one blocker, then rally.",
    secondaryExample: "Introduce fielders one at a time in striking games.",
    commonMistake: "Jumping to full rules before pupils can solve simpler problems.",
  },
  {
    id: "questioning",
    name: "Questioning",
    explanation: "Use open questions during freezes to help pupils construct understanding.",
    peExample: "Where was the space? What changed when the defender shifted?",
    primaryExample: "How did your team create a passing option?",
    secondaryExample: "Why was that shot selection safer or riskier?",
    commonMistake: "Questioning becomes a quiz with one-word answers from the same pupils.",
  },
  {
    id: "game-pause-return",
    name: "Game pause and return",
    explanation: "Briefly stop play to highlight learning, then return immediately to the game.",
    peExample: "Freeze → one question → restart within 30 seconds.",
    primaryExample: "Show one demo after a freeze, then play on.",
    secondaryExample: "Quick partner chat, then back to modified game.",
    commonMistake: "Extended lectures during stoppages — activity time lost.",
  },
  {
    id: "modified-game-design",
    name: "Modified game design",
    explanation: "Teacher designs constraints that make the learning intention unavoidable.",
    peExample: "4v4 with end zones to teach forward passing in invasion games.",
    primaryExample: "Two-touch maximum to encourage early decisions.",
    secondaryExample: "Target zones worth extra points for accuracy in target games.",
    commonMistake: "Modified game does not target the stated WALT.",
  },
];

export const TGfU_QUESTION_BANK = {
  observation: [
    "What did you notice?",
    "Where was the space?",
    "What changed when the defender moved?",
  ],
  tacticalAwareness: [
    "How can we create space?",
    "How can we stop the opponent progressing?",
    "What makes this option safer or riskier?",
  ],
  decisionMaking: [
    "Why did you choose that pass?",
    "When should you dribble instead of pass?",
    "What told you that this was the right moment?",
  ],
  skillExecution: [
    "What technique helped your decision work?",
    "What body position made the action easier?",
    "What would improve the quality of the pass, shot, strike or return?",
  ],
  reflection: [
    "What would you try differently next time?",
    "What helped your team solve the problem?",
    "What pattern did you start to recognise?",
  ],
};

export const TGfU_DIFFERENTIATION = {
  levers: ["space", "time", "number of players", "rules", "scoring system", "equipment", "level of opposition", "decision complexity"],
  easier: [
    "Larger target or goal area",
    "More space per player",
    "Overload attackers numerically",
    "Slower ball or softer equipment",
    "More time before pressure arrives",
    "Fewer rules to remember",
  ],
  harder: [
    "Smaller playing space",
    "Time pressure or shot clock",
    "Numerical disadvantage",
    "Non-dominant hand or foot only",
    "Bonus points for tactical solutions",
    "Reduced touches or passes allowed",
    "More complex scoring conditions",
  ],
};

export const TGfU_ASSESSMENT_DOMAINS = {
  physical: [
    "Skill execution in game context",
    "Movement off the ball",
    "Body positioning",
    "Recovery movement",
  ],
  cognitive: [
    "Tactical explanation",
    "Decision making",
    "Recognising patterns",
    "Adapting strategy",
  ],
  social: [
    "Communication",
    "Cooperation",
    "Team roles",
    "Support play",
  ],
  affective: [
    "Confidence",
    "Persistence",
    "Willingness to try",
    "Response to challenge",
  ],
};

export const TGfU_PLANNING_MISTAKES: TGfUPlanningMistake[] = [
  {
    id: "too-complex",
    mistake: "Game is too complex",
    whyItWeakensLearning: "Working memory overload — pupils focus on rules not tactics.",
    appFlag: "Many rules mentioned but no simplified game form in plan.",
    practicalFix: "Remove one rule; use smaller teams and larger space.",
  },
  {
    id: "not-representative",
    mistake: "Game is not representative",
    whyItWeakensLearning: "Skills and decisions do not transfer to the real sport.",
    appFlag: "Activity text lacks game-like scoring or opposition.",
    practicalFix: "Add one scoring condition that mirrors the sport's key objective.",
  },
  {
    id: "teacher-talk",
    mistake: "Teacher talks too much",
    whyItWeakensLearning: "Reduces active learning time and pupil discovery.",
    appFlag: "Long activity descriptions with little play time indicated.",
    practicalFix: "Cap briefings at 2 minutes; use show-and-play.",
  },
  {
    id: "quiz-questioning",
    mistake: "Questioning becomes a quiz",
    whyItWeakensLearning: "Only recalls facts; does not develop tactical reasoning.",
    appFlag: "Questions are closed with single correct answers only.",
    practicalFix: "Use What did you notice? and Why that option? prompts.",
  },
  {
    id: "no-focus",
    mistake: "Pupils play without learning focus",
    whyItWeakensLearning: "Activity becomes recreation without improvement.",
    appFlag: "WALT missing or describes playing only.",
    practicalFix: "State one tactical problem before game form starts.",
  },
  {
    id: "technique-ignored",
    mistake: "Technique is ignored completely",
    whyItWeakensLearning: "Good decisions fail without executable skills.",
    appFlag: "No skill execution phase in lesson structure.",
    practicalFix: "Add brief skill practice linked to the identified problem.",
  },
  {
    id: "technique-too-early",
    mistake: "Technique dominates too early",
    whyItWeakensLearning: "Pupils do not understand why the skill matters.",
    appFlag: "Main activity is drill-only with no game form.",
    practicalFix: "Start with modified game; teach skill after tactical problem emerges.",
  },
  {
    id: "too-many-stoppages",
    mistake: "Too many stoppages",
    whyItWeakensLearning: "Flow and engagement drop; less decision repetition.",
    appFlag: "Multiple long freeze sections planned.",
    practicalFix: "Limit to two planned freezes; use captains for on-field reminders.",
  },
  {
    id: "no-return",
    mistake: "No return to the game",
    whyItWeakensLearning: "Practice does not transfer to performance.",
    appFlag: "Skill practice with no return-to-game phase.",
    practicalFix: "Always schedule return to modified game after skill block.",
  },
  {
    id: "no-assessment",
    mistake: "No assessment evidence",
    whyItWeakensLearning: "Teacher cannot judge tactical or skill progress.",
    appFlag: "No WILF or observation notes in plan.",
    practicalFix: "Add one cognitive and one physical evidence point to WILF.",
  },
];

export const TGfU_SCHEME_UNIT_PROGRESSION = [
  "Simple tactical problem — introduce modified game and name the problem",
  "Modified game — guided questions and role clarity",
  "Decision making under pressure — add defenders, time, or scoring constraints",
  "Skill refinement in context — brief practice then immediate return to play",
  "Complex game performance — integrate tactics and skills under fuller conditions",
  "Assessment game — observe against WILF across physical, cognitive, social and affective domains",
];

const TOPIC_CATEGORY_MAP: Record<string, TGfUGameCategory> = {
  football: "invasion",
  basketball: "invasion",
  handball: "invasion",
  rugby: "invasion",
  "touch-rugby": "invasion",
  hockey: "invasion",
  "invasion-games": "invasion",
  netball: "invasion",
  volleyball: "net-wall",
  badminton: "net-wall",
  tennis: "net-wall",
  "net-games": "net-wall",
  pickleball: "net-wall",
  tchoukball: "net-wall",
  rounders: "striking-fielding",
  cricket: "striking-fielding",
  softball: "striking-fielding",
  bocce: "target",
  bowls: "target",
  golf: "target",
  target: "target",
  games: "invasion",
};

const SKILL_TACTICAL_HINTS: Record<string, Partial<Record<TGfUGameCategory, string>>> = {
  passing: {
    invasion: "maintaining possession",
    "net-wall": "sending into space",
  },
  shooting: { invasion: "finishing", target: "accuracy" },
  defending: { invasion: "denying space", "net-wall": "defending space" },
  serving: { "net-wall": "forcing weak returns" },
  receiving: { "net-wall": "recovering court position" },
};

const MODIFIED_GAME_IDEAS: Record<TGfUGameCategory, string[]> = {
  invasion: [
    "3v3 with wide goals — bonus point for a pass before a shot",
    "4v4 end-zone game — score by passing into the zone",
    "Overload 4v3 to create passing options under pressure",
  ],
  "net-wall": [
    "Cooperative 3-touch rally before sending over net or line",
    "2v2 with target zones — deep returns score double",
    "Serve and recover — must return to base after each send",
  ],
  "striking-fielding": [
    "Striker vs two fielders — safe runs only when gap appears",
    "Hit into open space scoring zones",
    "Communication call before every fielding rotation",
  ],
  target: [
    "Points for closest to target after three attempts",
    "Risk lane — high points but narrow target",
    "Team accumulation game with alternating roles",
  ],
};

export function isTGfURelevantTopic(topicId?: string, activityArea?: string): boolean {
  if (!topicId && !activityArea) return false;
  const key = (topicId ?? activityArea ?? "").toLowerCase();
  if (resolveTGfUGameCategory(topicId, activityArea)) return true;
  return /\b(invasion|net|wall|volleyball|football|basketball|handball|rugby|hockey|badminton|tennis|rounders|cricket|bocce|target|striking|fielding|games)\b/i.test(
    key
  );
}

export function resolveTGfUGameCategory(
  topicId?: string,
  activityArea?: string
): TGfUGameCategory | null {
  const raw = `${topicId ?? ""} ${activityArea ?? ""}`.toLowerCase();
  for (const [topic, category] of Object.entries(TOPIC_CATEGORY_MAP)) {
    if (raw.includes(topic.replace(/-/g, " ")) || raw.includes(topic)) {
      return category;
    }
  }
  if (/\binvasion\b/.test(raw)) return "invasion";
  if (/\bnet\b|\bwall\b|\bvolley\b/.test(raw)) return "net-wall";
  if (/\bstrik|\bfield|\brounders|\bcricket\b/.test(raw)) return "striking-fielding";
  if (/\btarget\b|\bbocce\b|\bbowls\b/.test(raw)) return "target";
  return null;
}

function pickTacticalProblem(category: TGfUGameCategory, skillId?: string): string {
  const cat = TGfU_GAME_CATEGORIES.find((c) => c.id === category);
  if (!cat) return "creating space";
  if (skillId && SKILL_TACTICAL_HINTS[skillId]?.[category]) {
    return SKILL_TACTICAL_HINTS[skillId][category]!;
  }
  return cat.tacticalProblems[0];
}

function pickModifiedGameIdea(category: TGfUGameCategory, index = 0): string {
  const ideas = MODIFIED_GAME_IDEAS[category];
  return ideas[index % ideas.length];
}

export function getTGfUQuestionsByGameCategory(category: TGfUGameCategory): string[] {
  const base = [
    ...TGfU_QUESTION_BANK.observation.slice(0, 1),
    ...TGfU_QUESTION_BANK.tacticalAwareness.slice(0, 1),
    ...TGfU_QUESTION_BANK.decisionMaking.slice(0, 1),
    ...TGfU_QUESTION_BANK.skillExecution.slice(0, 1),
    ...TGfU_QUESTION_BANK.reflection.slice(0, 1),
  ];
  if (category === "net-wall") {
    return [
      "Where should you send the ball to make recovery harder?",
      "How can we cover the court after sending?",
      ...base.slice(0, 3),
    ];
  }
  if (category === "striking-fielding") {
    return [
      "Where is the safest place to strike the ball?",
      "When should we attempt an extra run?",
      ...base.slice(0, 3),
    ];
  }
  if (category === "target") {
    return [
      "What angle gives the best chance of scoring?",
      "When is risk worth extra points?",
      ...base.slice(0, 3),
    ];
  }
  return base;
}

export function getTGfUDifferentiationOptions(context: TGfUContext): {
  easier: string[];
  harder: string[];
} {
  const category = resolveTGfUGameCategory(context.topicId, context.activityArea);
  const easier = [...TGfU_DIFFERENTIATION.easier];
  const harder = [...TGfU_DIFFERENTIATION.harder];
  if (category === "invasion") {
    easier.push("Play across full width of hall");
    harder.push("Must combine before scoring");
  }
  if (category === "net-wall") {
    easier.push("Lower net or closer targets");
    harder.push("One-touch finish only");
  }
  return { easier: easier.slice(0, 4), harder: harder.slice(0, 4) };
}

export function suggestTGfUApproach(context: TGfUContext): TGfUApproachSuggestion | null {
  const category = resolveTGfUGameCategory(context.topicId, context.activityArea);
  if (!category) return null;

  const catDef = TGfU_GAME_CATEGORIES.find((c) => c.id === category)!;
  const tacticalProblem = pickTacticalProblem(category, context.skillId);
  const modifiedGameIdea = pickModifiedGameIdea(category);
  const questions = getTGfUQuestionsByGameCategory(category).slice(0, 3);
  const diff = getTGfUDifferentiationOptions(context);
  const assessment = [
    TGfU_ASSESSMENT_DOMAINS.cognitive[1],
    TGfU_ASSESSMENT_DOMAINS.physical[0],
    TGfU_ASSESSMENT_DOMAINS.social[0],
  ];
  const warning = TGfU_PLANNING_MISTAKES.find((m) => m.id === "no-return")!;

  return {
    recommendedGameCategory: category,
    categoryLabel: catDef.label,
    tacticalProblem,
    modifiedGameIdea,
    questioningPrompts: questions,
    differentiationIdeas: [...diff.easier.slice(0, 2), ...diff.harder.slice(0, 1)],
    assessmentEvidence: assessment,
    commonMistakeWarning: `${warning.mistake} — ${warning.practicalFix}`,
  };
}

export function buildTGfULessonTemplate(context: TGfUContext): TGfULessonTemplate | null {
  const approach = suggestTGfUApproach(context);
  if (!approach) return null;

  const diff = getTGfUDifferentiationOptions(context);
  const skillFocus =
    context.skillId?.replace(/-/g, " ") ||
    (approach.recommendedGameCategory === "invasion"
      ? "passing or moving into space"
      : approach.recommendedGameCategory === "net-wall"
        ? "send and recover"
        : "strike or field with control");

  return {
    tacticalProblem: approach.tacticalProblem,
    modifiedGame: approach.modifiedGameIdea,
    guidedQuestions: approach.questioningPrompts,
    skillFocus: `Refine ${skillFocus} to solve: ${approach.tacticalProblem}`,
    returnToGame: "Return to modified game with same scoring focus — observe if decisions improved",
    assessmentEvidence: approach.assessmentEvidence,
    differentiation: diff,
  };
}

/** Static planning templates per game category — same structure for all four types. */
export const TGfU_LESSON_TEMPLATES_BY_CATEGORY: Record<TGfUGameCategory, TGfULessonTemplate> = {
  invasion: {
    tacticalProblem: "creating space",
    modifiedGame: "3v3 with wide goals — bonus point for a pass before a shot",
    guidedQuestions: [
      "How can we create space?",
      "Why did you choose that pass?",
      "What would you try differently next time?",
    ],
    skillFocus: "Refine passing and movement to solve creating space",
    returnToGame: "Return to 3v3 with same scoring — observe improved off-ball movement",
    assessmentEvidence: ["Decision making", "Skill execution in game context", "Communication"],
    differentiation: {
      easier: ["More space per player", "Overload attackers numerically", "Fewer rules"],
      harder: ["Smaller playing space", "Reduced touches allowed", "Bonus points for tactical solutions"],
    },
  },
  "net-wall": {
    tacticalProblem: "sending into space",
    modifiedGame: "2v2 with target zones — deep returns score double",
    guidedQuestions: [
      "Where should you send the ball?",
      "What technique helped your decision work?",
      "What pattern did you start to recognise?",
    ],
    skillFocus: "Refine send and recover to solve sending into space",
    returnToGame: "Return to modified rally game — observe court recovery after each send",
    assessmentEvidence: ["Decision making", "Skill execution in game context", "Cooperation"],
    differentiation: {
      easier: ["Lower net or closer targets", "Cooperative rally before scoring", "More space"],
      harder: ["One-touch finish only", "Smaller court", "Time pressure"],
    },
  },
  "striking-fielding": {
    tacticalProblem: "selecting safe scoring moments",
    modifiedGame: "Striker vs two fielders — safe runs only when gap appears",
    guidedQuestions: [
      "When should we attempt an extra run?",
      "Where is the safest place to strike?",
      "What helped your team solve the problem?",
    ],
    skillFocus: "Refine striking and field placement to solve safe scoring moments",
    returnToGame: "Return to modified game — observe communication before runs",
    assessmentEvidence: ["Decision making", "Field placement", "Communication"],
    differentiation: {
      easier: ["Larger gaps between fielders", "Slower ball", "More time before fielding"],
      harder: ["Smaller scoring zones", "Bonus for quick runs", "More fielders"],
    },
  },
  target: {
    tacticalProblem: "accuracy",
    modifiedGame: "Points for closest to target after three attempts",
    guidedQuestions: [
      "What angle gives the best chance of scoring?",
      "What body position made the action easier?",
      "When is risk worth extra points?",
    ],
    skillFocus: "Refine force control and angle to solve accuracy",
    returnToGame: "Return to target game — observe consistency across attempts",
    assessmentEvidence: ["Skill execution in game context", "Force control", "Persistence"],
    differentiation: {
      easier: ["Larger target", "Closer starting distance", "More attempts allowed"],
      harder: ["Smaller target", "Risk lane with high points", "Non-dominant hand only"],
    },
  },
};

export function getTGfULessonTemplateByCategory(category: TGfUGameCategory): TGfULessonTemplate {
  return TGfU_LESSON_TEMPLATES_BY_CATEGORY[category];
}

export function getTGfUSchemeUnitProgressionTips(lessonCount: number): string[] {
  const phases = TGfU_SCHEME_UNIT_PROGRESSION;
  if (lessonCount <= phases.length) {
    return phases.slice(0, lessonCount);
  }
  return [
    ...phases,
    ...Array.from({ length: lessonCount - phases.length }, (_, i) => `Extension ${i + 1}: spiral revisit`),
  ];
}

/** Virtual knowledge entry for PE Specialist Suggestions — TGfU Master layer. */
export const TGfU_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "tgfu-master",
  title: "TGfU Master — Games teaching specialist",
  category: "pedagogy-model",
  summary: TGfU_CORE_DEFINITION,
  keyPrinciples: TGfU_PEDAGOGICAL_PRINCIPLES.map((p) => p.name),
  whyItMattersInPE:
    "TGfU develops tactical understanding before or alongside technique — essential for invasion, net/wall, striking and target games.",
  whenToUse: TGfU_GAME_CATEGORIES.flatMap((c) => c.sports.slice(0, 2)).map((s) => `${s} units`),
  commonMistakes: TGfU_PLANNING_MISTAKES.slice(0, 5).map((m) => m.mistake),
  practicalApplications: TGfU_SIX_PHASES.map((p) => `${p.name}: ${p.teacherPurpose}`),
  lessonPlanningPrompts: TGfU_SIX_PHASES.flatMap((p) => p.planningPrompts).slice(0, 6),
  assessmentPrompts: TGfU_ASSESSMENT_DOMAINS.cognitive.concat(TGfU_ASSESSMENT_DOMAINS.physical).slice(0, 4),
  differentiationPrompts: TGfU_DIFFERENTIATION.easier.slice(0, 3),
  agePhaseRelevance: ["primary", "middle-school", "secondary"],
  pathwayRelevance: ["all"],
  relatedModels: ["tgfu", "constraints-led", "guided-discovery"],
  tags: ["tgfu", "games", "invasion-games", "net-games", "tactics", "decision-making"],
};

export function buildTGfUMasterCardReason(context: TGfUContext): string {
  const approach = suggestTGfUApproach(context);
  if (!approach) return TGfU_CORE_DEFINITION.slice(0, 120);
  return `${approach.categoryLabel} — focus on ${approach.tacticalProblem.replace(/-/g, " ")}.`;
}

export function enrichTGfUKnowledgeCard(
  context: TGfUContext
): {
  planningPrompts: string[];
  assessmentPrompt: string;
  differentiationPrompt: string;
  reason: string;
} | null {
  const approach = suggestTGfUApproach(context);
  const template = buildTGfULessonTemplate(context);
  if (!approach || !template) return null;

  return {
    reason: buildTGfUMasterCardReason(context),
    planningPrompts: [
      `Tactical problem: ${template.tacticalProblem}`,
      `Modified game: ${template.modifiedGame}`,
      template.skillFocus,
    ],
    assessmentPrompt: template.assessmentEvidence[0] ?? approach.assessmentEvidence[0],
    differentiationPrompt: template.differentiation.easier[0] ?? approach.differentiationIdeas[0],
  };
}

export function flagTGfUPlanningIssues(lessonText: string): string[] {
  const text = lessonText.toLowerCase();
  const flags: string[] = [];
  for (const mistake of TGfU_PLANNING_MISTAKES) {
    if (mistake.id === "no-return" && text.includes("skill") && !text.includes("return") && !text.includes("game")) {
      flags.push(mistake.appFlag);
    }
    if (mistake.id === "no-focus" && !text.includes("walt") && !text.includes("learning")) {
      flags.push(mistake.appFlag);
    }
    if (mistake.id === "technique-too-early" && text.includes("drill") && !text.includes("game")) {
      flags.push(mistake.appFlag);
    }
  }
  return [...new Set(flags)].slice(0, 2);
}
