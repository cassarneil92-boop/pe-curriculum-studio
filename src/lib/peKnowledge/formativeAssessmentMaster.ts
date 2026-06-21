/**
 * Formative Assessment Intelligence Engine v1 — original content for PE Curriculum Studio.
 */

import type { PEKnowledgeEntry } from "./types";

export interface FormativeAssessmentDomain {
  id: string;
  name: string;
  definition: string;
  whyItMatters: string;
  peRelevance: string;
  primaryExamples: string[];
  secondaryExamples: string[];
  coachingExamples: string[];
  planningPrompts: string[];
  assessmentPrompts: string[];
  commonMistakes: string[];
  differentiationImplications: string[];
}

export interface FormativeAssessmentWarning {
  id: string;
  warning: string;
  whyItMatters: string;
  suggestedFix: string;
  teacherPrompt: string;
}

export const FORMATIVE_ASSESSMENT_CORE_MESSAGE =
  "Assessment is not something done after learning — it drives learning throughout the lesson by clarifying intentions, eliciting evidence, and adjusting teaching in the moment.";

function faDomain(
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
): FormativeAssessmentDomain {
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
    assessmentPrompts: assessment,
    commonMistakes: mistakes,
    differentiationImplications: diff,
  };
}

export const FORMATIVE_ASSESSMENT_FRAMEWORK: FormativeAssessmentDomain[] = [
  faDomain(
    "learning-intentions",
    "Learning Intentions",
    "Clear statements of what pupils will learn — not merely what they will do.",
    "Without a learning intention, activity becomes busy movement without purpose.",
    "WALT describes skill, understanding, or decision-making in PE — observable and age-appropriate.",
    ["We are learning to pass accurately under pressure", "We are learning when to support in attack"],
    ["Understand how balance affects landing", "Develop tactical awareness in 3v3"],
    ["Write WALT before activities — check: learning or doing?", "Share pupil-friendly version on board"],
    ["What will pupils learn today?", "Is the intention specific enough to assess?"],
    ["Pupil can restate intention in own words", "Teacher observes against stated learning"],
    ["We will play football", "Vague or multiple conflicting intentions"],
    ["Picture-supported WALT for EAL", "Simplified version for primary"]
  ),
  faDomain(
    "success-criteria",
    "Success Criteria",
    "Observable indicators that show whether the learning intention has been met.",
    "Success criteria make learning visible to teacher and pupil.",
    "WILF describes what good looks like — form, decision, safety, or teamwork evidence.",
    ["Pass reaches partner's feet", "Bend knees on landing with control"],
    ["Make one tactical choice under pressure", "Self-check against three criteria"],
    ["Write WILF linked to WALT", "Pupil-friendly criteria on display"],
    ["How will pupils know they succeeded?", "Are criteria measurable in this lesson?"],
    ["Checklist against WILF during practice", "Peer sign-off on one criterion"],
    ["Try your best", "Activity completion as success"],
    ["Tiered WILF — same intention, different challenge", "Visual rubric for SEND"]
  ),
  faDomain(
    "evidence-elicitation",
    "Evidence Elicitation",
    "Deliberate collection of proof that learning is occurring during the lesson.",
    "Evidence answers whether teaching is working — before the lesson ends.",
    "Observation, questioning, demonstration, and performance samples in fast-moving PE.",
    ["30-second WILF scan mid-lesson", "Ask one pupil to explain tactic"],
    ["Partner observation note", "Video snapshot of technique"],
    ["Plan evidence moment after each activity block", "Who will you sample this lesson?"],
    ["What evidence will you collect?", "When during the lesson?"],
    ["Evidence matches WILF not just participation", "Multiple evidence types collected"],
    ["No evidence until plenary", "Assumed learning from busy activity"],
    ["Alternative evidence same WILF", "LSA-supported observation focus"]
  ),
  faDomain(
    "hinge-questions",
    "Hinge Questions",
    "Quick diagnostic questions that reveal understanding and drive the next teaching decision.",
    "Hinge questions prevent moving on when pupils have not learned.",
    "Tactical, rules, or skill-understanding checks before progressing task difficulty.",
    ["Show me passing to space — thumbs up if you know when", "What rule applies here?"],
    ["Why did that tactic fail?", "What would you change on next possession?"],
    ["Pause practice — ask hinge question before harder game", "Use show of hands or whiteboards"],
    ["What question tells you if pupils are ready to progress?", "What if half the class is wrong?"],
    ["Correct responses before extension", "Misconception identified and addressed"],
    ["Long verbal quiz stopping activity flow", "Question with no planned response action"],
    ["Visual hinge for EAL", "Partner discuss before whole-class show"]
  ),
  faDomain(
    "feedback",
    "Feedback",
    "Information that closes the gap between current performance and intended learning.",
    "Feedback moves learning forward when specific, timely, and actionable.",
    "Feed up (goal), feed back (current), feed forward (next step) during PE practice.",
    ["Remind WILF — then one specific cue", "Next rep: focus on knee bend"],
    ["Compare to criteria not rank order", "Peer gives one useful tip"],
    ["Where am I going? How am I doing? What's next?", "Feedback during not only after"],
    ["Is feedback against WILF?", "What is the feed-forward today?"],
    ["Pupil acts on feedback same lesson", "Specific not praise-only"],
    ["Good job only", "Vague well done without next step"],
    ["Private feedback for anxious pupils", "Written feed-forward card"]
  ),
  faDomain(
    "peer-assessment",
    "Peer Assessment",
    "Structured pupil observation and feedback against shared criteria.",
    "Peers increase feedback frequency when teachers cannot see every pupil in games.",
    "Partner observation against one WILF criterion in skill and game phases.",
    ["Observe one criterion — yes/no plus one tip", "Two stars and a wish checklist"],
    ["Rotate observer in small-sided game", "Partner coaching one skill point"],
    ["Model helpful vs unhelpful feedback first", "One focus per observation cycle"],
    ["Which single criterion will peers observe?", "How will you hold peers accountable?"],
    ["Peer feedback matches WILF language", "Observer uses sentence stems"],
    ["Unstructured tell your partner", "Peer criticism without criteria"],
    ["Simplified checklist for primary", "Observer role in SEM or cooperative learning"]
  ),
  faDomain(
    "self-assessment",
    "Self Assessment",
    "Pupils judge their own learning against criteria with structure and support.",
    "Self-assessment builds ownership and calibrates pupil understanding.",
    "Traffic lights, confidence scales, reflection prompts, and learning logs in PE.",
    ["Thumbs against WILF mid-lesson", "Traffic light self-rate before exit"],
    ["What improved since warm-up?", "Goal for next lesson"],
    ["Self-rate then demonstrate", "Confidence before and after practice"],
    ["How will pupils self-assess today?", "Do they know what good looks like?"],
    ["Self-assessment linked to WILF", "Honest reflection with sentence starters"],
    ["No self-check planned", "Self-assessment without criteria"],
    ["Visual scale for SEND", "Oral reflection for EAL with stems"]
  ),
  faDomain(
    "student-ownership",
    "Student Ownership",
    "Pupils take responsibility for monitoring, regulating, and directing their learning.",
    "Ownership shifts assessment from teacher-only to shared learning culture.",
    "Goal-setting, self-monitoring, reflection, and learning logs in PE units.",
    ["Set personal target against WILF", "Track improvement across scheme"],
    ["Pupil chooses stretch pathway", "Learning log after each lesson"],
    ["Who owns the next step?", "Reflection linked to intention not just enjoyment"],
    ["Where is pupil agency in assessment?", "Do pupils know how to improve?"],
    ["Pupil names evidence for self-rating", "Goal reviewed next lesson"],
    ["Teacher decides everything", "Reflection without action"],
    ["Supported goal-setting for low confidence", "Choice within same WILF"]
  ),
  faDomain(
    "assessment-decision-making",
    "Assessment Decision Making",
    "Using evidence to decide whether to progress, reteach, scaffold, or extend.",
    "Formative assessment only works when evidence changes what happens next.",
    "Adjust task difficulty, group pupils, or re-demo based on hinge question results.",
    ["Half class unsure — reteach with demo", "Majority secure — add defender"],
    ["Scaffold for group needing support", "Extension for pupils ready to lead"],
    ["What will you do if hinge question fails?", "Plan decision point before harder task"],
    ["What evidence triggers progress?", "What triggers reteach?"],
    ["Teaching adjusted same lesson", "Decision documented in coach notes"],
    ["Collect evidence but never act on it", "Same task regardless of understanding"],
    ["Parallel support and extend pathways", "Reteach without removing all pupils from activity"]
  ),
  faDomain(
    "formative-assessment-quality",
    "Formative Assessment Quality",
    "Holistic quality of assessment-for-learning design across a lesson or unit.",
    "High-quality formative assessment integrates intentions, evidence, feedback, and decisions.",
    "WALT/WILF visible, mid-lesson checks, peer/self assessment, and responsive teaching.",
    ["Full AfL cycle in one lesson", "Assessment checkpoints across scheme"],
    ["Short-cycle evidence every 10 minutes", "Exit ticket linked to hinge question"],
    ["Review all eight AfL domains in planning", "Quality score guides improvement"],
    ["Which AfL domain is weakest?", "What one change improves evidence most?"],
    ["Score 75+ with checks met", "Warnings addressed before delivery"],
    ["AfL checklist ticked but not enacted", "Summative mindset in formative slot"],
    ["Adapt AfL tools by pathway — primary, ALP, SEC", "Accessible evidence for all learners"]
  ),
];

