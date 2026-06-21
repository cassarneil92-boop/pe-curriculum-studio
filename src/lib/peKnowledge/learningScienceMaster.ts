/**
 * Learning Science Master Pack v1 — evidence-informed learning principles for PE.
 * Original educational content — not copied from copyrighted sources.
 */

import type { PEKnowledgeEntry } from "./types";

export type LSAgeBand = "early-years" | "primary" | "lower-secondary" | "upper-secondary" | "alp";

export interface LearningSciencePrinciple {
  id: string;
  name: string;
  definition: string;
  whyItMattersInPE: string;
  primaryExamples: string[];
  secondaryExamples: string[];
  coachingExamples: string[];
  commonMistakes: string[];
  planningPrompts: string[];
  assessmentOpportunities: string[];
  differentiationConsiderations: string[];
  maltaRelevance: string[];
}

export interface LearningScienceWarning {
  id: string;
  warning: string;
  whyItMatters: string;
  suggestedFix: string;
  teacherPrompt: string;
}

export const LEARNING_SCIENCE_CORE_MESSAGE =
  "Durable PE learning requires retrieval, spacing, variation, and transfer — not just delivery in one lesson.";

function principle(
  id: string,
  name: string,
  definition: string,
  whyPE: string,
  primary: string[],
  secondary: string[],
  coaching: string[],
  mistakes: string[],
  prompts: string[],
  assessment: string[],
  diff: string[],
  malta: string[]
): LearningSciencePrinciple {
  return {
    id,
    name,
    definition,
    whyItMattersInPE: whyPE,
    primaryExamples: primary,
    secondaryExamples: secondary,
    coachingExamples: coaching,
    commonMistakes: mistakes,
    planningPrompts: prompts,
    assessmentOpportunities: assessment,
    differentiationConsiderations: diff,
    maltaRelevance: malta,
  };
}

