/**
 * Cooperative Learning Master Pack v1 — original educational content.
 * Not copied from copyrighted sources. No fabricated citations.
 */

import type { AgePhase, PEKnowledgeEntry } from "./types";

export type CLElementId =
  | "positive-interdependence"
  | "individual-accountability"
  | "promotive-interaction"
  | "interpersonal-skills"
  | "group-processing";

export type CLQuestionAgeBand = "primary" | "lower-secondary" | "upper-secondary";

export interface CLElement {
  id: CLElementId;
  name: string;
  definition: string;
  whyItMatters: string;
  peRelevance: string;
  examples: string[];
  commonMistakes: string[];
  implementationTips: string[];
  assessmentOpportunities: string[];
  ageAdaptations: string[];
}

export interface CooperativeStructure {
  id: string;
  name: string;
  description: string;
  bestUseCases: string[];
  ageSuitability: AgePhase[];
  setupRequirements: string[];
  assessmentOpportunities: string[];
  differentiationOpportunities: string[];
}

export interface CooperativeRole {
  id: string;
  name: string;
  responsibility: string;
  ageSuitability: AgePhase[];
  whenToUse: string;
  assessmentEvidence: string;
}

export interface GroupStructureOption {
  id: string;
  name: string;
  advantages: string[];
  risks: string[];
  bestUseCases: string[];
}

export interface CLWarning {
  id: string;
  warning: string;
  whyItMatters: string;
  suggestedFix: string;
}

export const COOPERATIVE_LEARNING_CORE_MESSAGE =
  "Genuine cooperative learning requires positive interdependence, individual accountability, promotive interaction, taught interpersonal skills, and group processing — not merely placing pupils in groups.";

export const COOPERATIVE_LEARNING_FRAMEWORK: CLElement[] = [
  {
    id: "positive-interdependence",
    name: "Positive Interdependence",
    definition: "Group members perceive that they succeed together — outcomes depend on shared effort, not one individual alone.",
    whyItMatters: "Without interdependence, groups are just proximity. Pupils need a reason to work together.",
    peRelevance: "Team scores, shared equipment goals, and combined challenges distribute participation in PE.",
    examples: [
      "Team must complete 20 passes with every member touching",
      "Combined group score before anyone can advance",
    ],
    commonMistakes: [
      "Individual winner in a group task",
      "Strongest player can succeed without others",
    ],
    implementationTips: [
      "One shared goal visible to all",
      "Success requires each role to contribute",
    ],
    assessmentOpportunities: ["Did the group meet the shared criterion?", "Which interdependence structure worked?"],
    ageAdaptations: [
      "Primary: simple shared target (e.g. 10 catches together)",
      "Secondary: tactical interdependence (e.g. must combine before scoring)",
    ],
  },
  {
    id: "individual-accountability",
    name: "Individual Accountability",
    definition: "Each learner is responsible for contributing and demonstrating their own learning.",
    whyItMatters: "Prevents free riders and ensures assessment reflects every pupil.",
    peRelevance: "Roles, individual WILF checks, and contribution evidence stop passengers on the sideline.",
    examples: [
      "Each pupil records one skill attempt",
      "Role card with specific accountable task",
    ],
    commonMistakes: [
      "No way to know who contributed",
      "One pupil completes the task for the group",
    ],
    implementationTips: [
      "Assign visible roles with evidence",
      "Random check or peer sign-off",
    ],
    assessmentOpportunities: ["Individual meets WILF", "Peer confirms contribution"],
    ageAdaptations: [
      "Primary: simple role with one clear job",
      "Secondary: individual tactical or skill evidence within team task",
    ],
  },
  {
    id: "promotive-interaction",
    name: "Promotive Interaction",
    definition: "Pupils encourage and support one another's learning through face-to-face positive interaction.",
    whyItMatters: "Learning is social — pupils teach, cue, and motivate each other.",
    peRelevance: "Peer coaching, encouragement, and shared problem solving in movement contexts.",
    examples: [
      "Partner gives one specific cue after each attempt",
      "Encourager role celebrates effort and improvement",
    ],
    commonMistakes: [
      "Parallel work with no interaction",
      "Negative or competitive talk within group",
    ],
    implementationTips: [
      "Build in turn-taking and peer feedback",
      "Teach one encouragement phrase",
    ],
    assessmentOpportunities: ["Quality of peer support observed", "Specific praise given to teammate"],
    ageAdaptations: [
      "Primary: high-five and one helpful comment",
      "Secondary: structured peer feedback protocol",
    ],
  },
  {
    id: "interpersonal-skills",
    name: "Interpersonal Skills",
    definition: "Social skills are taught explicitly — not assumed — including communication, listening, and cooperation.",
    whyItMatters: "Group work fails when pupils lack skills to cooperate under pressure.",
    peRelevance: "PE is ideal for practising communication, leadership, and conflict resolution in action.",
    examples: [
      "Teach listening before partner feedback",
      "Practice disagreement protocol before team game",
    ],
    commonMistakes: [
      "Social skills assumed not taught",
      "Only physical skill in WALT",
    ],
    implementationTips: [
      "Name one social skill in WALT or WILF",
      "Brief practice of skill before main task",
    ],
    assessmentOpportunities: ["Pupil demonstrates agreed social skill", "Self-rate cooperation"],
    ageAdaptations: [
      "Primary: one skill per lesson (e.g. taking turns)",
      "Secondary: negotiation and shared decision making",
    ],
  },
  {
    id: "group-processing",
    name: "Group Processing",
    definition: "Groups reflect on how well they worked together and plan improvements.",
    whyItMatters: "Reflection transfers cooperation skills to future lessons and life.",
    peRelevance: "Quick team huddles after challenges build metacognition about teamwork.",
    examples: [
      "Two-minute team review: what worked? what next?",
      "Group sets one improvement target for next attempt",
    ],
    commonMistakes: [
      "No reflection after group task",
      "Teacher dominates debrief",
    ],
    implementationTips: [
      "Use structured prompts not open chaos",
      "Pupil-led review where possible",
    ],
    assessmentOpportunities: ["Group identifies improvement", "Individual reflects on role"],
    ageAdaptations: [
      "Primary: one question (What helped us?)",
      "Secondary: structured team review with roles",
    ],
  },
];

