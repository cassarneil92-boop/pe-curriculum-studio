/**
 * Teaching for Learning Master Pack v1 — original PE pedagogy content.
 * Not copied from copyrighted sources. No fabricated citations.
 */

import type { AgePhase, PEKnowledgeEntry } from "./types";

export type TFLAreaId =
  | "goal-oriented"
  | "learning-experience"
  | "movement-task-design"
  | "task-presentation"
  | "content-development"
  | "practice-time"
  | "teacher-observation"
  | "feedback-quality"
  | "learning-environment"
  | "teaching-strategies"
  | "motivation-inclusion"
  | "planning-unit"
  | "assessment-instruction"
  | "teacher-reflection";

export interface TFLFrameworkArea {
  id: TFLAreaId;
  name: string;
  description: string;
  whyItMattersInPE: string;
  teacherQuestions: string[];
  lessonPlanningImplications: string[];
  commonMistakes: string[];
  practicalFixes: string[];
  assessmentImplications: string[];
  agePhaseRelevance: AgePhase[];
  maltaContextRelevance: string[];
}

export const TEACHING_FOR_LEARNING_CORE_MESSAGE =
  "Teaching for learning asks whether the lesson is a valid learning experience — not only what activity is planned.";

export const TEACHING_FOR_LEARNING_FRAMEWORK: TFLFrameworkArea[] = [
  {
    id: "goal-oriented",
    name: "Goal-oriented teaching",
    description: "Every lesson phase connects clearly to what pupils should learn, not only what they will do.",
    whyItMattersInPE: "Without goals, PE becomes recreation. Goals anchor WALT, WILF, tasks, and feedback.",
    teacherQuestions: ["What will pupils learn today?", "How does each task serve that learning?"],
    lessonPlanningImplications: ["Write WALT before activities", "Link each activity to the learning intention"],
    commonMistakes: ["Activity listed with no learning goal", "WALT describes playing only"],
    practicalFixes: ["Reframe WALT as We are learning to…", "Name the learning in each task introduction"],
    assessmentImplications: ["Evidence must match the stated goal"],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    maltaContextRelevance: ["Aligns with Malta curriculum learning outcomes", "Supports pathway-specific expectations"],
  },
  {
    id: "learning-experience",
    name: "Learning experience quality",
    description: "Tasks are valid when they improve skill, understanding, or engagement with purposeful challenge.",
    whyItMattersInPE: "Busy lessons are not always learning-rich. Quality experiences maximise meaningful practice.",
    teacherQuestions: ["Is this a valid learning experience?", "Will pupils improve from this task?"],
    lessonPlanningImplications: ["Avoid game for fun only without learning focus", "Balance enjoyment with purpose"],
    commonMistakes: ["Game with no tactical or skill focus", "Long passive periods"],
    practicalFixes: ["State the problem the game solves", "Increase active time with small groups"],
    assessmentImplications: ["Observe improvement against WILF during the task"],
    agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
    maltaContextRelevance: ["Hall and yard constraints require efficient learning design"],
  },
  {
    id: "movement-task-design",
    name: "Movement task design",
    description: "Tasks specify content focus, organisation, equipment, challenge, safety, and success criteria.",
    whyItMattersInPE: "Well-designed tasks reduce confusion, increase practice, and make observation purposeful.",
    teacherQuestions: ["Who goes where?", "What defines success?", "What will I watch for?"],
    lessonPlanningImplications: ["Document people, space, equipment, and conditions", "Include observation focus"],
    commonMistakes: ["Vague task description", "One ball for too many pupils"],
    practicalFixes: ["Use pairs or stations", "Add equipment ratio note"],
    assessmentImplications: ["Success criteria visible to pupils and teacher"],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    maltaContextRelevance: ["Adapt for limited hall space and mixed ability classes"],
  },
  {
    id: "task-presentation",
    name: "Task presentation",
    description: "Clear, brief introduction that gains attention, explains purpose, and checks understanding.",
    whyItMattersInPE: "Poor presentation wastes time and leads to unsafe or off-task behaviour.",
    teacherQuestions: ["Is the purpose clear in 30 seconds?", "Did pupils understand before moving?"],
    lessonPlanningImplications: ["Brief demo where useful", "Age-appropriate cues only"],
    commonMistakes: ["Long lecture before activity", "Cues too complex for age"],
    practicalFixes: ["Show-and-play", "One to three key cues maximum"],
    assessmentImplications: ["Quick check for understanding before full practice"],
    agePhaseRelevance: ["early-years", "primary", "middle-school", "secondary"],
    maltaContextRelevance: ["EAL learners benefit from demo and visual organisation"],
  },
  {
    id: "content-development",
    name: "Content development",
    description: "Progress through extension, refinement, and application — not random difficulty jumps.",
    whyItMattersInPE: "Structured development builds competence before performance pressure.",
    teacherQuestions: ["Are we extending, refining, or applying?", "Is the sequence logical?"],
    lessonPlanningImplications: ["Plan extension before application", "Add refinement cues before games"],
    commonMistakes: ["Jump to full game too early", "Only extension with no quality focus"],
    practicalFixes: ["Insert one refinement block", "Simplify before complex application"],
    assessmentImplications: ["Application phase provides best performance evidence"],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    maltaContextRelevance: ["Spiral skills across Malta scheme blocks"],
  },
  {
    id: "practice-time",
    name: "Practice time and success rate",
    description: "Maximise active, successful repetitions with appropriate challenge.",
    whyItMattersInPE: "Learning requires sufficient quality practice — waiting lines destroy progress.",
    teacherQuestions: ["How many pupils are active at once?", "Can most succeed at this challenge?"],
    lessonPlanningImplications: ["Multiple stations or small groups", "Adjust task so ~70% success rate"],
    commonMistakes: ["Long relay queues", "Task too easy or too hard for most"],
    practicalFixes: ["Replace lines with parallel stations", "Offer easier and harder routes"],
    assessmentImplications: ["Success rate indicates task difficulty calibration"],
    agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
    maltaContextRelevance: ["Large classes need high organisation efficiency"],
  },
  {
    id: "teacher-observation",
    name: "Teacher observation",
    description: "Purposeful watching for errors, safety, learning evidence, and when to progress or simplify.",
    whyItMattersInPE: "Feedback and progression depend on what the teacher notices during practice.",
    teacherQuestions: ["What will I observe first?", "Who may need support?"],
    lessonPlanningImplications: ["Write observation focus per activity", "Position for visibility"],
    commonMistakes: ["Managing equipment instead of observing", "No planned look-fors"],
    practicalFixes: ["One observation priority per task", "Brief freeze for common error"],
    assessmentImplications: ["Observation notes become assessment evidence"],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    maltaContextRelevance: ["Pool and hall layouts affect sight lines"],
  },
  {
    id: "feedback-quality",
    name: "Feedback quality",
    description: "Specific, timely, congruent feedback linked to cues and learning goals — not only good job.",
    whyItMattersInPE: "Quality feedback closes the loop between performance and improvement.",
    teacherQuestions: ["Is feedback specific to the goal?", "Does the pupil know what to try next?"],
    lessonPlanningImplications: ["Plan feedback prompts", "Balance positive and corrective"],
    commonMistakes: ["Vague praise only", "Too much feedback at once"],
    practicalFixes: ["One cue per feedback moment", "Ask what did you notice?"],
    assessmentImplications: ["Feedback moments are formative assessment"],
    agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
    maltaContextRelevance: ["Peer feedback supports mixed ability and LSA contexts"],
  },
  {
    id: "learning-environment",
    name: "Learning environment",
    description: "Routines, safety, transitions, equipment access, and positive emotional climate.",
    whyItMattersInPE: "Poor environment reduces practice time and confidence.",
    teacherQuestions: ["Are transitions efficient?", "Is equipment safe and accessible?"],
    lessonPlanningImplications: ["Plan setup before pupils arrive", "Assign equipment roles"],
    commonMistakes: ["Chaotic equipment distribution", "Unclear boundaries"],
    practicalFixes: ["Pre-set stations", "Visual safety reminders"],
    assessmentImplications: ["Safe environment enables honest effort and assessment"],
    agePhaseRelevance: ["early-years", "primary", "middle-school", "secondary", "all"],
    maltaContextRelevance: ["Outdoor heat and indoor hall rotation require clear routines"],
  },
  {
    id: "teaching-strategies",
    name: "Teaching strategies",
    description: "Match strategy to goal — direct instruction, stations, guided discovery, cooperative learning, etc.",
    whyItMattersInPE: "One strategy does not fit all lessons. Choice affects engagement and learning.",
    teacherQuestions: ["Which strategy best serves today's goal?", "What is my role during this phase?"],
    lessonPlanningImplications: ["Name strategy in plan", "Match strategy to class size and space"],
    commonMistakes: ["Whole-class drill when stations would work", "Discovery with no structure"],
    practicalFixes: ["Use stations for mixed ability", "Use guided questions for tactical lessons"],
    assessmentImplications: ["Strategy affects how evidence is collected"],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    maltaContextRelevance: ["Station teaching suits large Maltese class groups"],
  },
  {
    id: "motivation-inclusion",
    name: "Motivation and inclusion",
    description: "Autonomy, success routes, and access so all learners can engage with the learning goal.",
    whyItMattersInPE: "Excluded or unmotivated pupils do not learn — regardless of task quality.",
    teacherQuestions: ["Can every pupil succeed?", "Are there multiple routes to the goal?"],
    lessonPlanningImplications: ["Document differentiation", "Avoid winner-takes-all structures"],
    commonMistakes: ["Single pathway to success", "Public ranking"],
    practicalFixes: ["Personal best criteria", "Role rotation"],
    assessmentImplications: ["Assess progress not only rank"],
    agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
    maltaContextRelevance: ["Inclusive PE aligns with SEND and mixed ability Maltese classrooms"],
  },
  {
    id: "planning-unit",
    name: "Planning and unit design",
    description: "Coherent schemes where lessons build through extension, refinement, application, and assessment.",
    whyItMattersInPE: "Isolated strong lessons do not guarantee unit learning without progression logic.",
    teacherQuestions: ["How does this lesson fit the unit?", "Where is retrieval and transfer?"],
    lessonPlanningImplications: ["Map unit sequence", "Plan assessment checkpoints"],
    commonMistakes: ["Repeated same lesson", "No final consolidation"],
    practicalFixes: ["Label each lesson E/R/A type", "Add assessment game at unit end"],
    assessmentImplications: ["Unit rubric spans multiple lessons"],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    maltaContextRelevance: ["Scheme of work aligns with Malta syllabus blocks"],
  },
  {
    id: "assessment-instruction",
    name: "Assessment in instruction",
    description: "Practical formative assessment woven into activity — not only end-of-lesson tests.",
    whyItMattersInPE: "Busy PE needs quick observation, peer check, and exit reflection.",
    teacherQuestions: ["When will I collect evidence?", "Can pupils self-check against WILF?"],
    lessonPlanningImplications: ["Plan 30-second assessment moments", "Include exit reflection"],
    commonMistakes: ["No evidence plan", "Assessment unrelated to WALT"],
    practicalFixes: ["Quick observation checklist", "One exit question"],
    assessmentImplications: ["Physical, cognitive, social, affective evidence where relevant"],
    agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
    maltaContextRelevance: ["Supports curriculum outcome documentation for Maltese schools"],
  },
  {
    id: "teacher-reflection",
    name: "Teacher reflection",
    description: "Post-lesson review of learning achieved, task effectiveness, inclusion, and next steps.",
    whyItMattersInPE: "Reflection improves the next lesson and builds professional judgement.",
    teacherQuestions: ["Which task produced clearest learning?", "What adjust next time?"],
    lessonPlanningImplications: ["Note reflection after delivery", "Use prompts from this pack"],
    commonMistakes: ["No reflection recorded", "Only noting behaviour issues"],
    practicalFixes: ["Two-minute plenary reflection", "Journal one strength and one change"],
    assessmentImplications: ["Reflection informs summative judgement over time"],
    agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
    maltaContextRelevance: ["Supports CPD and faculty moderation in Maltese colleges"],
  },
];