export const LEARNING_SCIENCE_FRAMEWORK: LearningSciencePrinciple[] = [
  principle(
    "retrieval-practice",
    "Retrieval practice",
    "Actively recalling prior learning strengthens memory and application.",
    "Pupils who only repeat movement without recall often forget cues and tactics between lessons.",
    ["Starter: name last lesson's throw cue", "Partner recall of safety rule"],
    ["Exit question on tactical decision", "Recall WILF before application game"],
    ["Quick cue quiz before conditioned game", "Tactical recall pause mid-lesson"],
    ["Re-explaining everything each lesson", "Retrieval only as high-stakes test"],
    ["What must pupils retrieve from last lesson?", "Where is a 2-minute recall moment?"],
    ["Verbal recall matched to demo", "Exit ticket on one learning point"],
    ["Visual cue cards for recall support", "Pair confident recallers with peers"],
    ["Supports spaced curriculum in Maltese primary and secondary PE"]
  ),
  principle(
    "spaced-practice",
    "Spaced practice",
    "Revisiting learning across multiple sessions builds durable memory.",
    "One-off skill teaching rarely produces lasting change in PE.",
    ["Revisit throw in lesson 1, 3, and 5", "Return to balance each week"],
    ["Spiral tactical ideas across unit", "Prior unit skill in warm-up"],
    ["Scheme plan: introduce, revisit, assess in game", "5-minute scheme non-negotiable each lesson"],
    ["Teach once and move on", "Spacing without purposeful retrieval"],
    ["When will this appear again in three lessons?", "What links to last unit?"],
    ["Delayed performance check in lesson 4", "Compare to lesson 1 baseline"],
    ["Short revisit for SEND pupils", "Extra spacing for fragile skills"],
    ["Fits Malta term structure and limited lesson blocks"]
  ),
  principle(
    "interleaving",
    "Interleaving",
    "Mixing related but distinct skills improves flexible application.",
    "Blocked practice can look good in lesson but fail in unpredictable games.",
    ["Alternate hop and jump stations", "Mix pass and move tasks"],
    ["Interleave attack and defence decisions", "Throw for distance then accuracy"],
    ["Rotate two tactical problems in one session", "Mixed skill circuit"],
    ["One skill blocked all lesson", "Predictable drill only"],
    ["Which two skills can be mixed today?", "How will order change demand?"],
    ["Performance in mixed order vs blocked order", "Tactical choice under variation"],
    ["Reduce interleave count for younger pupils", "Clear station labels"],
    ["Useful in mixed-ability Maltese class rotations"]
  ),
  principle(
    "varied-practice",
    "Varied practice",
    "Changing context, space, speed, and constraints builds adaptable performance.",
    "Identical repetition builds fluency in one context but weak transfer.",
    ["Throw to near then far target", "Run at different speeds"],
    ["Different opponents or defenders", "Varied equipment size"],
    ["Change space size each round", "Alter rules to force new decisions"],
    ["Same drill every week unchanged", "No adaptation demand"],
    ["What will vary: space, speed, or opponent?", "How does variation link to game?"],
    ["Success across two different contexts", "Adaptation when constraint changes"],
    ["Reduce variation for anxious pupils first", "Gradual variation ladder"],
    ["Hall and yard constraints need planned variation"]
  ),
  principle(
    "desirable-difficulty",
    "Desirable difficulty",
    "Challenge that is hard enough to require effort but not so hard it causes shutdown.",
    "Too easy creates illusion of knowing; too hard reduces engagement and learning.",
    ["Challenge level choice boards", "Slightly smaller target"],
    ["Timed decision with thinking demand", "Opponent adds pressure gradually"],
    ["Success rate around 70–80% in practice", "Scaffold then fade support"],
    ["Always easy success", "Challenge without support"],
    ["Is task too easy, productive, or too hard?", "What scaffold if pupils struggle?"],
    ["Observe frustration vs engagement", "Personal best under challenge"],
    ["Easier pathway with same intention", "Extend without ranking publicly"],
    ["Mixed ability Maltese classes need careful difficulty calibration"]
  ),
  principle(
    "elaboration",
    "Elaboration",
    "Explaining why and how deepens understanding and memory.",
    "Physical performance without explanation limits transfer and self-correction.",
    ["Why did bending knees help your jump?", "When would you use this pass?"],
    ["How does effort link to improvement?", "Connect to last lesson explicitly"],
    ["Pair explain tactic before demo", "Why did feedback change performance?"],
    ["Only teacher explains", "No pupil-generated explanations"],
    ["What why question will pupils answer?", "Where can pupils teach a partner?"],
    ["Pupil explains cue in own words", "Links two lessons verbally"],
    ["Sentence starters for EAL pupils", "Draw-then-explain for reluctant speakers"],
    ["Supports bilingual elaboration in Maltese schools"]
  ),
  principle(
    "reflection",
    "Reflection",
    "Structured review consolidates learning and plans next steps.",
    "Reflection turns experience into retrievable learning.",
    ["What improved today?", "One thing to remember"],
    ["Compare to personal target", "What would you do differently?"],
    ["Link reflection to WILF", "Short written or verbal exit"],
    ["No plenary", "Teacher-dominated reflection only"],
    ["What will pupils reflect on in 2 minutes?", "How is reflection linked to WILF?"],
    ["Reflection matched to learning intention", "Target for next lesson"],
    ["Visual reflection prompts", "Partner reflection first"],
    ["Brief reflection fits short Maltese PE slots"]
  ),
  principle(
    "feedback",
    "Feedback",
    "Information that closes the gap between current and intended performance.",
    "Without feedback, pupils repeat errors and misjudge progress.",
    ["One specific cue feedback", "Partner feedback on one point"],
    ["Compare to video or demo", "Immediate feedback in practice"],
    ["Feedback on process not just outcome", "Feed-forward for next attempt"],
    ["Vague good job only", "Too much feedback at once"],
    ["What one thing will you feedback?", "Is feedback against WILF?"],
    ["Pupil acts on feedback in same lesson", "Self-assessment against WILF"],
    ["Private feedback for anxious pupils", "Written feedback for EAL"],
    ["Aligns with Teaching for Learning layer"]
  ),
  principle(
    "calibration",
    "Calibration",
    "Pupils accurately judge what they know and can do.",
    "Misjudged confidence leads to poor effort and surprise failure later.",
    ["Self-rate then demo", "Predict score then attempt"],
    ["Peer check against WILF", "Reality check after easy drill"],
    ["Compare perceived vs actual success", "Quick self-check before exit"],
    ["Easy drill mistaken for mastery", "No self-check"],
    ["How will pupils check their learning?", "Does task difficulty match claim?"],
    ["Calibration gap noted by teacher", "Self-assessment accuracy"],
    ["Supported self-check with visuals", "Private calibration for low confidence"],
    ["Builds honest assessment culture in PE"]
  ),
  principle(
    "transfer",
    "Transfer",
    "Applying learning in new contexts, activities, or life beyond the lesson.",
    "Learning that stays in one drill does not justify curriculum time.",
    ["Use throw in new game", "Balance on different apparatus"],
    ["Tactic from unit A in unit B", "Health habit beyond school"],
    ["Where else does this skill apply?", "Link to another sport"],
    ["No transfer question", "Same context only"],
    ["Where else could this learning matter?", "What new context tests transfer?"],
    ["Performance in novel task", "Pupil names transfer example"],
    ["Simplified transfer task for SEND", "Optional home challenge"],
    ["Connect to Maltese community sport and active life"]
  ),
  principle(
    "illusion-of-knowing",
    "Avoiding illusion of knowing",
    "Recognising when performance feels easy but learning is fragile.",
    "Fluency in predictable drills is often mistaken for mastery.",
    ["Change context after success", "Retrieval without demo first"],
    ["Self-check after blocked practice", "Harder variation probe"],
    ["Mix skills to test real learning", "Delayed recall check"],
    ["Repeated identical drill only", "Celebrate easy success as finished"],
    ["Could pupils do this in a new context?", "What probe tests real learning?"],
    ["Performance when task changes", "Delayed recall"],
    ["Gentle challenge increase", "Private teacher note on fragile learning"],
    ["Important before high-stakes primary or secondary assessment"]
  ),
  principle(
    "prior-knowledge",
    "Prior knowledge connection",
    "Linking new learning to what pupils already know accelerates understanding.",
    "New skills build on prior movement and tactical experience.",
    ["Remember how we landed safely last week", "Like passing in netball but…"],
    ["Connect invasion tactic to prior unit", "Build on Year 4 throwing"],
    ["Activate prior knowledge in starter", "Compare old and new cue"],
    ["Assume no prior knowledge", "No link to previous unit"],
    ["What do pupils already know that helps?", "How will you activate it?"],
    ["Pupil makes connection verbally", "Uses prior cue in new task"],
    ["Pre-teach vocabulary if needed", "Bridge from simpler prior skill"],
    ["Malta spiral curriculum across year groups"]
  ),
  principle(
    "generation",
    "Generation before instruction",
    "Attempting problem-solving before full instruction deepens learning when scaffolded.",
    "Discovery before explanation can build ownership and memory.",
    ["Try to solve tactical problem first", "Explore balance before teaching cue"],
    ["Predict what will happen", "Trial throw before coaching points"],
    ["Guided discovery with constraints", "Movement challenge before demo"],
    ["Teacher explains everything first", "No exploration time"],
    ["What will pupils try before you explain?", "What constraint guides discovery?"],
    ["Pupil attempt informs teaching", "Compare before and after instruction"],
    ["Structured exploration for SEND", "Short exploration with clear goal"],
    ["Balances discovery with safe primary PE organisation"]
  ),
];