export const COOPERATIVE_STRUCTURE_LIBRARY: CooperativeStructure[] = [
  {
    id: "reciprocal-teaching",
    name: "Reciprocal teaching pairs",
    description: "Partners alternate performer and coach, giving cue-based feedback after each attempt.",
    bestUseCases: ["Skill refinement", "Mixed ability pairs", "Limited teacher feedback time"],
    ageSuitability: ["primary", "middle-school", "secondary"],
    setupRequirements: ["Pairs", "Simple cue card", "Clear role swap timing"],
    assessmentOpportunities: ["Quality of peer cue", "Improvement after feedback"],
    differentiationOpportunities: ["Easier cue card for support", "Harder challenge for performer"],
  },
  {
    id: "jigsaw",
    name: "Jigsaw learning teams",
    description: "Each pupil masters one part, then teaches teammates so the whole team gains full understanding.",
    bestUseCases: ["Rules or tactics knowledge", "Multi-part sequences", "Shared team understanding"],
    ageSuitability: ["middle-school", "secondary"],
    setupRequirements: ["Expert groups then home teams", "Clear part assignment"],
    assessmentOpportunities: ["Can pupil teach their part?", "Team solves combined challenge"],
    differentiationOpportunities: ["Visual cards for experts", "Simpler part for support"],
  },
  {
    id: "pair-coaching",
    name: "Pair coaching",
    description: "One pupil performs while partner observes against criteria and gives one improvement suggestion.",
    bestUseCases: ["Fundamental skills", "Form focus", "Building confidence"],
    ageSuitability: ["primary", "middle-school", "secondary"],
    setupRequirements: ["WILF visible", "Partner protocol taught"],
    assessmentOpportunities: ["Self and peer check against WILF"],
    differentiationOpportunities: ["Picture cues for primary", "Tactical observation for secondary"],
  },
  {
    id: "team-challenge",
    name: "Team challenge score",
    description: "Group earns one combined score — all members must contribute before team succeeds.",
    bestUseCases: ["Interdependence focus", "Games and challenges", "Large classes"],
    ageSuitability: ["primary", "middle-school", "secondary"],
    setupRequirements: ["Shared target", "Contribution rule (e.g. all touch)"],
    assessmentOpportunities: ["Team met criterion", "Individual contribution logged"],
    differentiationOpportunities: ["Adjust target per team", "Role assignment"],
  },
  {
    id: "learning-teams",
    name: "Learning teams",
    description: "Stable teams across lessons build trust, roles, and improving group processing.",
    bestUseCases: ["Scheme units", "Social skill development", "Sport education style units"],
    ageSuitability: ["middle-school", "secondary"],
    setupRequirements: ["Teams persist 3+ lessons", "Rotating roles"],
    assessmentOpportunities: ["Team improvement over time", "Individual role evidence"],
    differentiationOpportunities: ["Rebalance teams mid-unit if needed"],
  },
  {
    id: "peer-feedback",
    name: "Peer feedback partnerships",
    description: "Structured give-and-receive feedback using agreed stems linked to WILF.",
    bestUseCases: ["Refinement phase", "Assessment for learning", "Building communication"],
    ageSuitability: ["primary", "middle-school", "secondary"],
    setupRequirements: ["Feedback stems on card", "Practice polite protocol"],
    assessmentOpportunities: ["Specificity of peer comment", "Action taken after feedback"],
    differentiationOpportunities: ["Sentence starters for EAL", "Video demo for clarity"],
  },
  {
    id: "collaborative-problem",
    name: "Collaborative problem solving",
    description: "Team receives a tactical or movement problem and must agree a strategy before acting.",
    bestUseCases: ["TGfU decision making", "Outdoor education", "Invasion games"],
    ageSuitability: ["middle-school", "secondary"],
    setupRequirements: ["Problem brief", "Planning time before play"],
    assessmentOpportunities: ["Strategy explanation", "Adaptation when plan fails"],
    differentiationOpportunities: ["Scaffold with options", "Coach role supports quieter pupils"],
  },
  {
    id: "cooperative-stations",
    name: "Cooperative stations",
    description: "Small groups rotate through tasks where each station requires combined effort.",
    bestUseCases: ["Large classes", "Equipment sharing", "Varied skill practice"],
    ageSuitability: ["primary", "middle-school", "secondary"],
    setupRequirements: ["Station cards", "Rotation timer", "Group roles"],
    assessmentOpportunities: ["Station checklist per group", "Coach observes one station"],
    differentiationOpportunities: ["Easier/harder station variants"],
  },
  {
    id: "shared-goal",
    name: "Shared goal challenge",
    description: "Whole group works toward one visible outcome — no individual can complete alone.",
    bestUseCases: ["Positive interdependence intro", "Inclusion focus", "Team building"],
    ageSuitability: ["primary", "middle-school", "secondary"],
    setupRequirements: ["Clear shared criterion", "Celebration when achieved"],
    assessmentOpportunities: ["Group success", "Individual contribution note"],
    differentiationOpportunities: ["Adjust goal size", "Assign support roles"],
  },
];