export const FORMATIVE_ASSESSMENT_WARNINGS: FormativeAssessmentWarning[] = [
  {
    id: "unclear-intention",
    warning: "Unclear learning intention",
    whyItMatters: "Pupils cannot aim for learning they do not understand.",
    suggestedFix: "Rewrite WALT: We are learning to… — not We will play…",
    teacherPrompt: "Can every pupil say what they are learning today?",
  },
  {
    id: "missing-wilf",
    warning: "Success criteria missing",
    whyItMatters: "Without WILF, neither teacher nor pupil can judge success.",
    suggestedFix: "Add 2–3 observable WILF statements linked to WALT.",
    teacherPrompt: "Success looks like… what will you see?",
  },
  {
    id: "no-evidence",
    warning: "Evidence not collected",
    whyItMatters: "Teaching may continue without confirming learning.",
    suggestedFix: "Plan one mid-lesson evidence checkpoint against WILF.",
    teacherPrompt: "When will you know if pupils are learning?",
  },
  {
    id: "ineffective-feedback",
    warning: "Feedback ineffective",
    whyItMatters: "Praise-only or vague feedback does not close the gap.",
    suggestedFix: "Add feed-forward: one specific next step against WILF.",
    teacherPrompt: "Next rep — try this because…",
  },
  {
    id: "no-peer",
    warning: "No peer assessment",
    whyItMatters: "Teacher cannot observe every pupil during games.",
    suggestedFix: "Add structured partner observation on one criterion.",
    teacherPrompt: "Which one thing will partners look for?",
  },
  {
    id: "no-self",
    warning: "No self assessment",
    whyItMatters: "Pupils do not monitor or own their learning.",
    suggestedFix: "Traffic-light or thumbs self-check against WILF.",
    teacherPrompt: "Did you meet success criteria? What evidence?",
  },
  {
    id: "no-decision",
    warning: "No decision point",
    whyItMatters: "Evidence without action wastes formative assessment.",
    suggestedFix: "Add hinge question with planned response if incorrect.",
    teacherPrompt: "What will you do if half the class is unsure?",
  },
  {
    id: "end-only",
    warning: "Assessment only at lesson end",
    whyItMatters: "Late assessment cannot adjust teaching during learning.",
    suggestedFix: "Move one check to mid-lesson before harder task.",
    teacherPrompt: "Where is your first evidence moment?",
  },
];

