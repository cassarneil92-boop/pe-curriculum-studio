/**
 * TPSR Master Pack v1 — Teaching Personal and Social Responsibility.
 * Original educational content — not copied from copyrighted sources.
 */

import type { PEKnowledgeEntry } from "./types";

export type TPSRLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type TPSRQuestionAgeBand = "primary" | "lower-secondary" | "upper-secondary" | "alp";

export interface TPSRLevelDefinition {
  level: TPSRLevel;
  name: string;
  meaning: string;
  teacherIndicators: string[];
  pupilIndicators: string[];
  peExamples: string[];
  coachingExamples: string[];
  commonMistakes: string[];
  planningPrompts: string[];
  reflectionPrompts: string[];
  assessmentEvidence: string[];
  ageAdaptations: string[];
  maltaRelevance: string[];
}

export interface TPSRWarning {
  id: string;
  warning: string;
  whyItMatters: string;
  suggestedFix: string;
  teacherPrompt: string;
}

export const TPSR_CORE_MESSAGE =
  "PE can develop personal and social responsibility — respect, effort, self direction, helping others, leadership, and transfer beyond the lesson.";

export const TPSR_FRAMEWORK: TPSRLevelDefinition[] = [
  {
    level: 0,
    name: "Irresponsibility",
    meaning: "Pupils do not yet take responsibility for self, others, or learning — often through disengagement, disrespect, or dependence.",
    teacherIndicators: ["Frequent off-task behaviour", "Blame external factors", "No ownership language"],
    pupilIndicators: ["Refuses to try", "Disrupts others", "Waits to be told everything"],
    peExamples: ["Walking away from task", "Arguing with officials or peers"],
    coachingExamples: ["Ignoring safety rules", "No recovery after mistake"],
    commonMistakes: ["Punishment without teaching responsibility", "Public humiliation"],
    planningPrompts: ["What minimum respect rule must be clear before activity?", "How will you invite re-entry without shame?"],
    reflectionPrompts: ["What stopped you taking responsibility today?", "What would help next time?"],
    assessmentEvidence: ["Willingness to re-engage after reset", "Follows one agreed norm"],
    ageAdaptations: ["Primary: one simple rule with visual cue", "Secondary: private conversation and clear choice"],
    maltaRelevance: ["Supports positive behaviour in mixed Maltese class groups", "Aligns with college pastoral expectations"],
  },
  {
    level: 1,
    name: "Respect and self control",
    meaning: "Pupils show respect for self, others, equipment, and rules — managing impulses during activity.",
    teacherIndicators: ["Clear respect norms", "Calm correction", "Praise specific respectful acts"],
    pupilIndicators: ["Accepts decisions", "Uses equipment safely", "Speaks respectfully under pressure"],
    peExamples: ["Fair play in games", "Safe gymnastics spacing", "Listening during demos"],
    coachingExamples: ["Respect opponents and referee decisions in football", "Safe shared equipment use in fitness"],
    commonMistakes: ["Respect expected but not taught", "Only punishing disrespect"],
    planningPrompts: ["Which respect behaviour is today's focus?", "How will pupils show self control?"],
    reflectionPrompts: ["How did you show respect today?", "When was self control difficult?"],
    assessmentEvidence: ["Observed respectful behaviour", "Self-control under competition"],
    ageAdaptations: ["Primary: respect handshake or thank-you routine", "Secondary: discuss respect in competition"],
    maltaRelevance: ["Essential in hall rotation and shared yards", "Supports inclusive mixed-gender PE"],
  },
  {
    level: 2,
    name: "Participation and effort",
    meaning: "Pupils engage fully and persist — trying even when tasks are challenging.",
    teacherIndicators: ["Effort criteria in WILF", "Personal best not rank", "Encourages persistence"],
    pupilIndicators: ["Stays involved", "Recovers after error", "Praises own effort honestly"],
    peExamples: ["Recovery runs in invasion games", "Repeated practice in gymnastics"],
    coachingExamples: ["Personal effort target in fitness", "Keep going in conditioned games"],
    commonMistakes: ["Effort praised vaguely (good job only)", "Only ablest pupils praised"],
    planningPrompts: ["How will every pupil show effort in first 5 minutes?", "What defines good effort today?"],
    reflectionPrompts: ["Where did you keep going even when it was hard?", "What helped you stay involved?"],
    assessmentEvidence: ["Effort self-rating", "Teacher observes sustained engagement"],
    ageAdaptations: ["Primary: effort stars or tokens", "Secondary: effort vs outcome discussion"],
    maltaRelevance: ["Builds engagement in compulsory PE", "Supports pupils who avoid activity"],
  },
  {
    level: 3,
    name: "Self direction",
    meaning: "Pupils make decisions, set challenges, and manage their own learning with decreasing teacher control.",
    teacherIndicators: ["Offers choices", "Pupils plan own challenge", "Teacher coaches not commands"],
    pupilIndicators: ["Selects level of challenge", "Self-corrects", "Works without constant prompting"],
    peExamples: ["Self managed tactical challenge", "Personal sequence design in gymnastics"],
    coachingExamples: ["Self selected fitness challenge", "Choose role in modified game"],
    commonMistakes: ["Teacher controls everything", "Choice without structure"],
    planningPrompts: ["What decision will pupils make today?", "How will self direction be visible?"],
    reflectionPrompts: ["What decision did you make for your own learning?", "What did you do without needing the teacher?"],
    assessmentEvidence: ["Pupil explains own choice", "Self-selected challenge met"],
    ageAdaptations: ["Primary: choose from two options", "Secondary: design own practice plan"],
    maltaRelevance: ["Prepares for option and ALP pathways", "Builds independence in large classes"],
  },
  {
    level: 4,
    name: "Helping others and leadership",
    meaning: "Pupils support teammates, lead moments, and take responsibility for group success.",
    teacherIndicators: ["Assigns leadership roles", "Teaches how to help", "Celebrates support acts"],
    pupilIndicators: ["Encourages peers", "Captain supports weaker learner", "Gives helpful feedback"],
    peExamples: ["Peer spotting in gymnastics", "Captain organises team in football"],
    coachingExamples: ["Partner encouragement in fitness", "Inclusion champion role"],
    commonMistakes: ["Only strongest pupils lead", "Helping others not taught"],
    planningPrompts: ["Who will lead and who will support today?", "How will helping be recognised?"],
    reflectionPrompts: ["Who did you help today?", "How did you make someone else better?"],
    assessmentEvidence: ["Specific peer support observed", "Leadership role fulfilled"],
    ageAdaptations: ["Primary: helper of the day", "Secondary: rotating captain with brief"],
    maltaRelevance: ["Supports LSA and peer support models", "Builds team culture in sport units"],
  },
  {
    level: 5,
    name: "Transfer beyond PE",
    meaning: "Pupils connect responsibility learned in PE to life outside the lesson.",
    teacherIndicators: ["Asks transfer questions", "Links to home, class, community"],
    pupilIndicators: ["Names life application", "Sets habit or behaviour goal beyond PE"],
    peExamples: ["Teamwork linked to family or club", "Effort habit for weekend activity"],
    coachingExamples: ["Connect respect in games to classroom", "Personal activity habit beyond school"],
    commonMistakes: ["No transfer question", "Responsibility stays in gym only"],
    planningPrompts: ["Where outside PE could today's focus matter?", "What habit could pupils try this week?"],
    reflectionPrompts: ["Where outside PE could this responsibility matter?", "How could you use this tomorrow?"],
    assessmentEvidence: ["Pupil names transfer example", "Goal for outside school stated"],
    ageAdaptations: ["Primary: one home or playground example", "Secondary: link to club, class, or community"],
    maltaRelevance: ["Connects to Maltese community sport and active life", "Supports whole-school values"],
  },
];