export const COOPERATIVE_ROLES: CooperativeRole[] = [
  { id: "coach", name: "Coach", responsibility: "Give cue-based feedback to performer", ageSuitability: ["primary", "middle-school", "secondary"], whenToUse: "Pair or reciprocal tasks", assessmentEvidence: "Quality of feedback given" },
  { id: "encourager", name: "Encourager", responsibility: "Celebrate effort and support teammates", ageSuitability: ["primary", "middle-school", "secondary"], whenToUse: "When confidence is low", assessmentEvidence: "Specific praise observed" },
  { id: "equipment", name: "Equipment Manager", responsibility: "Set up and return equipment safely", ageSuitability: ["primary", "middle-school", "secondary"], whenToUse: "Stations and multiple resources", assessmentEvidence: "Safe efficient setup" },
  { id: "recorder", name: "Recorder", responsibility: "Track scores, attempts, or WILF checks", ageSuitability: ["middle-school", "secondary"], whenToUse: "Accountability needed", assessmentEvidence: "Accurate group record" },
  { id: "observer", name: "Observer", responsibility: "Watch for criteria and report to group", ageSuitability: ["middle-school", "secondary"], whenToUse: "Skill or tactic analysis", assessmentEvidence: "Specific observation shared" },
  { id: "timekeeper", name: "Timekeeper", responsibility: "Manage intervals and rotations", ageSuitability: ["primary", "middle-school", "secondary"], whenToUse: "Station rotation", assessmentEvidence: "Fair timing maintained" },
  { id: "safety", name: "Safety Leader", responsibility: "Monitor boundaries and safe play", ageSuitability: ["primary", "middle-school", "secondary"], whenToUse: "Contact or equipment activities", assessmentEvidence: "Safety reminders given" },
  { id: "inclusion", name: "Inclusion Champion", responsibility: "Ensure all voices and turns included", ageSuitability: ["middle-school", "secondary"], whenToUse: "Mixed ability or quiet pupils", assessmentEvidence: "Invites participation from all" },
  { id: "strategy", name: "Strategy Leader", responsibility: "Lead brief planning before team action", ageSuitability: ["middle-school", "secondary"], whenToUse: "Games and problem solving", assessmentEvidence: "Clear plan communicated" },
  { id: "feedback", name: "Feedback Partner", responsibility: "Exchange structured peer feedback", ageSuitability: ["primary", "middle-school", "secondary"], whenToUse: "Refinement activities", assessmentEvidence: "Uses agreed feedback stem" },
];