export const PE_RETRIEVAL_PROMPT_BANK = {
  movementSkills: {
    "early-years": ["What helped you balance?", "Show me how you throw softly."],
    primary: ["What cue helped your throw last lesson?", "What body position helped your balance?"],
    "lower-secondary": ["Which coaching point improved your technique?", "What changed in your run-up?"],
    "upper-secondary": ["Which biomechanical cue did you apply?", "How did technique affect accuracy?"],
    alp: ["Which performance cue did you apply in practice?", "What technical focus improved output?"],
  },
  games: {
    "early-years": ["Where is the space?", "When do you stop?"],
    primary: ["What tactical problem did we solve last time?", "When should you pass instead of dribble?"],
    "lower-secondary": ["What decision did you make under pressure?", "When is support more important than score?"],
    "upper-secondary": ["How did tactical choice affect outcome?", "When would you switch play?"],
    alp: ["What tactical adjustment improved team performance?", "When should you slow the tempo?"],
  },
  fitness: {
    "early-years": ["Did you move fast or slow?", "How did your body feel?"],
    primary: ["What does intensity mean?", "How can you tell if activity is challenging enough?"],
    "lower-secondary": ["What is the difference between aerobic and sprint effort?", "How did you monitor effort?"],
    "upper-secondary": ["How did training principle apply today?", "How would you adjust workload?"],
    alp: ["Which training variable did you manipulate?", "How did effort relate to performance goal?"],
  },
  safety: {
    "early-years": ["How do we use space safely?", "What do we check first?"],
    primary: ["What safety rule matters today?", "What should you check before using equipment?"],
    "lower-secondary": ["What risk did we identify?", "How does spacing reduce collision risk?"],
    "upper-secondary": ["What safety protocol applies in this activity?", "How do you assess risk before action?"],
    alp: ["What professional safety standard applies?", "How do you verify equipment before use?"],
  },
  responsibility: {
    "early-years": ["How were you kind to your partner?", "Did you try hard?"],
    primary: ["What did effort look like last lesson?", "How did your group show respect last time?"],
    "lower-secondary": ["What responsibility did you show last week?", "How did you support a teammate?"],
    "upper-secondary": ["How did leadership affect group learning?", "What standard will you hold yourself to?"],
    alp: ["How did professional behaviour support the group?", "What responsibility transfers to work settings?"],
  },
};