export const TPSR_QUESTION_BANK = {
  respect: {
    primary: ["How did you show respect today?", "When was self control difficult?"],
    "lower-secondary": ["How did you show respect today?", "When was self control difficult?"],
    "upper-secondary": ["How did respect affect fair play?", "When did you manage emotions under pressure?"],
    alp: ["How did respect support safe vocational practice?", "What professional behaviour did you show?"],
  },
  effort: {
    primary: ["Where did you try hard?", "What helped you keep going?"],
    "lower-secondary": ["Where did you keep going even when it was hard?", "What helped you stay involved?"],
    "upper-secondary": ["How did effort compare to outcome?", "What would increase your effort next time?"],
    alp: ["How did sustained effort affect performance?", "What effort standard do you expect of yourself?"],
  },
  selfDirection: {
    primary: ["What choice did you make?", "What did you try on your own?"],
    "lower-secondary": ["What decision did you make for your own learning?", "What did you do without needing the teacher?"],
    "upper-secondary": ["How did you self-regulate challenge?", "What would you plan differently?"],
    alp: ["How did you manage your own practice?", "What independent goal did you set?"],
  },
  helpingLeadership: {
    primary: ["Who did you help?", "How were you a good teammate?"],
    "lower-secondary": ["Who did you help today?", "How did you make someone else better?"],
    "upper-secondary": ["How did leadership affect the group?", "What support did you offer under pressure?"],
    alp: ["How did you support a peer's learning?", "What leadership moment did you take?"],
  },
  transfer: {
    primary: ["Where else could you be respectful?", "How could you try hard at home?"],
    "lower-secondary": ["Where outside PE could this responsibility matter?", "How could you use this tomorrow?"],
    "upper-secondary": ["How does today's learning transfer to class, sport, or community?", "What habit will you continue?"],
    alp: ["How does responsibility in PE transfer to work or training?", "What will you apply outside this session?"],
  },
};