export type ContentDevelopmentType = "extension" | "refinement" | "application" | "unclear";

export const CONTENT_DEVELOPMENT_MODEL = {
  extension: {
    label: "Extension",
    description: "Expanding or progressing the task — more complexity, distance, opposition, or decisions.",
    examples: ["Add defender", "Increase distance", "More players or rules"],
  },
  refinement: {
    label: "Refinement",
    description: "Improving quality — key cues, body shape, timing, control, accuracy, decision quality.",
    examples: ["One or two teaching cues", "Quality focus before speed", "Partner feedback on form"],
  },
  application: {
    label: "Application",
    description: "Applying skill in realistic context — game, routine, challenge, or performance task.",
    examples: ["Small-sided game", "Assessment task", "Combined sequence in context"],
  },
};

export const TEACHING_FOR_LEARNING_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "teaching-for-learning-master",
  title: "Teaching for Learning — Valid learning experiences",
  category: "learning-science",
  summary: TEACHING_FOR_LEARNING_CORE_MESSAGE,
  keyPrinciples: TEACHING_FOR_LEARNING_FRAMEWORK.slice(0, 6).map((a) => a.name),
  whyItMattersInPE:
    "Helps teachers move from activity planning to learning design — task quality, progression, feedback, and assessment in instruction.",
  whenToUse: ["Every lesson and scheme review", "Quality checklist and Pedagogy Coach", "Planning Assistant prompts"],
  commonMistakes: TEACHING_FOR_LEARNING_FRAMEWORK.flatMap((a) => a.commonMistakes).slice(0, 6),
  practicalApplications: TEACHING_FOR_LEARNING_FRAMEWORK.flatMap((a) => a.practicalFixes).slice(0, 6),
  lessonPlanningPrompts: TEACHING_FOR_LEARNING_FRAMEWORK.flatMap((a) => a.teacherQuestions).slice(0, 6),
  assessmentPrompts: TEACHING_FOR_LEARNING_FRAMEWORK.flatMap((a) => a.assessmentImplications).slice(0, 4),
  differentiationPrompts: [
    "Multiple stations to increase practice time",
    "Easier and harder routes to same learning goal",
    "Peer or self assessment against WILF",
  ],
  agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
  pathwayRelevance: ["all"],
  relatedModels: ["lesson-structure-phases", "assessment-for-learning", "guided-discovery"],
  tags: ["teaching-for-learning", "task-design", "feedback", "assessment", "planning", "practice-time"],
};

export function getTFLAreaById(id: TFLAreaId): TFLFrameworkArea | undefined {
  return TEACHING_FOR_LEARNING_FRAMEWORK.find((a) => a.id === id);
}