export const GROUP_STRUCTURE_OPTIONS: GroupStructureOption[] = [
  { id: "mixed-ability", name: "Mixed ability", advantages: ["Peer support", "Diverse strengths"], risks: ["Dominance if roles unclear"], bestUseCases: ["Cooperative learning with roles"] },
  { id: "mixed-gender", name: "Mixed gender", advantages: ["Inclusive social mix"], risks: ["May need safety or confidence considerations"], bestUseCases: ["Cooperative games", "Social outcomes"] },
  { id: "random", name: "Random", advantages: ["Quick", "Reduces friendship cliques"], risks: ["Uneven skill balance"], bestUseCases: ["Short tasks", "Team building"] },
  { id: "strategic", name: "Strategic grouping", advantages: ["Balanced participation"], risks: ["Takes planning time"], bestUseCases: ["Assessment tasks", "Competitive balance"] },
  { id: "interest", name: "Interest based", advantages: ["Motivation"], risks: ["Ability imbalance"], bestUseCases: ["Choice units", "Project work"] },
  { id: "skill-balanced", name: "Skill balanced", advantages: ["Fair competition"], risks: ["May isolate lower confidence pupils"], bestUseCases: ["Games with scoring"] },
];

export const COOPERATIVE_LEARNING_WARNINGS: CLWarning[] = [
  { id: "grouped-not-cooperating", warning: "Students grouped but not cooperating", whyItMatters: "Physical grouping does not create interdependence or shared success.", suggestedFix: "Add shared goal requiring every member to contribute." },
  { id: "no-accountability", warning: "No individual accountability", whyItMatters: "Free riders learn little and skew assessment.", suggestedFix: "Assign roles with visible evidence or individual WILF check." },
  { id: "no-reflection", warning: "No group reflection", whyItMatters: "Cooperation skills do not transfer without processing.", suggestedFix: "Add two-minute team review with one prompt." },
  { id: "one-dominates", warning: "One learner dominates", whyItMatters: "Others disengage and miss practice.", suggestedFix: "Use turn limits, roles, or must-touch rules." },
  { id: "not-collaborative", warning: "Task not truly collaborative", whyItMatters: "Parallel individual work misses social learning.", suggestedFix: "Redesign task so success depends on combined effort." },
  { id: "skills-assumed", warning: "Social skills assumed not taught", whyItMatters: "Pupils lack tools to cooperate under pressure.", suggestedFix: "Teach one interpersonal skill before the task." },
  { id: "unclear-goal", warning: "Unclear group goal", whyItMatters: "Without shared purpose, groups fragment.", suggestedFix: "State team criterion before activity starts." },
];