export const TPSR_WARNINGS: TPSRWarning[] = [
  { id: "behaviour-only", warning: "Responsibility treated as behaviour control only", whyItMatters: "TPSR develops character through learning, not compliance alone.", suggestedFix: "Link respect to learning goal, not only rules.", teacherPrompt: "Today we learn respect because it helps us…" },
  { id: "respect-not-taught", warning: "Respect expected but not taught", whyItMatters: "Pupils cannot show respect they have not practised.", suggestedFix: "Brief awareness talk before activity.", teacherPrompt: "What does respect look like in this game?" },
  { id: "vague-effort", warning: "Effort praised vaguely", whyItMatters: "Vague praise does not build responsibility.", suggestedFix: "Praise specific effort: recovery run, second attempt.", teacherPrompt: "I noticed you kept going after…" },
  { id: "no-choice", warning: "No student choice", whyItMatters: "Self direction cannot develop without decision opportunities.", suggestedFix: "Offer one meaningful choice in challenge level or role.", teacherPrompt: "Choose your challenge: support, core, or extend." },
  { id: "no-leadership", warning: "No leadership opportunities", whyItMatters: "Level 4 responsibility requires structured leadership.", suggestedFix: "Assign captain, helper, or coach role with brief.", teacherPrompt: "Your job as captain is to…" },
  { id: "no-helping", warning: "No helping others focus", whyItMatters: "Social responsibility includes supporting peers.", suggestedFix: "Add peer encouragement or spotting requirement.", teacherPrompt: "Before you finish, help one teammate with…" },
  { id: "no-reflection", warning: "No reflection on responsibility", whyItMatters: "Reflection consolidates responsibility learning.", suggestedFix: "One exit question linked to today's level focus.", teacherPrompt: "What responsibility did you show today?" },
  { id: "no-transfer", warning: "No transfer beyond PE", whyItMatters: "Level 5 connects PE to life — without it, learning stays isolated.", suggestedFix: "Add transfer question in plenary.", teacherPrompt: "Where outside PE could this matter?" },
  { id: "teacher-dominates", warning: "Teacher dominates responsibility discussion", whyItMatters: "Pupils must own reflection for internalisation.", suggestedFix: "Ask pupils first — wait before adding your view.", teacherPrompt: "What did you notice? (pause)" },
  { id: "punishment", warning: "Punishment replaces learning", whyItMatters: "Fear reduces engagement and honest reflection.", suggestedFix: "Restorative conversation and re-entry plan.", teacherPrompt: "What will you do differently next time?" },
];