export const FORMATIVE_ASSESSMENT_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "formative-assessment-master",
  title: "Formative Assessment for PE",
  category: "assessment",
  summary: FORMATIVE_ASSESSMENT_CORE_MESSAGE,
  keyPrinciples: FORMATIVE_ASSESSMENT_FRAMEWORK.map((d) => d.name),
  whyItMattersInPE:
    "PE moves fast — formative assessment must be planned, practical, and decision-driven so teachers adjust before pupils leave the lesson.",
  whenToUse: [
    "Every lesson — WALT/WILF design and evidence planning",
    "Before increasing task difficulty or competition",
    "Scheme units with progressive skill and tactical development",
    "ALP vocational and SEC option theory/practical lessons",
  ],
  commonMistakes: FORMATIVE_ASSESSMENT_WARNINGS.slice(0, 5).map((w) => w.warning),
  practicalApplications: FORMATIVE_ASSESSMENT_FRAMEWORK.slice(0, 4).map(
    (d) => `${d.name}: ${d.coachingExamples[0]}`
  ),
  lessonPlanningPrompts: FORMATIVE_ASSESSMENT_FRAMEWORK.flatMap((d) => d.planningPrompts).slice(0, 6),
  assessmentPrompts: FORMATIVE_ASSESSMENT_FRAMEWORK.flatMap((d) => d.assessmentPrompts).slice(0, 4),
  differentiationPrompts: FORMATIVE_ASSESSMENT_FRAMEWORK.flatMap((d) => d.differentiationImplications).slice(0, 4),
  agePhaseRelevance: ["early-years", "primary", "middle-school", "secondary", "all"],
  pathwayRelevance: ["all", "alp-pe", "pe-option-sec"],
  relatedModels: [
    "visible-learning-master",
    "assessment-for-learning",
    "learning-science-master",
    "teaching-for-learning-master",
  ],
  tags: [
    "formative",
    "afl",
    "walt",
    "wilf",
    "hinge",
    "feedback",
    "peer-assessment",
    "self-assessment",
    "evidence",
    "exit-ticket",
  ],
};

export function isFormativeAssessmentRelevant(text: string): boolean {
  return /\b(formative|afl|assessment for learning|hinge|success criteria|wilf|learning intention|walt|exit ticket|peer assess|self assess|self.?check|evidence|misconception|feed.?forward|decision point|traffic light|check.?point|observation focus)\b/i.test(
    text
  );
}

export function getFormativeAssessmentDomain(id: string): FormativeAssessmentDomain | undefined {
  return FORMATIVE_ASSESSMENT_FRAMEWORK.find((d) => d.id === id);
}