export const GROUP_PROCESSING_PROMPTS = {
  performance: {
    primary: ["What did we do well?", "What can we improve?"],
    "lower-secondary": ["Which attempt was best and why?", "What will we change next time?"],
    "upper-secondary": ["What evidence shows we improved?", "How did strategy affect performance?"],
  },
  teamwork: {
    primary: ["Did everyone get a turn?", "How did we help each other?"],
    "lower-secondary": ["Did all roles contribute?", "What made us a good team?"],
    "upper-secondary": ["How balanced was participation?", "What team norm helped most?"],
  },
  communication: {
    primary: ["Did we listen to each other?", "What kind words did we use?"],
    "lower-secondary": ["Was our feedback helpful?", "How could we communicate better?"],
    "upper-secondary": ["Did we resolve disagreements constructively?", "What communication improved decisions?"],
  },
  problemSolving: {
    primary: ["How did we solve the problem?", "What idea worked?"],
    "lower-secondary": ["What plan did we try first?", "What did we change when stuck?"],
    "upper-secondary": ["How did we adapt strategy?", "What alternative would we try?"],
  },
  inclusion: {
    primary: ["Did everyone join in?", "How did we include others?"],
    "lower-secondary": ["Who needed encouragement?", "How did we share turns fairly?"],
    "upper-secondary": ["How did we ensure quieter voices were heard?", "What equity adjustment helped?"],
  },
  nextSteps: {
    primary: ["What will we try next?", "One thing to remember"],
    "lower-secondary": ["One target for next lesson", "What skill needs more practice?"],
    "upper-secondary": ["Individual and team goal for next session", "What cooperation skill to develop?"],
  },
};

export const COOPERATIVE_LEARNING_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "cooperative-learning-master",
  title: "Cooperative Learning Master — Genuine group learning",
  category: "pedagogy-model",
  summary: COOPERATIVE_LEARNING_CORE_MESSAGE,
  keyPrinciples: COOPERATIVE_LEARNING_FRAMEWORK.map((e) => e.name),
  whyItMattersInPE:
    "PE often puts pupils in teams without cooperative structures. This layer designs genuine interdependence, accountability, and group processing.",
  whenToUse: [
    "Mixed ability classes",
    "Large groups with limited equipment",
    "When communication and teamwork are learning outcomes",
  ],
  commonMistakes: COOPERATIVE_LEARNING_WARNINGS.map((w) => w.warning).slice(0, 5),
  practicalApplications: COOPERATIVE_STRUCTURE_LIBRARY.slice(0, 4).map((s) => s.name),
  lessonPlanningPrompts: COOPERATIVE_LEARNING_FRAMEWORK.flatMap((e) => e.implementationTips).slice(0, 6),
  assessmentPrompts: COOPERATIVE_LEARNING_FRAMEWORK.flatMap((e) => e.assessmentOpportunities).slice(0, 4),
  differentiationPrompts: [
    "Roles matched to strengths",
    "Smaller groups for more touches",
    "Shared goal with individual evidence",
  ],
  agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
  pathwayRelevance: ["all"],
  relatedModels: ["cooperative-learning", "sport-education", "inclusion-universal-design"],
  tags: ["cooperative-learning", "group-work", "teamwork", "communication", "inclusion", "social-skills"],
};

export function yearGroupToCLQuestionBand(yearGroup?: string): CLQuestionAgeBand {
  if (!yearGroup) return "lower-secondary";
  const y = yearGroup.toLowerCase();
  if (/year-[1-6]|primary|ks2/i.test(y)) return "primary";
  if (/year-[7-9]|year-10|lower|ks3/i.test(y)) return "lower-secondary";
  return "upper-secondary";
}

export function generateGroupProcessingPrompts(
  ageBand: CLQuestionAgeBand = "lower-secondary",
  count = 3
): string[] {
  const bank = GROUP_PROCESSING_PROMPTS;
  return [
    bank.teamwork[ageBand][0],
    bank.communication[ageBand][0],
    bank.nextSteps[ageBand][0],
    bank.performance[ageBand][0],
    bank.inclusion[ageBand][0],
  ].slice(0, count);
}

export function isCooperativeLearningRelevant(text: string): boolean {
  return /\b(group|team|partner|pair|cooperat|collaborat|together|shared|role|communicat|teamwork)\b/i.test(text);
}
