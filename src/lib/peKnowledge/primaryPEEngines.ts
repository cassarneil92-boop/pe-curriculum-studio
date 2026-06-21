/**
 * Primary PE & Fundamental Movement Master Pack v1 — engines.
 */

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { SchemeOfWork } from "@/lib/types";
import type { LessonApplyTarget } from "./applySuggestions";
import type { LessonKnowledgeContext } from "./types";
import {
  FUNDAMENTAL_MOVEMENT_SKILLS,
  getFMSSkillById,
  isPrimaryPEYearGroup,
  isPrimaryPERelevant,
  MOVEMENT_CONCEPTS_FRAMEWORK,
  PRIMARY_PE_WARNINGS,
  yearGroupToPrimaryPhase,
  type FundamentalMovementSkill,
  type PrimaryYearPhase,
} from "./primaryPEMaster";

export type PrimaryPEQualityBand = "Exceptional" | "Strong" | "Developing" | "Limited";

export type ReadinessVerdict = "too-easy" | "appropriate" | "too-complex";

export type SkillProgressionStage = "explore" | "practise" | "refine" | "combine" | "apply";

export interface PrimaryPELessonContext extends LessonKnowledgeContext {
  topicId?: string;
  walt?: string;
  wilf?: string;
  activities?: string;
  differentiation?: string;
  assessmentNotes?: string;
  reflectionNotes?: string;
  safetyConsiderations?: string;
  structuredActivityText?: string;
  equipment?: string;
}

