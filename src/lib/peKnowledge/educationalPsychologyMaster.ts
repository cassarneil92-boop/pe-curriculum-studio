/**
 * Educational Psychology Master Pack v1 — original content for PE Curriculum Studio.
 */

import type { PEKnowledgeEntry } from "./types";

export interface EducationalPsychologyDomain {
  id: string;
  name: string;
  definition: string;
  whyItMatters: string;
  peRelevance: string;
  primaryExamples: string[];
  secondaryExamples: string[];
  coachingExamples: string[];
  planningPrompts: string[];
  assessmentOpportunities: string[];
  commonMistakes: string[];
  differentiationImplications: string[];
}

export interface EducationalPsychologyWarning {
  id: string;
  warning: string;
  whyItMatters: string;
  suggestedFix: string;
  teacherPrompt: string;
}

export const EDUCATIONAL_PSYCHOLOGY_CORE_MESSAGE =
  "Effective PE design respects how memory, attention, and motivation work — not only what to teach.";

function domain(
  id: string,
  name: string,
  definition: string,
  why: string,
  pe: string,
  primary: string[],
  secondary: string[],
  coaching: string[],
  prompts: string[],
  assessment: string[],
  mistakes: string[],
  diff: string[]
): EducationalPsychologyDomain {
  return {
    id,
    name,
    definition,
    whyItMatters: why,
    peRelevance: pe,
    primaryExamples: primary,
    secondaryExamples: secondary,
    coachingExamples: coaching,
    planningPrompts: prompts,
    assessmentOpportunities: assessment,
    commonMistakes: mistakes,
    differentiationImplications: diff,
  };
}