export const LEARNING_SCIENCE_WARNINGS: LearningScienceWarning[] = [
  { id: "no-retrieval", warning: "No retrieval practice", whyItMatters: "Without recall, learning fades between lessons.", suggestedFix: "Add starter retrieval question from last lesson.", teacherPrompt: "Before we start — what do you remember about…?" },
  { id: "no-spacing", warning: "No spacing across lessons", whyItMatters: "One-off teaching rarely produces durable learning.", suggestedFix: "Plan revisit in lesson 3 and 5 of scheme.", teacherPrompt: "We saw this in lesson 1 — show me again." },
  { id: "blocked", warning: "Practice too blocked", whyItMatters: "Blocked practice may not transfer to game contexts.", suggestedFix: "Mix two related skills in same session.", teacherPrompt: "Now switch — pass then move, not pass only." },
  { id: "too-easy", warning: "Task too easy", whyItMatters: "Easy success creates illusion of mastery.", suggestedFix: "Add constraint, opponent, or smaller target.", teacherPrompt: "Same skill — harder challenge now." },
  { id: "too-hard", warning: "Task too hard", whyItMatters: "Excessive difficulty shuts down learning and effort.", suggestedFix: "Scaffold with larger target or fewer rules.", teacherPrompt: "Try the support level first — then extend." },
  { id: "answers-early", warning: "Teacher gives answers too early", whyItMatters: "Generation before instruction builds deeper memory.", suggestedFix: "2-minute explore or predict before explain.", teacherPrompt: "Try it first — what do you notice?" },
  { id: "no-elaboration", warning: "No elaboration", whyItMatters: "Without why, pupils cannot self-correct or transfer.", suggestedFix: "Add one why or when question in plenary.", teacherPrompt: "Why did that work? When would you use it?" },
  { id: "no-transfer", warning: "No transfer link", whyItMatters: "Learning isolated to one drill wastes curriculum time.", suggestedFix: "Name one other context or sport link.", teacherPrompt: "Where else could this skill matter?" },
  { id: "no-self-check", warning: "No self check", whyItMatters: "Pupils may misjudge what they have learned.", suggestedFix: "Quick self-rate against WILF before exit.", teacherPrompt: "Did you meet WILF? What evidence?" },
  { id: "fluency-mastery", warning: "Fluency mistaken for mastery", whyItMatters: "Predictable drill fluency is not real mastery.", suggestedFix: "Change space or add decision demand.", teacherPrompt: "Same skill — new context. Still successful?" },
];

