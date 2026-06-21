import type { PEKnowledgeEntry } from "./types";

export const LEARNING_SCIENCE_ENTRIES: PEKnowledgeEntry[] = [
  {
    id: "retrieval-practice",
    title: "Retrieval Practice",
    category: "learning-science",
    summary:
      "Learners strengthen memory and skill recall by actively bringing prior knowledge back to mind rather than only re-reading or re-demonstrating.",
    keyPrinciples: [
      "Low-stakes recall improves long-term retention better than passive review.",
      "Spacing retrieval across lessons beats cramming in one block.",
      "Mix similar skills to build flexible application.",
    ],
    whyItMattersInPE:
      "Students often perform a skill once and assume they know it. Retrieval prompts help transfer technique from drills into game decisions.",
    whenToUse: [
      "Start of lesson warm-ups revisiting last week's focus.",
      "Plenary questions before dismissal.",
      "Scheme mid-unit check lessons.",
    ],
    commonMistakes: [
      "Only asking elite performers to answer.",
      "Using retrieval as a high-stakes test that increases anxiety.",
      "Retrieving facts without linking back to movement.",
    ],
    practicalApplications: [
      "30-second partner quiz on coaching points from previous lesson.",
      "Quick demo challenge: show the pass we learned last week.",
      "Exit ticket: name one tactical decision you improved today.",
    ],
    lessonPlanningPrompts: [
      "What must students remember from the last two lessons?",
      "Where can a 2-minute recall activity sit without reducing activity time?",
    ],
    assessmentPrompts: [
      "Can the student explain the skill in their own words?",
      "Can they perform without coach prompting after 48 hours?",
    ],
    differentiationPrompts: [
      "Offer visual cue cards for students who struggle with verbal recall.",
      "Pair confident recallers with peers for guided rehearsal.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
    pathwayRelevance: ["all"],
    relatedModels: ["spaced-practice", "desirable-difficulties"],
    tags: ["memory", "retention", "plenary", "scheme-progression"],
  },
  {
    id: "spaced-practice",
    title: "Spaced Practice",
    category: "learning-science",
    summary:
      "Distribute practice of the same skill or concept across multiple sessions instead of massing it in a single lesson.",
    keyPrinciples: [
      "Short, repeated exposures build durable learning.",
      "Revisit skills in varied contexts to reduce context-dependent memory.",
      "Plan return points in schemes, not only in single lessons.",
    ],
    whyItMattersInPE:
      "A one-off shooting lesson rarely produces lasting change. Spacing helps motor patterns and tactical understanding stick across a term.",
    whenToUse: [
      "Scheme planning across 4–6 lessons.",
      "Revisiting fundamentals before assessment weeks.",
      "Linking units across terms with spiral returns.",
    ],
    commonMistakes: [
      "Teaching a skill once then moving on permanently.",
      "Spacing without purposeful retrieval — just repeating the same drill.",
      "Assuming spacing means less intensity; quality still matters.",
    ],
    practicalApplications: [
      "Lesson 1 introduce, Lesson 3 revisit, Lesson 5 assess in game context.",
      "Start each lesson with 5 minutes on a scheme-wide non-negotiable skill.",
      "Use a skill tracker visible to students across the unit.",
    ],
    lessonPlanningPrompts: [
      "When will this skill appear again in the next three lessons?",
      "How does today's activity connect to lesson 1 and lesson 6?",
    ],
    assessmentPrompts: [
      "Has performance improved compared with the first exposure?",
      "Can students apply the skill in a new game format?",
    ],
    differentiationPrompts: [
      "Give additional spaced reps in warm-up for students who need more exposure.",
      "Use success criteria that reward progress from baseline, not only final performance.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["retrieval-practice", "whole-part-whole"],
    tags: ["scheme-design", "progression", "motor-learning"],
  },
  {
    id: "cognitive-load-management",
    title: "Cognitive Load Management",
    category: "learning-science",
    summary:
      "Limit the number of new instructions, rules, and decisions presented at once so working memory can focus on movement quality.",
    keyPrinciples: [
      "Introduce one new idea at a time in early learning.",
      "Use external cues (demos, visuals, task cards) to reduce verbal overload.",
      "Remove redundant information once a skill is established.",
    ],
    whyItMattersInPE:
      "Complex games with many rules overwhelm beginners. Managing load keeps students active and successful rather than standing and listening.",
    whenToUse: [
      "Introducing new sports or complex tactics.",
      "Primary lessons with mixed ability.",
      "First lesson of a scheme.",
    ],
    commonMistakes: [
      "Explaining full game rules before students have touched equipment.",
      "Adding tactical layers before technique is stable.",
      "Long static briefings that reduce activity time.",
    ],
    practicalApplications: [
      "Conditioned games with one rule change at a time.",
      "Station rotation with one focus per station.",
      "Show–try–refine cycles instead of extended lectures.",
    ],
    lessonPlanningPrompts: [
      "What is the single most important learning point today?",
      "What can be removed or deferred to a later lesson?",
    ],
    assessmentPrompts: [
      "Are errors caused by overload rather than inability?",
      "Can students follow one cue consistently?",
    ],
    differentiationPrompts: [
      "Reduce rules for some groups while keeping the same objective.",
      "Provide task cards with pictures for EAL learners.",
    ],
    agePhaseRelevance: ["early-years", "primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["constraints-led", "guided-discovery"],
    tags: ["instruction", "beginners", "primary-pe", "differentiation"],
  },
  {
    id: "desirable-difficulties",
    title: "Desirable Difficulties",
    category: "learning-science",
    summary:
      "Introduce manageable challenge that slows immediate performance but improves long-term learning and transfer.",
    keyPrinciples: [
      "Some struggle is productive when success remains achievable.",
      "Varied practice beats blocked repetition for transfer.",
      "Delay feedback occasionally to encourage self-checking.",
    ],
    whyItMattersInPE:
      "Easy success in isolated drills often fails in games. Appropriate difficulty prepares students for real performance conditions.",
    whenToUse: [
      "Moving from technique to application.",
      "Upper primary and secondary tactical lessons.",
      "Preparing for assessment under pressure.",
    ],
    commonMistakes: [
      "Making tasks so hard that students disengage.",
      "Confusing desirable difficulty with random chaos.",
      "Never allowing unopposed success for confidence building.",
    ],
    practicalApplications: [
      "Progressive defender pressure in passing practices.",
      "Smaller goals or tighter spaces to increase decision frequency.",
      "Interleaving two related skills in one session.",
    ],
    lessonPlanningPrompts: [
      "Where is the productive struggle in this lesson?",
      "Does difficulty increase gradually or jump too fast?",
    ],
    assessmentPrompts: [
      "Can students adapt when conditions change mid-task?",
      "Do they self-correct without immediate teacher feedback?",
    ],
    differentiationPrompts: [
      "Offer tiered constraints: same task, different space or opposition.",
      "Allow choice of difficulty level with clear success criteria.",
    ],
    agePhaseRelevance: ["middle-school", "secondary"],
    pathwayRelevance: ["general-pe", "pe-option-sec", "alp-pe", "alp-sports-vocational"],
    relatedModels: ["constraints-led", "challenge-by-choice"],
    tags: ["challenge", "transfer", "tactics", "pressure"],
  },
  {
    id: "feedback-timing",
    title: "Effective Feedback Timing",
    category: "learning-science",
    summary:
      "Match when and how feedback is given to the learning stage — immediate for safety and basics, delayed for decision-making and self-regulation.",
    keyPrinciples: [
      "Immediate feedback supports acquisition; delayed feedback supports retention.",
      "Focus feedback on one or two actionable points.",
      "Peer and self-feedback build autonomy when structured.",
    ],
    whyItMattersInPE:
      "Constant stopping for correction reduces activity levels. Strategic feedback keeps flow while still improving performance.",
    whenToUse: [
      "Skill acquisition phases needing safety correction.",
      "Game phases where students must read and adjust.",
      "Assessment lessons using peer observation.",
    ],
    commonMistakes: [
      "Over-coaching every repetition.",
      "Generic praise without actionable next steps.",
      "Feedback only from teacher, never from peers or self.",
    ],
    practicalApplications: [
      "Two-whistle rule: coach intervenes twice per activity block.",
      "Video or partner observation with one focus question.",
      "Plenary: each student names one thing to improve next lesson.",
    ],
    lessonPlanningPrompts: [
      "Who gives feedback at each stage — teacher, peer, or self?",
      "What is the one cue students should listen for today?",
    ],
    assessmentPrompts: [
      "Can students identify their own error before coach input?",
      "Does feedback lead to visible adjustment in the next attempt?",
    ],
    differentiationPrompts: [
      "Provide sentence stems for peer feedback.",
      "Use visual success criteria so feedback is concrete.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["assessment-for-learning", "cooperative-learning"],
    tags: ["feedback", "coaching", "self-regulation", "peer-assessment"],
  },
];