export const EDUCATIONAL_PSYCHOLOGY_FRAMEWORK: EducationalPsychologyDomain[] = [
  domain("memory", "Memory", "Working memory holds immediate information; long-term memory stores durable learning.", "PE must move learning from short performance to retrievable knowledge.", "Cues and tactics forgotten without memory support.", ["One cue per activity block", "Repeat key phrase across lesson"], ["Spaced recall across unit", "Link demo to verbal cue"], ["Exit recall of coaching point", "Starter: show last week's skill"], ["What must be remembered after this lesson?", "Where is recall built in?"], ["Recall without demo", "Delayed performance check"], ["Too much new content at once", "No revisit"], ["Visual memory aids", "Shorter verbal load for EAL"]),
  domain("cognitive-load", "Cognitive Load", "Mental effort is limited — intrinsic, extraneous, and germane load must be balanced.", "Overload stops learning; underload wastes time.", "Too many rules, cues, and transitions in one lesson.", ["One rule at a time", "Clear station labels"], ["Reduce talk — show then do", "Remove unnecessary equipment clutter"], ["Fade from guided to independent", "Constraint-led games"], ["What can be removed without losing learning?", "Is talk extraneous?"], ["Observe confusion vs engagement", "Success under simplified version"], ["Five coaching points at once", "Complex instructions while moving"], ["Fewer simultaneous demands for SEND", "Written cue cards"]),
  domain("prior-knowledge", "Prior Knowledge", "New learning builds on what pupils already know.", "Assumed knowledge creates gaps and frustration.", "Activate last lesson, prior unit, or playground experience.", ["What did we learn about passing?", "Show me last lesson's balance"], ["Connect invasion tactic to prior game", "Build on Year 5 throwing"], ["Movement recall starter", "Tactical compare to last week"], ["What do pupils already know?", "How will you activate it in 2 minutes?"], ["Pupil links old and new", "Correct prior misconception"], ["Teaching as if from zero every time", "Ignoring knowledge gaps"], ["Pre-teach vocabulary", "Bridge from simpler prior skill"]),
  domain("schema", "Schema Development", "Organised mental models connect ideas into usable patterns.", "Isolated drills do not build tactical or movement schemas.", "Progressions should connect lessons into coherent units.", ["Throwing schema: send, receive, move", "Invasion schema: space, support, pass"], ["Spiral tactical ideas across scheme", "Chunk skills into phases"], ["Unit arc from simple to complex game", "Explicit link between lessons"], ["How does today fit the unit story?", "What connection is made explicit?"], ["Performance in connected task", "Pupil explains unit progression"], ["Random activity sequence", "No connection between lessons"], ["Same schema, different entry point", "Extra connection prompts for novices"]),
  domain("metacognition", "Metacognition", "Thinking about one's own thinking — plan, monitor, evaluate.", "Metacognitive pupils self-correct and persist.", "Reflection, self-assessment, and target-setting in PE.", ["What will you focus on?", "Did you meet your target?"], ["Self-rate against WILF", "Plan improvement for next lesson"], ["Monitor effort during task", "Evaluate what changed performance"], ["Where will pupils plan or evaluate?", "What monitoring question?"], ["Self-assessment accuracy", "Reflection linked to WILF"], ["No reflection", "Teacher-only evaluation"], ["Structured reflection sentence starters", "Partner monitor roles"]),
  domain("scaffolding", "Scaffolding", "Temporary support that is gradually removed as competence grows.", "Support enables success; permanent support prevents independence.", "Demo, cues, guided practice, then fade.", ["Hand position guide then fade", "Partner feedback before solo"], ["Partial game before full rules", "Progressive constraint release"], ["I do — we do — you do", "Cue card removed over lessons"], ["What support today? When will you fade?", "Who still needs scaffold?"], ["Independent success after support", "Fade observed across unit"], ["No support for novices", "Support never removed"], ["Extra scaffold for SEND", "Independent pathway for ready pupils"]),
  domain("instruction", "Instruction", "Clear, sequenced teaching matched to learner need.", "Instruction quality determines what enters memory.", "Explicit demo plus practice suits many PE skills.", ["One demo, immediate practice", "Clear learning intention"], ["Brief explain — long practice", "Sequenced skill breakdown"], ["Match instruction to expertise level", "Mixed explicit and guided discovery"], ["How long is instruction vs activity?", "Is sequence logical?"], ["Pupil performs after minimal re-teach", "Instruction clarity check"], ["Too much talking", "Unclear objective", "Multiple messages"], ["Shorter instructions for primary", "Visual sequencing for EAL"]),
  domain("feedback", "Feedback", "Information closing the gap between current and intended performance.", "Feedback drives improvement when specific and actionable.", "Feed up, feed back, feed forward in PE.", ["Goal: bend knees on landing", "Next: step opposite foot"], ["Compare to WILF not rank", "One cue per feedback moment"], ["Immediate feed-forward after attempt", "Peer feedback on one point"], ["What is feed-forward today?", "Is feedback against WILF?"], ["Pupil acts on feedback same lesson", "Specific not vague praise"], ["Good job only", "No next step"], ["Private feedback for anxious pupils", "Written feed-forward"]),
  domain("assessment", "Assessment", "Assessment for learning uses evidence to adjust teaching and pupil effort.", "End-only assessment misses chances to improve.", "WILF, observation, questioning, peer and self-check.", ["Mid-lesson WILF check", "Traffic-light self-assess"], ["Peer sign-off on one criterion", "Teacher 30-second scan"], ["Questioning during practice", "Exit evidence collection"], ["When will you check understanding?", "Is WILF observable?"], ["Evidence recorded against WILF", "Check adjusts next task"], ["Assessment only at end", "Unclear success criteria"], ["Alternative WILF same intention", "Supported self-assessment"]),
  domain("transfer", "Transfer", "Applying learning in new contexts beyond the original task.", "Without transfer, PE learning stays lesson-bound.", "Skill in new game, sport, or life context.", ["Throw in new target game", "Tactic in different invasion sport"], ["Health habit beyond lesson", "Movement concept in dance and games"], ["Compare two sport applications", "Where else does this work?"], ["What new context tests transfer?", "Explicit transfer question"], ["Success in novel context", "Pupil names transfer"], ["Same drill only", "No application phase"], ["Simplified transfer task", "Optional home link"]),
  domain("motivation", "Motivation", "Beliefs, goals, and environment that drive effort and persistence.", "Motivation affects attention and practice quality.", "Autonomy, competence, relatedness in PE tasks.", ["Choice of challenge level", "Personal best not rank"], ["Cooperative goals", "Meaningful game purpose"], ["Celebrate improvement", "Avoid public humiliation"], ["Why would pupils care today?", "Where is meaningful success?"], ["Effort sustained", "Re-engagement after error"], ["Comparison boards", "Punitive fitness"], ["Opt-in challenges", "Confidence-first progression"]),
  domain("context", "Context", "Physical, social, and cultural environment shapes learning.", "Same plan works differently in different classes.", "Hall size, class culture, inclusion, relationships.", ["Adapt to space constraints", "Positive class norms"], ["Mixed-gender inclusive grouping", "LSA-supported access"], ["Relational start", "Clear behaviour expectations"], ["What context risks exist?", "How does environment help?"], ["Inclusive participation observed", "Safe culture maintained"], ["Ignoring facilities limits", "Culture of fear or exclusion"], ["Adapt equipment and space", "Relationship-sensitive grouping"]),
  domain("misconceptions", "Misconceptions", "Incorrect beliefs that block learning until addressed.", "Unchallenged misconceptions persist in movement and tactics.", "Performance mistaken for learning; wrong technique models.", ["Success in easy drill ≠ mastery", "Clarify pass vs kick"], ["Correct landing misconception", "Fix tactical myth"], ["Probe with self-check", "Corrective constrained task"], ["What misconception might appear?", "How will you surface it?"], ["Misconception corrected in lesson", "Pupil revises understanding"], ["Ignore repeated error", "Praise fluency on wrong form"], ["Gentle corrective feedback", "Visual correct model"]),
];