export const LEARNING_SCIENCE_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "learning-science-master",
  title: "Learning Science for PE",
  category: "learning-science",
  summary: LEARNING_SCIENCE_CORE_MESSAGE,
  keyPrinciples: LEARNING_SCIENCE_FRAMEWORK.map((p) => p.name),
  whyItMattersInPE: "PE learning must be remembered, retrieved, and transferred — not only performed once in class.",
  whenToUse: [
    "All lesson and scheme planning",
    "Assessment and plenary design",
    "Scheme spacing and revisiting",
    "Prior knowledge and retrieval starters",
  ],
  commonMistakes: LEARNING_SCIENCE_WARNINGS.slice(0, 5).map((w) => w.warning),
  practicalApplications: LEARNING_SCIENCE_FRAMEWORK.slice(0, 4).map((p) => `${p.name}: ${p.coachingExamples[0]}`),
  lessonPlanningPrompts: LEARNING_SCIENCE_FRAMEWORK.flatMap((p) => p.planningPrompts).slice(0, 6),
  assessmentPrompts: LEARNING_SCIENCE_FRAMEWORK.flatMap((p) => p.assessmentOpportunities).slice(0, 4),
  differentiationPrompts: LEARNING_SCIENCE_FRAMEWORK.flatMap((p) => p.differentiationConsiderations).slice(0, 4),
  agePhaseRelevance: ["early-years", "primary", "middle-school", "secondary", "all"],
  pathwayRelevance: ["all", "alp-pe"],
  relatedModels: ["teaching-for-learning-master", "spaced-practice", "retrieval-practice", "desirable-difficulties"],
  tags: ["learning-science", "retrieval", "spacing", "interleaving", "transfer", "memory", "calibration"],
};

export function yearGroupToLSAgeBand(yearGroup?: string, pathway?: string): LSAgeBand {
  if (pathway && /alp|vocational/i.test(pathway)) return "alp";
  if (!yearGroup) return "lower-secondary";
  const y = yearGroup.toLowerCase();
  if (/early|kg|year-1|year-2/i.test(y)) return "early-years";
  if (/year-[3-6]|primary/i.test(y)) return "primary";
  if (/year-[7-9]|year-10/i.test(y)) return "lower-secondary";
  return "upper-secondary";
}

export function getRetrievalPrompts(ageBand: LSAgeBand, count = 3): string[] {
  const bank = PE_RETRIEVAL_PROMPT_BANK;
  return [
    bank.movementSkills[ageBand][0],
    bank.games[ageBand][0],
    bank.safety[ageBand][0],
    bank.fitness[ageBand][0],
    bank.responsibility[ageBand][0],
  ].slice(0, count);
}

export function isLearningScienceRelevant(text: string): boolean {
  return /\b(retriev|spac|interleav|transfer|memory|recall|revisit|practice|progression|scheme|prior|reflect|elaborat|difficult|calibrat)\b/i.test(
    text
  );
}

export function getLearningSciencePrinciple(id: string): LearningSciencePrinciple | undefined {
  return LEARNING_SCIENCE_FRAMEWORK.find((p) => p.id === id);
}