export interface PrimaryPEQualityInsight {
  id: string;
  area: string;
  message: string;
  prompt?: string;
  entryId?: string;
  fix?: {
    target: LessonApplyTarget;
    text: string;
    actionLabel: string;
    asQuestions?: boolean;
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreBand(score: number): PrimaryPEQualityBand {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Developing";
  return "Limited";
}

export function lessonToPrimaryPEContext(lesson: LessonBuilderFormData): PrimaryPELessonContext {
  const structured = (lesson.structuredActivities ?? [])
    .map((a) => `${a.name} ${a.taskDescription} ${a.students}`)
    .join(" ");
  return {
    yearGroup: lesson.yearGroup,
    pathway: lesson.selectedPathways?.[0] ?? lesson.pathwayId,
    topicId: lesson.topicId,
    activityArea: lesson.topicId,
    walt: lesson.walt ?? lesson.learningIntention,
    wilf: lesson.successCriteria,
    activities: lesson.activities,
    differentiation: lesson.differentiation,
    assessmentNotes: lesson.assessmentNotes,
    reflectionNotes: lesson.reflectionNotes,
    safetyConsiderations: lesson.safetyConsiderations,
    equipment: lesson.equipment,
    structuredActivityText: structured,
    lessonAim: lesson.walt ?? lesson.learningIntention,
  };
}

export function collectPrimaryPEText(ctx: PrimaryPELessonContext): string {
  return [
    ctx.walt,
    ctx.wilf,
    ctx.activities,
    ctx.structuredActivityText,
    ctx.differentiation,
    ctx.assessmentNotes,
    ctx.reflectionNotes,
    ctx.safetyConsiderations,
    ctx.equipment,
    ctx.lessonAim,
    ctx.activityArea,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function yearGroupToNumeric(yearGroup?: string): number {
  if (!yearGroup) return 4;
  const m = yearGroup.match(/year-(\d+)/i);
  if (m) return parseInt(m[1], 10);
  if (/early|kg/i.test(yearGroup)) return 1;
  return 4;
}

export function detectFMSSkillFocus(text: string): FundamentalMovementSkill | undefined {
  for (const skill of FUNDAMENTAL_MOVEMENT_SKILLS) {
    if (new RegExp(`\\b${skill.name.toLowerCase()}|${skill.id.replace(/-/g, "[\\s-]?")}\\b`, "i").test(text)) {
      return skill;
    }
  }
  if (/\bthrow|overarm|underarm\b/i.test(text)) return getFMSSkillById("throwing");
  if (/\bcatch|receiv\b/i.test(text)) return getFMSSkillById("catching");
  if (/\brun|sprint\b/i.test(text)) return getFMSSkillById("running");
  if (/\bjump|leap\b/i.test(text)) return getFMSSkillById("jumping");
  if (/\bbalance|land\b/i.test(text)) return getFMSSkillById("balancing");
  return undefined;
}

export function evaluateDevelopmentalReadiness(ctx: PrimaryPELessonContext): {
  readinessScore: number;
  verdict: ReadinessVerdict;
  suggestedSimplification: string;
  suggestedExtension: string;
  factors: { factor: string; rating: string }[];
} {
  const text = collectPrimaryPEText(ctx);
  const yearNum = yearGroupToNumeric(ctx.yearGroup);
  let complexity = 0;

  if (/\bfull rules|11v11|regulation|competitive league\b/i.test(text)) complexity += 25;
  if (/\btactic|strategy|formation|complex\b/i.test(text)) complexity += 15;
  if (/\belimination|knockout|out if\b/i.test(text)) complexity += 12;
  if (/\blarge group|whole class team|10\+ pupils\b/i.test(text)) complexity += 10;
  if (/\b(adult|fitness test|beep test|burpee)\b/i.test(text)) complexity += 15;
  if (/\bstation|pairs|small group|personal space\b/i.test(text)) complexity -= 10;
  if (/\bsimple|modified|explore|play\b/i.test(text)) complexity -= 8;

  const expectedComplexity = Math.max(0, (yearNum - 1) * 4);
  const diff = complexity - expectedComplexity;
  let verdict: ReadinessVerdict = "appropriate";
  if (diff > 12) verdict = "too-complex";
  if (diff < -10) verdict = "too-easy";

  const readinessScore = clamp(70 - Math.abs(diff) * 2 + (verdict === "appropriate" ? 20 : 0));

  const factors = [
    { factor: "Movement complexity", rating: complexity > expectedComplexity + 10 ? "high" : "moderate" },
    { factor: "Rule complexity", rating: /\brules|offside|foul\b/i.test(text) ? "check" : "low" },
    { factor: "Independence level", rating: /\bself|choice|design\b/i.test(text) ? "appropriate" : "teacher-led" },
    { factor: "Safety risk", rating: /\bapparatus|height|contact\b/i.test(text) ? "monitor" : "low" },
  ];

  return {
    readinessScore,
    verdict,
    suggestedSimplification:
      verdict === "too-complex"
        ? "Reduce rules to one aim; use pairs and larger equipment."
        : "Already appropriate — simplify only if pupils struggle.",
    suggestedExtension:
      verdict === "too-easy"
        ? "Add combine or apply challenge — link skill to simple game."
        : "Extend with self-direction or combine two skills.",
    factors,
  };
}

export function buildPrimaryPELessonStructure(ctx: PrimaryPELessonContext): {
  phases: { name: string; duration: string; focus: string; teacherPrompt: string }[];
} {
  const skill = detectFMSSkillFocus(collectPrimaryPEText(ctx));
  const skillName = skill?.name ?? "movement exploration";

  return {
    phases: [
      { name: "Instant activity", duration: "3–5 min", focus: "Everyone moving immediately", teacherPrompt: "Start with a copy-move or travel game — no lining up." },
      { name: "Movement exploration", duration: "5–8 min", focus: "Explore ways to move", teacherPrompt: `How many ways can you ${skillName.toLowerCase()}?` },
      { name: "Skill focus", duration: "8–10 min", focus: skillName, teacherPrompt: skill?.teachingCues[0] ?? "One clear teaching cue only." },
      { name: "Practice challenge", duration: "10–12 min", focus: "Repeated practice with feedback", teacherPrompt: "Stations or pairs — maximum attempts per pupil." },
      { name: "Application game or movement task", duration: "8–10 min", focus: "Use skill in simple game", teacherPrompt: "Simple rules — can pupils show the skill in play?" },
      { name: "Cool down or reflection", duration: "3–5 min", focus: "Calm body and reflect", teacherPrompt: "What did you improve today? Show me one more time." },
    ],
  };
}

export function evaluatePrimaryLessonStructure(ctx: PrimaryPELessonContext): {
  score: number;
  flags: string[];
  fixes: string[];
} {
  const text = collectPrimaryPEText(ctx);
  let score = 50;
  const flags: string[] = [];
  const fixes: string[] = [];

  if (/\binstant|warm.?up|start activity|copy.?move|travel game\b/i.test(text)) score += 10;
  else {
    flags.push("No instant activity");
    fixes.push("Begin with instant activity — pupils moving within 60 seconds.");
  }

  if (/\bdemo|explain|talk|instruction\b/i.test(text) && !/\bstation|active|explore\b/i.test(text)) {
    flags.push("Too much talking");
    fixes.push("Keep teaching cue to 30 seconds — show then do.");
  } else score += 8;

  if (detectFMSSkillFocus(text) || /\bskill|focus|practise|practice\b/i.test(text)) score += 12;
  else {
    flags.push("Weak skill focus");
    fixes.push("Name one FMS in WALT or WILF.");
  }

  if (/\bgame|apply|challenge|task|application\b/i.test(text)) score += 10;
  else {
    flags.push("No application");
    fixes.push("End main section with simple application game or task.");
  }

  if (/\breflect|cool.?down|what did you|review\b/i.test(text)) score += 8;
  else {
    flags.push("No reflection");
    fixes.push("Add 2-minute cool down with one child-friendly question.");
  }

  if (/\btransition|signal|rotate|station change\b/i.test(text)) score += 6;
  else {
    flags.push("Poor transition planning");
    fixes.push("Plan clear transition signal before lesson.");
  }

  return { score: clamp(score), flags: flags.slice(0, 4), fixes: fixes.slice(0, 4) };
}

export function suggestMovementConcepts(ctx: PrimaryPELessonContext): {
  concepts: string[];
  teachingLanguage: string[];
  whyThese: string;
} {
  const text = collectPrimaryPEText(ctx);
  const phase = yearGroupToPrimaryPhase(ctx.yearGroup);
  const concepts: string[] = [];
  const teachingLanguage: string[] = [];

  if (phase === "early-years" || !/\bdirection|pathway\b/i.test(text)) {
    concepts.push("Personal space", "Levels");
    teachingLanguage.push("Stay in your bubble", "Make a high shape");
  }
  if (/\brun|travel|path|move\b/i.test(text)) {
    concepts.push("Direction", "Pathway");
    teachingLanguage.push("Travel on a curved pathway", "Change direction on signal");
  }
  if (/\bthrow|kick|strike|force\b/i.test(text)) {
    concepts.push("Force", "With equipment");
    teachingLanguage.push("Send with soft force", "Eyes on target");
  }
  if (/\bdance|rhythm|skip\b/i.test(text)) {
    concepts.push("Flow", "With rhythm");
    teachingLanguage.push("Smooth flowing movement", "Move with the beat");
  }
  if (/\bpartner|team|group\b/i.test(text)) {
    concepts.push("With others");
    teachingLanguage.push("Mirror your partner", "Stay on your side of the space");
  }

  const unique = [...new Set(concepts)].slice(0, 4);
  return {
    concepts: unique.length > 0 ? unique : ["Personal space", "Speed", "Body shapes"],
    teachingLanguage: teachingLanguage.slice(0, 3),
    whyThese: `Selected for ${phase.replace("-", " ")} and current activity focus.`,
  };
}

export function evaluatePrimaryActiveParticipation(ctx: PrimaryPELessonContext): {
  score: number;
  flags: string[];
  fixes: string[];
} {
  const text = collectPrimaryPEText(ctx);
  let score = 55;
  const flags: string[] = [];
  const fixes: string[] = [];

  if (/\bstation|circuit|rotate|parallel\b/i.test(text)) score += 15;
  if (/\bpairs|pair\b/i.test(text)) score += 12;
  if (/\bsmall group|3v3|4v4|groups of\b/i.test(text)) score += 8;
  if (/\bqueue|line up|wait|one at a time\b/i.test(text)) {
    score -= 15;
    flags.push("Long lines");
    fixes.push("Use stations or pairs instead of queues.");
  }
  if (/\bone ball|single ball|only one\b/i.test(text) && !/\bstation\b/i.test(text)) {
    flags.push("One ball for too many pupils");
    fixes.push("Add equipment or run parallel tasks.");
  }
  if (/\belimination|out if|knocked out\b/i.test(text)) {
    flags.push("Elimination games");
    fixes.push("Use return activities or cooperative scoring.");
  }
  if (/\blong demo|extended explanation|talk for\b/i.test(text)) {
    flags.push("Excessive demonstration time");
    fixes.push("Show once — pupils practise immediately.");
  }
  if (!/\bactive|moving|all pupils|everyone\b/i.test(text) && /\bwhole class\b/i.test(text)) {
    flags.push("Passive pupils likely");
    fixes.push("Plan so at least 80% are active at any moment.");
  }

  if (fixes.length === 0) fixes.push("Maintain high activity with short teaching moments.");

  return { score: clamp(score), flags: [...new Set(flags)].slice(0, 4), fixes: fixes.slice(0, 4) };
}

export function evaluatePrimarySafetyAndOrganisation(ctx: PrimaryPELessonContext): {
  safetyStrengths: string[];
  safetyRisks: string[];
  organisationImprovements: string[];
} {
  const text = collectPrimaryPEText(ctx);
  const strengths: string[] = [];
  const risks: string[] = [];
  const improvements: string[] = [];

  if (/\bboundary|cone|zone|area\b/i.test(text)) strengths.push("Space boundaries considered");
  else {
    risks.push("Unclear space boundaries");
    improvements.push("Mark boundaries with cones before start.");
  }

  if (/\bsafe|safety|distance|spacing\b/i.test(text) || ctx.safetyConsiderations) strengths.push("Safety notes present");
  else {
    risks.push("Safe distances not planned");
    improvements.push("Plan one metre per pupil in dynamic tasks.");
  }

  if (/\bsoft|foam|age.?appropriate|size\b/i.test(text)) strengths.push("Equipment suitability considered");
  else if (/\bfull size|regulation|heavy\b/i.test(text)) {
    risks.push("Equipment may not suit age");
    improvements.push("Use lighter or larger primary equipment.");
  }

  if (/\blanding|mat|apparatus\b/i.test(text) && !/\bspot|supervis\b/i.test(text)) {
    risks.push("Landing or apparatus needs supervision");
    improvements.push("Position yourself at landing zone; limit group size on apparatus.");
  }

  if (/\btransition|organise|group size\b/i.test(text)) strengths.push("Organisation planned");

  if (strengths.length === 0) strengths.push("Simple clear rules reduce organisation risk.");

  return {
    safetyStrengths: strengths.slice(0, 4),
    safetyRisks: risks.slice(0, 4),
    organisationImprovements: improvements.slice(0, 4),
  };
}

export function evaluatePrimaryPEInclusion(ctx: PrimaryPELessonContext): {
  score: number;
  adaptations: string[];
  confidencePrompts: string[];
} {
  const text = collectPrimaryPEText(ctx);
  let score = 45;
  const adaptations: string[] = [];
  const confidencePrompts: string[] = [];

  if (/\bdifferentiat|adapt|support|send|lsa|inclus\b/i.test(text)) score += 20;
  if (/\bchoice|level|easier|challenge\b/i.test(text)) score += 15;
  if (/\bconfidence|anxious|nervous\b/i.test(text)) {
    score += 10;
    confidencePrompts.push("Offer opt-in demonstration", "Private praise for effort");
  }
  if (/\bpeer|partner|helper\b/i.test(text)) score += 10;

  if (!/\bdifferentiat|adapt\b/i.test(text)) {
    adaptations.push("Simplified rules for same learning intention");
    adaptations.push("Adapted equipment — lighter, larger, or slower");
    adaptations.push("Alternative success criteria on WILF");
  } else {
    adaptations.push("Peer support pairs with clear roles");
    adaptations.push("Visual cards for EAL pupils");
  }

  confidencePrompts.push("Celebrate personal best not rank", "Allow pupil to watch before joining");

  return { score: clamp(score), adaptations: adaptations.slice(0, 4), confidencePrompts: confidencePrompts.slice(0, 3) };
}

export function suggestPrimaryPEAssessment(ctx: PrimaryPELessonContext): {
  teacherObservationFocus: string;
  simpleChecklist: string[];
  childFriendlySelfAssessment: string;
  peerObservationPrompt: string;
  movementEvidence: string;
  socialEvidence: string;
  confidenceEvidence: string;
} {
  const skill = detectFMSSkillFocus(collectPrimaryPEText(ctx));
  const phase = yearGroupToPrimaryPhase(ctx.yearGroup);

  return {
    teacherObservationFocus: skill?.assessmentEvidence[0] ?? "Active participation and safe movement",
    simpleChecklist: [
      skill ? `Uses ${skill.teachingCues[0] ?? "correct form"}` : "On task during practice",
      "Safe spacing and equipment use",
      "Effort visible",
    ],
    childFriendlySelfAssessment:
      phase === "early-years"
        ? "Did I try my best? Thumbs up or sideways."
        : "What did I get better at today?",
    peerObservationPrompt: "Tell your partner one thing they did well.",
    movementEvidence: skill ? `${skill.name}: ${skill.competentIndicators[0]}` : "Travels and stops safely in space",
    socialEvidence: "Takes turns and respects personal space",
    confidenceEvidence: "Willing to try again after mistake",
  };
}

const PROGRESSION_STAGES: SkillProgressionStage[] = ["explore", "practise", "refine", "combine", "apply"];

export function buildPrimarySkillProgression(ctx: PrimaryPELessonContext): {
  skill: string;
  progressionSequence: { stage: SkillProgressionStage; description: string }[];
  teachingCues: string[];
  assessmentCheckpoint: string;
  differentiation: string[];
} {
  const skill = detectFMSSkillFocus(collectPrimaryPEText(ctx));
  const name = skill?.name ?? "movement skill";
  const cues = skill?.teachingCues ?? ["Eyes up", "Control", "Try again"];

  return {
    skill: name,
    progressionSequence: [
      { stage: "explore", description: `Explore different ways to ${name.toLowerCase()}` },
      { stage: "practise", description: `Practise ${name.toLowerCase()} with one clear cue` },
      { stage: "refine", description: `Refine ${name.toLowerCase()} — ${cues[1] ?? "improve consistency"}` },
      { stage: "combine", description: `Combine ${name.toLowerCase()} with travel or partner` },
      { stage: "apply", description: `Apply in target challenge or simple game` },
    ],
    teachingCues: cues,
    assessmentCheckpoint: skill?.assessmentEvidence[0] ?? "Most pupils show developing form",
    differentiation: skill?.progressionIdeas ?? ["Closer target", "Larger equipment", "Partner support"],
  };
}

export function suggestPrimaryGameFoundation(ctx: PrimaryPELessonContext): {
  gameType: string;
  simpleRules: string[];
  tacticalIdea: string;
  movementSkillFocus: string;
  inclusionAdaptation: string;
} {
  const text = collectPrimaryPEText(ctx);
  const skill = detectFMSSkillFocus(text);

  if (/\bfootball|soccer|basketball|hockey|full sport\b/i.test(text)) {
    return {
      gameType: "Simple sending and receiving game",
      simpleRules: ["Pass to partner in zone", "Travel before pass", "No tackling — tag only"],
      tacticalIdea: "Find space to receive",
      movementSkillFocus: skill?.name ?? "Throwing and catching",
      inclusionAdaptation: "Multiple balls; pupils choose pass distance",
    };
  }
  if (/\bnet|volley|wall\b/i.test(text)) {
    return {
      gameType: "Net/wall preparation",
      simpleRules: ["Send over line", "Partner catch", "Three sends each"],
      tacticalIdea: "Send away from partner first",
      movementSkillFocus: "Volleying or striking",
      inclusionAdaptation: "Lower net line with cones; balloon option",
    };
  }
  if (/\bchase|tag|flee\b/i.test(text)) {
    return {
      gameType: "Chasing and fleeing game",
      simpleRules: ["Stay in boundary", "Tag with two fingers", "Reset after tag"],
      tacticalIdea: "Change direction to escape",
      movementSkillFocus: "Running and dodging",
      inclusionAdaptation: "Wheelchair users as taggers or boundary judges",
    };
  }
  if (/\btarget|throw|aim\b/i.test(text)) {
    return {
      gameType: "Simple target game",
      simpleRules: ["Three throws each", "Hit target for team point", "Retrieve safely"],
      tacticalIdea: "Aim before power",
      movementSkillFocus: skill?.name ?? "Throwing",
      inclusionAdaptation: "Varied target distances at stations",
    };
  }

  return {
    gameType: "Simple invasion-style game",
    simpleRules: ["Score in end zone", "Pass not run with ball", "Defend by marking space"],
    tacticalIdea: "Spread out to find space",
    movementSkillFocus: skill?.name ?? "Running and sending",
    inclusionAdaptation: "Smaller teams; floater player helps weaker team",
  };
}

export function suggestChildFriendlyFitnessApproach(ctx: PrimaryPELessonContext): {
  activityIdea: string;
  healthConcept: string;
  safetyNote: string;
  confidenceNote: string;
} {
  const phase = yearGroupToPrimaryPhase(ctx.yearGroup);

  return {
    activityIdea:
      phase === "early-years"
        ? "Animal walks circuit — bear, crab, frog jumps with rest stations"
        : "Personal best challenge circuit — track own reps, not others",
    healthConcept: "Moving makes heart and lungs stronger — energy for play and learning",
    safetyNote: "Build in water breaks; no maximal testing; stop on pain",
    confidenceNote: "Praise effort and improvement — never rank pupils publicly",
  };
}

export function evaluatePrimaryPEQuality(ctx: PrimaryPELessonContext): {
  score: number;
  band: PrimaryPEQualityBand;
  dimensionScores: Record<string, number>;
  warnings: string[];
  practicalFixes: string[];
  strongestArea: string;
  weakestArea: string;
} {
  const text = collectPrimaryPEText(ctx);
  const readiness = evaluateDevelopmentalReadiness(ctx);
  const participation = evaluatePrimaryActiveParticipation(ctx);
  const inclusion = evaluatePrimaryPEInclusion(ctx);
  const safety = evaluatePrimarySafetyAndOrganisation(ctx);
  const structure = evaluatePrimaryLessonStructure(ctx);
  const skill = detectFMSSkillFocus(text);
  const concepts = suggestMovementConcepts(ctx);
  const progression = buildPrimarySkillProgression(ctx);
  const assessment = suggestPrimaryPEAssessment(ctx);

  const dimensionScores: Record<string, number> = {
    developmentalAppropriateness: readiness.readinessScore,
    fmsFocus: skill ? 75 : /\bfms|fundamental|skill|locomotor|throw|catch|balance\b/i.test(text) ? 55 : 35,
    activityTime: participation.score,
    inclusion: inclusion.score,
    safety: safety.safetyRisks.length === 0 ? 80 : clamp(60 - safety.safetyRisks.length * 12),
    movementConceptClarity: concepts.concepts.length >= 2 && /\blevel|space|pathway|force|direction\b/i.test(text) ? 75 : 45,
    progression: structure.score,
    assessmentEvidence: /\bassess|observ|checklist|evidence|watch for\b/i.test(text) ? 70 : 40,
    confidenceBuilding: /\bconfidence|effort|personal best|encourag\b/i.test(text) ? 72 : 48,
    enjoyment: /\bfun|play|enjoy|game|explore\b/i.test(text) ? 78 : 50,
  };

  const keys = Object.keys(dimensionScores);
  const weights = keys.map(() => 1 / keys.length);
  const score = clamp(keys.reduce((s, k, i) => s + dimensionScores[k] * weights[i], 0));

  const sorted = [...keys].sort((a, b) => dimensionScores[b] - dimensionScores[a]);
  const warnings: string[] = [];
  const practicalFixes: string[] = [];

  for (const w of PRIMARY_PE_WARNINGS) {
    if (w.id === "too-sport-specific" && /\bfootball|basketball|11v11|full rules\b/i.test(text)) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "too-much-waiting" && participation.flags.includes("Long lines")) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-fms" && !skill) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "rules-complex" && readiness.verdict === "too-complex") {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-inclusion" && inclusion.score < 55) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-assessment" && dimensionScores.assessmentEvidence < 50) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-concept-language" && dimensionScores.movementConceptClarity < 50) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
  }

  void progression;
  void assessment;

  return {
    score,
    band: scoreBand(score),
    dimensionScores,
    warnings: [...new Set(warnings)].slice(0, 4),
    practicalFixes: [...new Set(practicalFixes)].slice(0, 4),
    strongestArea: sorted[0] ?? "activityTime",
    weakestArea: sorted[sorted.length - 1] ?? "fmsFocus",
  };
}

export function buildPrimaryPEPlanningInsights(
  promptOrText: string,
  ctx?: PrimaryPELessonContext
): string[] {
  const context: PrimaryPELessonContext = ctx ?? { lessonAim: promptOrText, walt: promptOrText };
  if (!isPrimaryPERelevant(collectPrimaryPEText(context) + promptOrText, context.yearGroup)) return [];

  const readiness = evaluateDevelopmentalReadiness(context);
  const participation = evaluatePrimaryActiveParticipation(context);
  const concepts = suggestMovementConcepts(context);
  const game = suggestPrimaryGameFoundation(context);
  const insights: string[] = [];

  if (readiness.verdict === "too-complex") {
    insights.push(`This ${context.yearGroup?.replace("year-", "Year ") ?? "primary"} lesson may need a simpler rule structure.`);
  }
  if (!detectFMSSkillFocus(collectPrimaryPEText(context))) {
    insights.push("Add a clear fundamental movement skill focus.");
  }
  if (participation.flags.length > 0) {
    insights.push("Use stations to reduce waiting time.");
  }
  if (concepts.concepts.length > 0) {
    insights.push(`Consider movement concepts such as ${concepts.concepts.slice(0, 2).join(" and ").toLowerCase()}.`);
  }
  if (/\bfootball|basketball|full\b/i.test(collectPrimaryPEText(context))) {
    insights.push(`Replace full sport with a ${game.gameType.toLowerCase()}.`);
  }
  if (insights.length === 0) {
    insights.push("Plan explore → practise → refine → combine → apply for the skill focus.");
  }

  return insights.slice(0, 5);
}

export function buildPedagogyCoachPrimaryPEMetrics(lesson: LessonBuilderFormData): {
  score: number;
  band: string;
  fmsFocus: string;
  developmentalReadiness: string;
  activeParticipationWarning: string | null;
  movementConcept: string;
  safetyNote: string;
  assessmentIdea: string;
} | null {
  if (!isPrimaryPEYearGroup(lesson.yearGroup)) return null;

  const ctx = lessonToPrimaryPEContext(lesson);
  const quality = evaluatePrimaryPEQuality(ctx);
  const readiness = evaluateDevelopmentalReadiness(ctx);
  const participation = evaluatePrimaryActiveParticipation(ctx);
  const safety = evaluatePrimarySafetyAndOrganisation(ctx);
  const concepts = suggestMovementConcepts(ctx);
  const assessment = suggestPrimaryPEAssessment(ctx);
  const skill = detectFMSSkillFocus(collectPrimaryPEText(ctx));

  return {
    score: quality.score,
    band: quality.band,
    fmsFocus: skill?.name ?? "Add explicit FMS focus",
    developmentalReadiness: readiness.verdict === "appropriate" ? "Appropriate for year group" : readiness.verdict.replace("-", " "),
    activeParticipationWarning: participation.flags[0] ?? null,
    movementConcept: concepts.concepts[0] ?? "Personal space",
    safetyNote: safety.safetyRisks[0] ?? safety.safetyStrengths[0] ?? "Mark boundaries before activity",
    assessmentIdea: assessment.teacherObservationFocus,
  };
}

export function buildPrimaryPEQualityReview(lesson: LessonBuilderFormData): {
  score: number;
  band: PrimaryPEQualityBand;
  checks: { label: string; met: boolean }[];
  warnings: string[];
  recommendations: string[];
} {
  const ctx = lessonToPrimaryPEContext(lesson);
  const quality = evaluatePrimaryPEQuality(ctx);
  const participation = evaluatePrimaryActiveParticipation(ctx);
  const readiness = evaluateDevelopmentalReadiness(ctx);
  const inclusion = evaluatePrimaryPEInclusion(ctx);
  const safety = evaluatePrimarySafetyAndOrganisation(ctx);
  const skill = detectFMSSkillFocus(collectPrimaryPEText(ctx));

  const checks = [
    { label: "Developmentally appropriate", met: readiness.verdict !== "too-complex" },
    { label: "High activity time", met: participation.score >= 60 },
    { label: "Clear FMS focus", met: !!skill || quality.dimensionScores.fmsFocus >= 55 },
    { label: "Safe organisation", met: safety.safetyRisks.length <= 1 },
    { label: "Inclusive task design", met: inclusion.score >= 55 },
    { label: "Movement concept language", met: quality.dimensionScores.movementConceptClarity >= 55 },
    { label: "Assessment evidence", met: quality.dimensionScores.assessmentEvidence >= 55 },
    { label: "Confidence building", met: quality.dimensionScores.confidenceBuilding >= 55 },
  ];

  return {
    score: quality.score,
    band: quality.band,
    checks,
    warnings: quality.warnings,
    recommendations: quality.practicalFixes,
  };
}

export function buildPrimaryPEQualityInsights(lesson: LessonBuilderFormData): PrimaryPEQualityInsight[] {
  if (!isPrimaryPEYearGroup(lesson.yearGroup)) return [];

  const review = buildPrimaryPEQualityReview(lesson);
  const insights: PrimaryPEQualityInsight[] = [];

  insights.push({
    id: "primary-pe-review",
    area: "Primary PE Review",
    message: `${review.band} primary PE design (${review.score}/100)`,
    prompt: review.checks.filter((c) => !c.met).map((c) => c.label).join("; ") || "Core checks met",
    entryId: "primary-pe-master",
  });

  for (const w of review.warnings.slice(0, 2)) {
    const fix = PRIMARY_PE_WARNINGS.find((x) => x.warning === w);
    insights.push({
      id: `primary-${w.slice(0, 12)}`,
      area: "Primary PE",
      message: w,
      prompt: fix?.whyItMatters,
      entryId: "primary-pe-master",
      fix: fix
        ? {
            target: w.includes("inclusion") ? "differentiation" : w.includes("FMS") || w.includes("focus") ? "successCriteria" : "reflectionNotes",
            text: fix.suggestedFix,
            actionLabel: "Apply fix",
          }
        : undefined,
    });
  }

  return insights;
}

export function buildSchemePrimaryPETips(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup">
): string[] {
  if (!isPrimaryPEYearGroup(scheme.yearGroup)) return [];
  const lessons = scheme.lessons;
  if (lessons.length === 0) return [];

  const progression = buildPrimarySkillProgression({
    yearGroup: scheme.yearGroup,
    walt: lessons[0]?.walt,
    activities: lessons.map((l) => l.activities).join(" "),
  });

  const tips: string[] = [
    `FMS progression: ${progression.progressionSequence.map((p) => p.stage).join(" → ")}`,
    `Movement concept progression: space → body → effort → relationships across lessons`,
    `Lesson arc: ${progression.skill} — ${progression.progressionSequence[2]?.description ?? "refine skill"}`,
    "Assessment checkpoints: observe at practise and apply stages each lesson",
    "Confidence progression: explore without pressure → partner feedback → simple game success",
  ];

  if (lessons.length >= 4) {
    tips.push(`By lesson ${Math.min(lessons.length, 5)}: combine skills in application game`);
  }

  return tips.slice(0, 5);
}