export const EDUCATIONAL_PSYCHOLOGY_WARNINGS: EducationalPsychologyWarning[] = [
  { id: "too-many-instructions", warning: "Too many instructions", whyItMatters: "Working memory cannot hold multiple new messages during movement.", suggestedFix: "One instruction per phase — show then do.", teacherPrompt: "One thing only: today we focus on…" },
  { id: "overload", warning: "Overload risk", whyItMatters: "Cognitive overload stops learning and increases errors.", suggestedFix: "Remove one rule, cue, or transition.", teacherPrompt: "Simplify — what can we drop?" },
  { id: "assumes-prior", warning: "Assumes prior knowledge", whyItMatters: "Gaps block new learning.", suggestedFix: "2-minute activation starter.", teacherPrompt: "What do you already know about…?" },
  { id: "no-retrieval", warning: "No retrieval", whyItMatters: "Prior learning must be activated to connect with new content.", suggestedFix: "Recall before new teaching.", teacherPrompt: "Before we add new — show me last lesson's…" },
  { id: "weak-scaffold", warning: "Weak scaffolding", whyItMatters: "Novices need support before independence.", suggestedFix: "Add demo, cue card, or guided practice.", teacherPrompt: "Watch me first — then you try with one cue." },
  { id: "vague-feedback", warning: "Vague feedback", whyItMatters: "Non-specific praise does not close performance gaps.", suggestedFix: "One specific feed-forward cue.", teacherPrompt: "Next time, try… because…" },
  { id: "assessment-late", warning: "Assessment too late", whyItMatters: "AfL needs checks during learning not only at end.", suggestedFix: "Mid-lesson WILF scan or question.", teacherPrompt: "Pause — who is meeting WILF right now?" },
  { id: "no-reflection", warning: "Reflection absent", whyItMatters: "Metacognition consolidates learning.", suggestedFix: "2-minute exit reflection against target.", teacherPrompt: "What did you improve and why?" },
  { id: "no-transfer", warning: "Transfer absent", whyItMatters: "Learning must apply beyond one drill.", suggestedFix: "Application in second context or sport link.", teacherPrompt: "Where else could this work?" },
  { id: "misconception", warning: "Misconceptions unaddressed", whyItMatters: "Wrong models become habit.", suggestedFix: "Corrective task with constrained success.", teacherPrompt: "Let's check — is that always true?" },
];

export const EDUCATIONAL_PSYCHOLOGY_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "educational-psychology-master",
  title: "Educational Psychology for PE",
  category: "learning-science",
  summary: EDUCATIONAL_PSYCHOLOGY_CORE_MESSAGE,
  keyPrinciples: EDUCATIONAL_PSYCHOLOGY_FRAMEWORK.map((d) => d.name),
  whyItMattersInPE: "PE learning depends on memory, load, scaffolding, and feedback — not activity alone.",
  whenToUse: ["All lesson planning", "Instruction and feedback design", "Scheme progression", "Assessment and reflection design"],
  commonMistakes: EDUCATIONAL_PSYCHOLOGY_WARNINGS.slice(0, 5).map((w) => w.warning),
  practicalApplications: EDUCATIONAL_PSYCHOLOGY_FRAMEWORK.slice(0, 4).map((d) => `${d.name}: ${d.coachingExamples[0]}`),
  lessonPlanningPrompts: EDUCATIONAL_PSYCHOLOGY_FRAMEWORK.flatMap((d) => d.planningPrompts).slice(0, 6),
  assessmentPrompts: EDUCATIONAL_PSYCHOLOGY_FRAMEWORK.flatMap((d) => d.assessmentOpportunities).slice(0, 4),
  differentiationPrompts: EDUCATIONAL_PSYCHOLOGY_FRAMEWORK.flatMap((d) => d.differentiationImplications).slice(0, 4),
  agePhaseRelevance: ["early-years", "primary", "middle-school", "secondary", "all"],
  pathwayRelevance: ["all", "alp-pe"],
  relatedModels: ["learning-science-master", "teaching-for-learning-master", "retrieval-practice", "assessment-for-learning"],
  tags: ["educational-psychology", "cognitive-load", "memory", "metacognition", "scaffolding", "feedback", "schema"],
};

export function isEducationalPsychologyRelevant(text: string): boolean {
  return /\b(memory|cognitive|load|schema|metacogn|scaffold|feedback|misconception|instruction|prior knowledge|working memory|novice|expert)\b/i.test(text);
}

export function getEducationalPsychologyDomain(id: string): EducationalPsychologyDomain | undefined {
  return EDUCATIONAL_PSYCHOLOGY_FRAMEWORK.find((d) => d.id === id);
}
