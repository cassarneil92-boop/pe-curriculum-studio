import type { PEKnowledgeEntry } from "./types";

export const PEDAGOGY_MODEL_ENTRIES: PEKnowledgeEntry[] = [
  {
    id: "tgfu",
    title: "Teaching Games for Understanding (TGfU)",
    category: "pedagogy-model",
    summary:
      "Start with modified games, identify tactical problems, then teach skills within game context rather than isolated technique first.",
    keyPrinciples: [
      "Game form reveals what students need to learn.",
      "Questions guide discovery of tactics and decisions.",
      "Skill practice answers problems identified in play.",
    ],
    whyItMattersInPE:
      "Students often ask why we practice passing — TGfU makes the purpose visible through game problems before drilling.",
    whenToUse: [
      "Invasion and net/wall games in upper primary and secondary.",
      "When decision-making is the learning priority.",
      "Units where engagement drops during long drill blocks.",
    ],
    commonMistakes: [
      "Running a full game without modifying rules for the learning focus.",
      "Skipping the tactical problem stage.",
      "No reflection linking practice back to game performance.",
    ],
    practicalApplications: [
      "Small-sided game → freeze → teach one skill → return to game.",
      "Ask: when is the best time to pass? before demonstrating technique.",
      "Use scoring systems that reward the target behaviour.",
    ],
    lessonPlanningPrompts: [
      "What tactical problem will the opening game create?",
      "How will skill practice directly solve that problem?",
    ],
    assessmentPrompts: [
      "Can students explain when and why to use the skill?",
      "Do decisions improve in the modified game?",
    ],
    differentiationPrompts: [
      "Adjust space, equipment, or rules rather than removing game context.",
      "Assign roles (e.g. playmaker) to structure participation.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["primary-pe", "general-pe", "pe-option-sec", "alp-pe"],
    relatedModels: ["constraints-led", "cooperative-learning"],
    tags: ["games", "tactics", "invasion-games", "net-games", "decision-making"],
  },
  {
    id: "sport-education",
    title: "Sport Education Model",
    category: "pedagogy-model",
    summary:
      "Students experience authentic sport through seasons, roles, teams, and culminating events — not only isolated skill lessons.",
    keyPrinciples: [
      "Affiliation and roles increase ownership.",
      "Season structure creates narrative across weeks.",
      "Festivals or tournaments provide meaningful culmination.",
    ],
    whyItMattersInPE:
      "Secondary students often disengage when PE feels like random activities. Seasons build identity, responsibility, and persistence.",
    whenToUse: [
      "Secondary schemes of 6+ lessons.",
      "When teamwork and fair play are curriculum priorities.",
      "ALP sports vocational contexts with league-style delivery.",
    ],
    commonMistakes: [
      "Assigning roles without training or accountability.",
      "No culminating event so the season feels unfinished.",
      "Coach makes all decisions that students could own.",
    ],
    practicalApplications: [
      "Team captains, statisticians, warm-up leaders, equipment managers.",
      "Points for fair play alongside performance.",
      "Mini-league fixtures across the scheme.",
    ],
    lessonPlanningPrompts: [
      "What roles will students hold this week?",
      "How does this lesson fit the season story?",
    ],
    assessmentPrompts: [
      "Are students fulfilling roles responsibly?",
      "Can teams self-manage fair play and rotation?",
    ],
    differentiationPrompts: [
      "Non-playing roles keep all students contributing.",
      "Tiered teams or mixed ability drafting for balance.",
    ],
    agePhaseRelevance: ["middle-school", "secondary"],
    pathwayRelevance: ["general-pe", "pe-option-sec", "alp-pe", "alp-sports-vocational", "sport-values"],
    relatedModels: ["cooperative-learning", "tpsr"],
    tags: ["scheme-design", "teamwork", "secondary-pe", "authenticity"],
  },
  {
    id: "cooperative-learning",
    title: "Cooperative Learning in PE",
    category: "pedagogy-model",
    summary:
      "Structure group work so every student is accountable, supported, and actively involved — not just grouped physically.",
    keyPrinciples: [
      "Positive interdependence: group succeeds together.",
      "Individual accountability: everyone contributes evidence of learning.",
      "Face-to-face interaction with social skills taught explicitly.",
    ],
    whyItMattersInPE:
      "Passive players on the sideline or dominant students monopolising play are common. Cooperative structures distribute participation.",
    whenToUse: [
      "Mixed ability classes.",
      "When social skills and communication are learning outcomes.",
      "Large classes with limited equipment.",
    ],
    commonMistakes: [
      "Grouping without clear roles or success criteria.",
      "Letting one student dominate all touches.",
      "Assuming grouping alone equals cooperation.",
    ],
    practicalApplications: [
      "Passing sequences where every member must touch the ball.",
      "Group challenge scores combined across the team.",
      "Jigsaw: each student masters one part then teaches peers.",
    ],
    lessonPlanningPrompts: [
      "How will you know each student contributed?",
      "What social skill is being taught alongside the physical skill?",
    ],
    assessmentPrompts: [
      "Did all group members meet individual criteria?",
      "Can students give specific praise to a teammate?",
    ],
    differentiationPrompts: [
      "Roles matched to strengths (organiser, encourager, demonstrator).",
      "Smaller groups for students who need more touches.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["sport-education", "inclusion-universal-design"],
    tags: ["group-work", "communication", "mixed-ability", "inclusion"],
  },
  {
    id: "constraints-led",
    title: "Constraints-Led Approach (CLA)",
    category: "pedagogy-model",
    summary:
      "Shape learning by manipulating task, environment, and performer constraints rather than prescribing one correct movement solution.",
    keyPrinciples: [
      "Representative task design mirrors game demands.",
      "Constraint changes reveal or refine behaviour.",
      "Coach observes emergent solutions before intervening.",
    ],
    whyItMattersInPE:
      "No two students move identically. CLA develops adaptable performers who solve movement problems in context.",
    whenToUse: [
      "Skill development in dynamic, open skills.",
      "When isolated technique drills fail to transfer.",
      "Net/wall and invasion game units.",
    ],
    commonMistakes: [
      "Changing too many constraints at once.",
      "Constraints that do not relate to real game demands.",
      "Over-coaching before students explore.",
    ],
    practicalApplications: [
      "Smaller courts to increase rally frequency.",
      "Mandatory two-touch rules to encourage set-up play.",
      "Overload/defend numbers to create passing urgency.",
    ],
    lessonPlanningPrompts: [
      "Which constraint will draw out today's learning focus?",
      "What happens if you change space, time, or numbers?",
    ],
    assessmentPrompts: [
      "Do students adapt movement when constraints shift?",
      "Are solutions functional in the game context?",
    ],
    differentiationPrompts: [
      "Individual constraints (e.g. non-dominant hand) for extension.",
      "Larger goals or slower balls for support.",
    ],
    agePhaseRelevance: ["middle-school", "secondary"],
    pathwayRelevance: ["general-pe", "pe-option-sec", "alp-pe", "alp-sports-vocational"],
    relatedModels: ["tgfu", "non-linear-pedagogy"],
    tags: ["adaptability", "game-design", "skill-development", "tactics"],
  },
  {
    id: "whole-part-whole",
    title: "Whole–Part–Whole",
    category: "pedagogy-model",
    summary:
      "Begin with a whole activity to establish context, isolate a part for focused practice, then return to the whole to apply learning.",
    keyPrinciples: [
      "Whole phase shows why the skill matters.",
      "Part phase allows repetition without losing purpose.",
      "Return to whole checks transfer.",
    ],
    whyItMattersInPE:
      "Isolated drills without context feel meaningless. WPW keeps purpose visible while still allowing technical refinement.",
    whenToUse: [
      "When technique needs refinement but game understanding matters.",
      "Primary and middle school skill introduction.",
      "Assessment preparation in familiar game formats.",
    ],
    commonMistakes: [
      "Spending too long in the part phase.",
      "Whole activity too complex for first exposure.",
      "No clear link when returning to whole.",
    ],
    practicalApplications: [
      "Mini-game → passing pairs → return to mini-game with scoring focus.",
      "Swimming: full stroke swim → leg kick drill → full stroke with cue.",
      "Ask students how the practice helped the game.",
    ],
    lessonPlanningPrompts: [
      "What simplified whole starts the lesson?",
      "How long will the part phase run before returning to whole?",
    ],
    assessmentPrompts: [
      "Is technique visible in the final whole activity?",
      "Can students connect practice to game performance?",
    ],
    differentiationPrompts: [
      "Different part tasks with same whole return.",
      "Partnerships based on complementary needs.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["tgfu", "direct-instruction"],
    tags: ["structure", "technique", "lesson-phases", "transfer"],
  },
  {
    id: "guided-discovery",
    title: "Guided Discovery",
    category: "pedagogy-model",
    summary:
      "Teacher asks questions and sets tasks that lead students to discover solutions rather than delivering all answers upfront.",
    keyPrinciples: [
      "Questions before answers.",
      "Tasks structured so discovery is likely.",
      "Debrief consolidates what was found.",
    ],
    whyItMattersInPE:
      "Discovery builds deeper understanding and ownership — students remember what they figured out.",
    whenToUse: [
      "Tactical and problem-solving lessons.",
      "When students have baseline experience in the activity.",
      "Cool-down reflection and inquiry moments.",
    ],
    commonMistakes: [
      "Questions so vague that students guess randomly.",
      "Discovery tasks that take excessive time.",
      "Skipping debrief so learning stays implicit.",
    ],
    practicalApplications: [
      "Try three ways to get past a defender — which worked best?",
      "How can your team keep possession in this space?",
      "What changed when we made the court smaller?",
    ],
    lessonPlanningPrompts: [
      "What question will students investigate today?",
      "What task makes the answer discoverable?",
    ],
    assessmentPrompts: [
      "Can students articulate what they discovered?",
      "Do they apply the insight in the next activity?",
    ],
    differentiationPrompts: [
      "Provide hint cards for students who stall.",
      "Pair discovery partners strategically.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["inquiry-based", "tgfu"],
    tags: ["inquiry", "questioning", "tactics", "reflection"],
  },
];
