/**
 * TGfU Master Pack v2 — curriculum planning by game category.
 * Original educational content — not copied from copyrighted sources.
 */

import type { TGfUGameCategory } from "./tgfuMaster";
import { classifyGame, resolveTGfUGameCategory } from "./tgfuMaster";
import { getTacticalComplexityLadder } from "./tgfuProgressions";

export interface CategoryCurriculum {
  category: TGfUGameCategory;
  label: string;
  sharedSports: string[];
  sharedTacticalProblems: string[];
  sharedDecisionConcepts: string[];
  sharedAssessmentOpportunities: string[];
  sharedQuestioningPrompts: string[];
  sharedProgressionIdeas: string[];
  crossSportNote: string;
}

export const CATEGORY_CURRICULUM: Record<TGfUGameCategory, CategoryCurriculum> = {
  invasion: {
    category: "invasion",
    label: "Invasion games",
    sharedSports: ["football", "basketball", "handball", "rugby", "hockey", "netball"],
    sharedTacticalProblems: [
      "maintaining possession",
      "creating and exploiting space",
      "progressing toward goal",
      "denying space and regaining possession",
    ],
    sharedDecisionConcepts: [
      "when to pass vs dribble",
      "when to support vs make a forward run",
      "when to press vs hold shape",
    ],
    sharedAssessmentOpportunities: [
      "Decision making under opposition",
      "Movement off the ball",
      "Support play and communication",
      "Tactical adaptation when plan breaks down",
    ],
    sharedQuestioningPrompts: [
      "How can we create space?",
      "When should we pass instead of dribble?",
      "Where else might this idea work in another invasion game?",
    ],
    sharedProgressionIdeas: [
      "Unopposed → 1v1 → small-sided → conditioned full rules",
      "Spiral same tactical problem across two invasion sports",
    ],
    crossSportNote:
      "Football and basketball share tactical learning outcomes — possession, space, and forward progress transfer across invasion games.",
  },
  "net-wall": {
    category: "net-wall",
    label: "Net and wall games",
    sharedSports: ["volleyball", "badminton", "tennis", "pickleball"],
    sharedTacticalProblems: [
      "sending into space",
      "recovering court position",
      "forcing weak returns",
      "defending space",
    ],
    sharedDecisionConcepts: [
      "where to send the ball",
      "when to attack vs rebuild",
      "how to vary height, speed, and direction",
    ],
    sharedAssessmentOpportunities: [
      "Court recovery after each send",
      "Decision quality in rally or point play",
      "Forcing opponent into weak position",
    ],
    sharedQuestioningPrompts: [
      "Where should you send the ball to move your opponent?",
      "How do we recover court position together?",
      "Where else might sending into space matter in another net game?",
    ],
    sharedProgressionIdeas: [
      "Cooperative rally → one blocker → full point play",
      "Compare deep vs short returns across volleyball and badminton",
    ],
    crossSportNote:
      "Volleyball and badminton share tactical learning outcomes — placement, recovery, and forcing weak returns transfer across net and wall games.",
  },
  "striking-fielding": {
    category: "striking-fielding",
    label: "Striking and fielding",
    sharedSports: ["rounders", "cricket", "softball"],
    sharedTacticalProblems: [
      "striking away from fielders",
      "selecting safe scoring moments",
      "field placement and communication",
      "limiting opponent scoring",
    ],
    sharedDecisionConcepts: [
      "when to run vs stay",
      "where to strike for safest scoring",
      "how fielders communicate and cover",
    ],
    sharedAssessmentOpportunities: [
      "Strike placement under fielding pressure",
      "Run decision quality",
      "Field communication and positioning",
    ],
    sharedQuestioningPrompts: [
      "When is an extra run worth the risk?",
      "Where is the safest place to strike?",
      "How did fielders limit scoring?",
    ],
    sharedProgressionIdeas: [
      "Striker vs reduced fielders → full field → game scenarios",
      "Rotate striker and fielder roles for decision exposure",
    ],
    crossSportNote:
      "Rounders and cricket share tactical learning outcomes — safe scoring, field placement, and communication transfer across striking and fielding games.",
  },
  target: {
    category: "target",
    label: "Target games",
    sharedSports: ["bocce", "bowls", "golf putting activities"],
    sharedTacticalProblems: [
      "accuracy and direction",
      "force control for distance",
      "angle selection",
      "risk and reward",
    ],
    sharedDecisionConcepts: [
      "safe vs aggressive line",
      "when to block vs score",
      "consistency vs bonus opportunities",
    ],
    sharedAssessmentOpportunities: [
      "Accuracy under pressure",
      "Force control across attempts",
      "Strategic risk choices",
    ],
    sharedQuestioningPrompts: [
      "What angle gives the best chance?",
      "When is risk worth extra points?",
      "How do you stay consistent across attempts?",
    ],
    sharedProgressionIdeas: [
      "Close target → varied distance → risk lanes",
      "Team accumulation with alternating roles",
    ],
    crossSportNote:
      "Bocce and bowls share tactical learning outcomes — accuracy, force control, and risk reward transfer across target games.",
  },
};

export function getCategoryCurriculum(category: TGfUGameCategory): CategoryCurriculum {
  return CATEGORY_CURRICULUM[category];
}

export function getCurriculumForTopic(
  topicId?: string,
  activityArea?: string
): CategoryCurriculum | null {
  const category = resolveTGfUGameCategory(topicId, activityArea);
  if (!category) return null;
  return CATEGORY_CURRICULUM[category];
}

export function getSharedOutcomesForSport(sportOrTopic: string): CategoryCurriculum | null {
  const classified = classifyGame(sportOrTopic);
  if (!classified) return null;
  return CATEGORY_CURRICULUM[classified.category];
}

export function buildPlanningAssistantCurriculumSummary(
  topicId?: string,
  activityArea?: string
): {
  category: string;
  crossSportNote: string;
  tacticalProblem: string;
  complexityLevel: string;
  questioning: string[];
  differentiation: string[];
  assessment: string[];
} | null {
  const curriculum = getCurriculumForTopic(topicId, activityArea);
  const classified = classifyGame(topicId ?? activityArea ?? "");
  if (!curriculum || !classified) return null;

  const ladder = getTacticalComplexityLadder(classified.category);
  const firstLevel = ladder[0];

  return {
    category: curriculum.label,
    crossSportNote: curriculum.crossSportNote,
    tacticalProblem: curriculum.sharedTacticalProblems[0],
    complexityLevel: firstLevel ? `Level 1: ${firstLevel.name}` : "Level 1",
    questioning: curriculum.sharedQuestioningPrompts.slice(0, 3),
    differentiation: [
      "Easier: more space, slower pace, fewer rules",
      "Harder: smaller space, time pressure, bonus for tactical solutions",
    ],
    assessment: curriculum.sharedAssessmentOpportunities.slice(0, 3),
  };
}