export const TPSR_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "tpsr-master",
  title: "TPSR — Personal and Social Responsibility",
  category: "pedagogy-model",
  summary: TPSR_CORE_MESSAGE,
  keyPrinciples: TPSR_FRAMEWORK.filter((l) => l.level > 0).map((l) => l.name),
  whyItMattersInPE:
    "PE develops respect, effort, self direction, leadership, and transfer — not only physical performance.",
  whenToUse: [
    "Behaviour and values focus units",
    "Mixed ability and inclusion contexts",
    "Scheme progression for social responsibility",
    "ALP and vocational PE pathways",
  ],
  commonMistakes: TPSR_WARNINGS.slice(0, 5).map((w) => w.warning),
  practicalApplications: TPSR_FRAMEWORK.slice(1, 4).map((l) => `${l.name}: ${l.peExamples[0]}`),
  lessonPlanningPrompts: TPSR_FRAMEWORK.flatMap((l) => l.planningPrompts).slice(0, 6),
  assessmentPrompts: TPSR_FRAMEWORK.flatMap((l) => l.assessmentEvidence).slice(0, 4),
  differentiationPrompts: [
    "Level 1 respect focus for pupils needing structure",
    "Level 3 choice for pupils ready for self direction",
    "Level 4 helper role for confident pupils",
  ],
  agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
  pathwayRelevance: ["all", "alp-pe", "sport-values"],
  relatedModels: ["cooperative-learning", "physical-literacy-overview", "movement-confidence"],
  tags: ["tpsr", "responsibility", "respect", "effort", "leadership", "transfer", "values", "behaviour"],
};

export function getTPSRLevelDefinition(level: TPSRLevel): TPSRLevelDefinition | undefined {
  return TPSR_FRAMEWORK.find((l) => l.level === level);
}

export function yearGroupToTPSRQuestionBand(yearGroup?: string, pathway?: string): TPSRQuestionAgeBand {
  if (pathway && /alp|vocational/i.test(pathway)) return "alp";
  if (!yearGroup) return "lower-secondary";
  const y = yearGroup.toLowerCase();
  if (/year-[1-6]|primary|ks2/i.test(y)) return "primary";
  if (/year-[7-9]|year-10|lower|ks3/i.test(y)) return "lower-secondary";
  return "upper-secondary";
}

export function getTPSRQuestions(ageBand: TPSRQuestionAgeBand, count = 3): string[] {
  const bank = TPSR_QUESTION_BANK;
  return [
    bank.respect[ageBand][0],
    bank.effort[ageBand][0],
    bank.transfer[ageBand][0],
    bank.selfDirection[ageBand][0],
    bank.helpingLeadership[ageBand][0],
  ].slice(0, count);
}

export function isTPSRRelevant(text: string): boolean {
  return /\b(respect|responsib|effort|leadership|behavio|values|character|self.?direction|transfer|fair play|teamwork|captain|help others|social)\b/i.test(
    text
  );
}

export const ACTIVITY_EMBEDDING_HINTS: Record<string, Partial<Record<TPSRLevel, string>>> = {
  football: {
    1: "Respect opponents and accept decisions calmly",
    2: "Effort in recovery runs and off-ball movement",
    3: "Self managed tactical challenge in small-sided game",
    4: "Captain supports weaker learner with encouragement",
    5: "Connect teamwork to club or community sport",
  },
  fitness: {
    1: "Safe shared use of equipment and space",
    2: "Personal effort target against own baseline",
    3: "Self selected challenge level",
    4: "Partner encouragement and honest feedback",
    5: "Personal activity habit beyond school",
  },
  gymnastics: {
    1: "Respect space boundaries and safety rules",
    2: "Effort in repeated quality practice",
    3: "Personal sequence design",
    4: "Peer support and responsible spotting",
    5: "Confidence transfer to other challenging contexts",
  },
};
