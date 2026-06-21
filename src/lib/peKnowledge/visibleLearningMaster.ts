/**
 * Visible Learning Master Pack v1 — original content for PE Curriculum Studio.
 */

import type { PEKnowledgeEntry } from "./types";

export interface VisibleLearningDomain {
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

export interface VisibleLearningWarning {
  id: string;
  warning: string;
  whyItMatters: string;
  suggestedFix: string;
  teacherPrompt: string;
}

export const VISIBLE_LEARNING_CORE_MESSAGE =
  "Focus on whether learning occurred — not only whether teaching was delivered.";

function vlDomain(
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
): VisibleLearningDomain {
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

export const VISIBLE_LEARNING_FRAMEWORK: VisibleLearningDomain[] = [
  vlDomain("teacher-clarity", "Teacher Clarity", "Teachers know what they want pupils to learn and communicate it clearly.", "Unclear teaching hides whether learning happened.", "Clear WALT/WILF before activity starts.", ["We are learning to throw with control", "Success looks like…"], ["Link intention to tactical problem", "One objective per lesson phase"], ["Share intention before warm-up", "Refer back during practice"], ["Can you state the learning in one sentence?", "Is there one main objective?"], ["Pupil repeats intention", "Teacher observation against WILF"], ["Activity without purpose", "Multiple competing objectives"], ["Visual WALT for EAL", "Simplified pupil-friendly version"]),
  vlDomain("learning-intentions", "Learning Intentions", "Explicit statements of what pupils will learn — not what they will do.", "Doing is not the same as learning.", "WALT describes skill or understanding, not just activity.", ["Learn to pass accurately", "Understand when to support"], ["Develop decision-making in invasion games", "Improve landing technique"], ["Write WALT before activities", "Check: learning or doing?"], ["What will pupils learn?", "Why does this matter in PE?"], ["Pupil explains what they are learning", "Intention visible on board"], ["We will play football", "Vague intention"], ["Same intention, varied tasks", "Picture-supported intentions"]),
  vlDomain("success-criteria", "Success Criteria", "Observable evidence that learning intentions have been met.", "Without WILF, success is invisible.", "Criteria describe performance pupils can see or demonstrate.", ["Bend knees on landing", "Pass reaches partner's feet"], ["Make tactical choice under pressure", "Self-assess against three criteria"], ["Write WILF with WALT", "Pupil-friendly success list"], ["How will pupils know they succeeded?", "Are criteria observable?"], ["Checklist against WILF", "Peer sign-off on criterion"], ["Activity-based WILF only", "Impossible or vague criteria"], ["Tiered WILF same intention", "One criterion for support pathway"]),
  vlDomain("challenge", "Challenge", "Tasks stretch pupils without overwhelming them.", "Appropriate challenge drives visible progress.", "Physical, tactical, and cognitive challenge balanced.", ["Personal best target", "Opponent adds pressure"], ["Decision under time constraint", "Extend task for ready pupils"], ["Monitor success rate ~70–80%", "Offer stretch pathway"], ["Is challenge too easy or too hard?", "Where is the stretch?"], ["Improvement against baseline", "Sustained effort at challenge level"], ["Everyone same task regardless", "Challenge without support"], ["Support pathway available", "Optional extend challenge"]),
  vlDomain("feedback", "Feedback", "Information that closes the gap between current and intended learning.", "Feedback makes learning visible and actionable.", "Feed up, feed back, feed forward in PE.", ["Remind WILF before practice", "One specific next step"], ["Compare to criteria not rank", "Immediate feed-forward"], ["Where am I going? How am I doing? What's next?", "Peer feedback on one point"], ["Is feedback against WILF?", "What is feed-forward?"], ["Pupil acts on feedback same lesson", "Specific not praise-only"], ["Good job only", "No next step"], ["Private feedback", "Written feed-forward card"]),
  vlDomain("progress-visibility", "Progress Visibility", "Improvement and learning gains are evident to teacher and pupil.", "Hidden progress prevents adjustment and motivation.", "Baseline, checkpoints, and comparison over time.", ["Photo or demo at start vs end", "Personal best tracker"], ["Lesson 1 vs lesson 5 comparison", "Traffic-light self-assess"], ["Mid-lesson checkpoint", "Exit evidence"], ["Where is progress visible?", "What baseline exists?"], ["Documented improvement", "Pupil names what improved"], ["No baseline", "No evidence collected"], ["Visual progress map", "Supported self-comparison"]),
  vlDomain("self-evaluation", "Student Self Evaluation", "Pupils assess their own learning against criteria.", "Self-evaluation builds ownership and accuracy.", "Reflection, confidence checks, goal review.", ["Thumbs up/sideways against WILF", "What improved today?"], ["Self-rate then demo", "Goal review for next lesson"], ["Partner check then self-assess", "Confidence before and after"], ["How will pupils evaluate learning?", "Do they know success criteria?"], ["Self-assessment matches teacher view", "Honest reflection"], ["No reflection", "Teacher-only judgment"], ["Sentence starters", "Visual rubric"]),
  vlDomain("assessment-evidence", "Assessment Evidence", "Collectable proof that learning occurred.", "Evidence answers: did learning happen?", "Observation notes, pupil explanation, performance samples.", ["30-second WILF scan", "Exit ticket one learning point"], ["Recorded personal best", "Peer observation note"], ["Question: explain your tactic", "Video snapshot of technique"], ["What evidence will you collect?", "When during lesson?"], ["Evidence matches WILF", "Multiple evidence types"], ["No evidence planned", "Activity completion only"], ["Alternative evidence same WILF", "LSA-supported capture"]),
  vlDomain("teacher-impact", "Teacher Impact", "Evidence that teaching produced learning — not just activity.", "Impact focus shifts from delivery to outcomes.", "Look for explanation, improvement, transfer.", ["Pupil explains learning in own words", "Improvement from lesson start"], ["Transfer to new context", "Assessment shows progress"], ["Compare exit evidence to WILF", "Name one missing evidence source"], ["What proves learning happened?", "What would show no learning?"], ["Impact confidence from evidence", "Missing evidence identified"], ["Assumed learning from busy lesson", "No check on impact"], ["Focus evidence on SEND pupils too", "Sample across class"]),
  vlDomain("visible-learning", "Visible Learning", "Learning is apparent to teacher and pupil during and after the lesson.", "When learning is visible, teaching can be adjusted.", "Pupils can say what, why, and how they know.", ["Pupil states WALT and WILF", "Shows improvement in demo"], ["Explains why tactic works", "Identifies next step"], ["Learning walk questions in plenary", "Visible success criteria"], ["Can pupils explain success?", "Is progress recognisable?"], ["Yes to what/why/how successful", "Blind spots addressed"], ["Learning invisible in activity only", "Pupils cannot explain"], ["Pupil-friendly language", "Visual success board"]),
  vlDomain("visible-teaching", "Visible Teaching", "Teaching actions are purposeful, observable, and linked to learning.", "Visible teaching connects instruction to outcomes.", "Clear instruction, intentional feedback, planned assessment.", ["State intention before demo", "Feedback during not only after"], ["Adjust task based on check", "Refer to WILF while teaching"], ["Pause practice to re-state WILF", "Intervene with one learning-focused cue"], ["Is every teaching moment purposeful?", "Can pupils see why you intervene?"], ["Teaching adjusted from evidence", "Intention referred throughout"], ["Teaching as activity management only", "Interventions without learning link"], ["Minimal talk — maximum purposeful action", "Co-teach visible roles"]),
  vlDomain("effectiveness", "Evaluation of Effectiveness", "Honest review of whether the lesson achieved its learning goals.", "Effectiveness evaluation improves future planning.", "Review clarity, challenge, feedback, evidence together.", ["Post-lesson: did WILF evidence appear?", "What would you change?"], ["Scheme review at unit midpoint", "Compare impact across lessons"], ["Priority improvement for next lesson", "Strongest area identified"], ["What was most effective?", "Weakest area to address?"], ["Effectiveness score from checks", "Action for next lesson"], ["No review", "Assumed success"], ["Quick 2-minute effectiveness note", "Peer coach review"]),
];

export const VISIBLE_LEARNING_WARNINGS: VisibleLearningWarning[] = [
  { id: "no-intention", warning: "Activity without learning intention", whyItMatters: "Pupils may be active without learning.", suggestedFix: "Write WALT as learning, not activity.", teacherPrompt: "We are learning to… not we are playing…" },
  { id: "unclear-wilf", warning: "Unclear success criteria", whyItMatters: "Success cannot be seen or assessed.", suggestedFix: "Make WILF observable — what will you see?", teacherPrompt: "Success looks like…" },
  { id: "challenge-low", warning: "Challenge level may be too low", whyItMatters: "Easy success hides lack of learning.", suggestedFix: "Add opponent, constraint, or personal best target.", teacherPrompt: "Same skill — harder challenge now." },
  { id: "challenge-high", warning: "Challenge too high", whyItMatters: "Excessive challenge stops learning and effort.", suggestedFix: "Scaffold with support pathway.", teacherPrompt: "Try support level first — then extend." },
  { id: "no-feedback", warning: "Feedback missing", whyItMatters: "Pupils cannot close the gap without feedback.", suggestedFix: "One feed-forward cue against WILF.", teacherPrompt: "Next time, try… because…" },
  { id: "progress-hidden", warning: "Progress invisible", whyItMatters: "Teacher and pupil cannot see improvement.", suggestedFix: "Add checkpoint or baseline comparison.", teacherPrompt: "Compare to start of lesson — what improved?" },
  { id: "no-self-eval", warning: "No self evaluation", whyItMatters: "Pupils do not own their learning.", suggestedFix: "Exit self-assess against WILF.", teacherPrompt: "Did you meet success criteria? Evidence?" },
  { id: "no-evidence", warning: "No evidence of learning", whyItMatters: "Impact cannot be judged.", suggestedFix: "Plan one observation focus and exit check.", teacherPrompt: "What will prove learning happened?" },
  { id: "no-reflection", warning: "Reflection missing", whyItMatters: "Learning is not consolidated.", suggestedFix: "2-minute plenary reflection.", teacherPrompt: "What did you learn and how do you know?" },
  { id: "no-impact", warning: "Teacher cannot evaluate impact", whyItMatters: "Teaching may continue without learning.", suggestedFix: "Collect pupil explanation or performance evidence.", teacherPrompt: "Can this pupil explain what they learned?" },
];

export const VISIBLE_LEARNING_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "visible-learning-master",
  title: "Visible Learning for PE",
  category: "assessment",
  summary: VISIBLE_LEARNING_CORE_MESSAGE,
  keyPrinciples: VISIBLE_LEARNING_FRAMEWORK.map((d) => d.name),
  whyItMattersInPE: "PE teachers need evidence that pupils learned — not only that they were active.",
  whenToUse: ["Lesson planning and review", "WALT/WILF refinement", "Assessment and feedback design", "Scheme impact checkpoints"],
  commonMistakes: VISIBLE_LEARNING_WARNINGS.slice(0, 5).map((w) => w.warning),
  practicalApplications: VISIBLE_LEARNING_FRAMEWORK.slice(0, 4).map((d) => `${d.name}: ${d.coachingExamples[0]}`),
  lessonPlanningPrompts: VISIBLE_LEARNING_FRAMEWORK.flatMap((d) => d.planningPrompts).slice(0, 6),
  assessmentPrompts: VISIBLE_LEARNING_FRAMEWORK.flatMap((d) => d.assessmentPrompts).slice(0, 4),
  differentiationPrompts: VISIBLE_LEARNING_FRAMEWORK.flatMap((d) => d.differentiationImplications).slice(0, 4),
  agePhaseRelevance: ["early-years", "primary", "middle-school", "secondary", "all"],
  pathwayRelevance: ["all"],
  relatedModels: ["teaching-for-learning-master", "learning-science-master", "assessment-for-learning", "learning-intention-clarity"],
  tags: ["visible-learning", "teacher-clarity", "walt", "wilf", "feedback", "impact", "self-evaluation", "progress"],
};

export function isVisibleLearningRelevant(text: string): boolean {
  return /\b(walt|wilf|learning intention|success criteria|visible|feedback|impact|progress|self.?assess|clarity|challenge|evidence)\b/i.test(text);
}

export function getVisibleLearningDomain(id: string): VisibleLearningDomain | undefined {
  return VISIBLE_LEARNING_FRAMEWORK.find((d) => d.id === id);
}
