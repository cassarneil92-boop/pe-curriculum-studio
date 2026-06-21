import type { PEKnowledgeEntry } from "./types";

export const CURRICULUM_DESIGN_ENTRIES: PEKnowledgeEntry[] = [
  {
    id: "scheme-progression-logic",
    title: "Scheme Progression Logic",
    category: "curriculum-design",
    summary:
      "Sequence lessons from introduction through development, application, and consolidation so each lesson builds on prior learning.",
    keyPrinciples: [
      "Introduce before applying; apply before assessing.",
      "Spiral back to prior skills in new contexts.",
      "Every lesson links to at least one curriculum outcome.",
    ],
    whyItMattersInPE:
      "Random activity sequences produce shallow learning. Progression logic aligns schemes with Maltese curriculum expectations.",
    whenToUse: [
      "Scheme Builder planning at term start.",
      "Planning Assistant scheme previews.",
      "Department moderation of SOW quality.",
    ],
    commonMistakes: [
      "Six unrelated sport lessons with no thread.",
      "Assessment before students have practised.",
      "Outcomes clustered only on lesson 1.",
    ],
    practicalApplications: [
      "Lesson 1 intro, 2–4 develop, 5 apply, 6 assess.",
      "Map outcomes across all lessons evenly.",
      "Use sport-specific phase labels in titles.",
    ],
    lessonPlanningPrompts: [
      "What did last lesson prepare for today?",
      "What must today prepare for next lesson?",
    ],
    assessmentPrompts: [
      "Does the final lesson assess what the scheme taught?",
      "Are outcomes distributed across the scheme?",
    ],
    differentiationPrompts: [
      "Build extension paths in lessons 4–5.",
      "Identify catch-up slots in lesson 2 or 3.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["spaced-practice", "whole-part-whole"],
    tags: ["scheme-design", "progression", "outcomes", "planning-assistant"],
  },
  {
    id: "learning-intention-clarity",
    title: "Clear Learning Intentions (WALT)",
    category: "curriculum-design",
    summary:
      "State what students will learn — not only what they will do — in language aligned to curriculum outcomes and age.",
    keyPrinciples: [
      "We are learning to… not We are playing…",
      "One main intention per lesson is ideal.",
      "Success criteria translate intention into evidence.",
    ],
    whyItMattersInPE:
      "Activity without intention feels like babysitting. WALT connects PE to the rest of the curriculum and supports inspection.",
    whenToUse: [
      "Lesson Builder learning design step.",
      "Scheme lesson WALT fields.",
      "Planning Assistant lesson previews.",
    ],
    commonMistakes: [
      "WALT describes activity: we are playing football.",
      "Too many intentions in one lesson.",
      "WALT disconnected from WILF and outcomes.",
    ],
    practicalApplications: [
      "Derive WALT from selected outcome wording.",
      "Share WALT at start; revisit at plenary.",
      "Student-friendly paraphrase on board.",
    ],
    lessonPlanningPrompts: [
      "Can you complete: We are learning to…?",
      "Does WALT match selected curriculum outcomes?",
    ],
    assessmentPrompts: [
      "Can students restate the learning intention?",
      "Does evidence show the intention was met?",
    ],
    differentiationPrompts: [
      "Same intention, tiered success criteria.",
      "Visual WALT for younger or EAL learners.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["assessment-for-learning", "success-criteria-wilf"],
    tags: ["walt", "lesson-builder", "outcomes", "quality-checklist"],
  },
  {
    id: "success-criteria-wilf",
    title: "Success Criteria (WILF)",
    category: "curriculum-design",
    summary:
      "Define observable indicators that show the learning intention has been met — written as I can… statements students understand.",
    keyPrinciples: [
      "Criteria should be checkable during the lesson.",
      "Limit to 2–4 criteria per lesson.",
      "Align wording to official outcomes where possible.",
    ],
    whyItMattersInPE:
      "WILF turns vague expectations into shared standards for self-assessment, peer feedback, and teacher judgement.",
    whenToUse: [
      "Lesson Builder and Scheme Builder WILF fields.",
      "Quality checklist before saving plans.",
      "Assessment rubric design.",
    ],
    commonMistakes: [
      "Criteria too broad: I can play well.",
      "Criteria students cannot see or demonstrate.",
      "Copying outcomes without lesson-specific focus.",
    ],
    practicalApplications: [
      "I can pass accurately to a moving partner.",
      "I can explain when to pass forward vs wide.",
      "Checklist on whiteboard during main activity.",
    ],
    lessonPlanningPrompts: [
      "What would you see if learning succeeded?",
      "Can students self-check each WILF line?",
    ],
    assessmentPrompts: [
      "Which WILF lines have evidence today?",
      "Are criteria fair for all starting points?",
    ],
    differentiationPrompts: [
      "Bronze/silver/gold WILF tiers.",
      "Picture-supported criteria for primary.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["learning-intention-clarity", "assessment-for-learning"],
    tags: ["wilf", "success-criteria", "lesson-builder", "quality-checklist"],
  },
  {
    id: "activity-area-balance",
    title: "Balancing Activity Areas",
    category: "curriculum-design",
    summary:
      "Plan across games, gymnastics, dance, athletics, outdoor, fitness, and aquatics so students develop broad movement competence.",
    keyPrinciples: [
      "Avoid repeating the same activity area all year.",
      "Match activity areas to age and facility access.",
      "Connect areas to pathway requirements.",
    ],
    whyItMattersInPE:
      "Over-focus on one sport narrows physical literacy. Maltese curriculum spans multiple areas across primary and secondary.",
    whenToUse: [
      "Annual curriculum mapping.",
      "Department scheme overview.",
      "Coverage analytics review.",
    ],
    commonMistakes: [
      "Only invasion games because students enjoy them.",
      "Ignoring swimming or outdoor due to logistics.",
      "No plan when hall or weather limits options.",
    ],
    practicalApplications: [
      "Term rotation: games / gymnastics / athletics.",
      "Indoor contingency schemes ready.",
      "Track coverage in curriculum analytics.",
    ],
    lessonPlanningPrompts: [
      "Which activity areas have we under-taught this year?",
      "What facility limits require adaptation?",
    ],
    assessmentPrompts: [
      "Are outcomes from multiple areas evidenced?",
      "Does coverage match pathway expectations?",
    ],
    differentiationPrompts: [
      "Alternative activities within same activity area.",
      "Cross-area schemes linking skills (e.g. throwing in games and athletics).",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["physical-literacy-overview", "malta-curriculum-pathways"],
    tags: ["coverage", "scheme-design", "activity-areas", "curriculum-analytics"],
  },
  {
    id: "lesson-structure-phases",
    title: "Effective Lesson Structure",
    category: "curriculum-design",
    summary:
      "Organise lessons into warm-up, main activity, and cool-down/reflection with appropriate time allocation and transitions.",
    keyPrinciples: [
      "Warm-up links to learning intention.",
      "Main activity is where most learning evidence is generated.",
      "Cool-down includes reflection and AfL.",
    ],
    whyItMattersInPE:
      "Structure supports quality checklists, export formats, and consistent student expectations across the school.",
    whenToUse: [
      "Lesson Builder activities step.",
      "Planning Assistant lesson previews.",
      "Pedagogy model phase mapping (TGfU, WPW).",
    ],
    commonMistakes: [
      "Warm-up unrelated to lesson focus.",
      "No cool-down due to time pressure.",
      "Main activity is only teacher talk.",
    ],
    practicalApplications: [
      "8–10 min warm-up, 35–40 main, 5–8 cool-down for 60 min lesson.",
      "Reflection question on exit.",
      "Structured activities synced to export template.",
    ],
    lessonPlanningPrompts: [
      "Does each phase connect to WALT?",
      "Where is reflection built in?",
    ],
    assessmentPrompts: [
      "Was there time to gather evidence in main phase?",
      "Did plenary check WILF?",
    ],
    differentiationPrompts: [
      "Flexible main activity tiers within same phase.",
      "Shortened warm-up with same link to focus.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["whole-part-whole", "tgfu"],
    tags: ["lesson-structure", "warm-up", "cool-down", "lesson-builder"],
  },
];
