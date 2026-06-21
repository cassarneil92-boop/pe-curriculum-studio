import type { PEKnowledgeEntry } from "./types";

export const MALTA_CONTEXT_ENTRIES: PEKnowledgeEntry[] = [
  {
    id: "malta-curriculum-pathways",
    title: "Maltese PE Curriculum Pathways",
    category: "malta-context",
    summary:
      "Malta's PE curriculum spans Early Years, Primary PE, General Secondary PE, PE Option, ALP, Fitness, and Sport Values — each with distinct emphasis and outcomes.",
    keyPrinciples: [
      "Pathway selection determines visible outcomes in the app.",
      "Primary and secondary outcomes are not interchangeable.",
      "ALP and vocational pathways include applied sport contexts.",
    ],
    whyItMattersInPE:
      "Teachers must align schemes to the correct pathway or coverage reports and assistant suggestions will mismatch official expectations.",
    whenToUse: [
      "Scheme setup pathway selection.",
      "Planning Assistant queries with Form/Year groups.",
      "Curriculum coverage and analytics review.",
    ],
    commonMistakes: [
      "Using secondary outcomes for primary classes.",
      "Ignoring Sport Values when teaching fair play.",
      "Mixing ALP and General PE outcomes without intent.",
    ],
    practicalApplications: [
      "Verify pathway in Scheme Builder before adding outcomes.",
      "Use Curriculum Hub multi-select when schemes span pathways.",
      "Tag sport values lessons explicitly.",
    ],
    lessonPlanningPrompts: [
      "Which Maltese pathway does this class follow?",
      "Are selected outcomes visible for this pathway and year?",
    ],
    assessmentPrompts: [
      "Does evidence map to pathway-specific outcomes?",
      "Are Form 3–5 classes using correct secondary bands?",
    ],
    differentiationPrompts: [
      "ALP students may need applied vocational contexts.",
      "Primary differentiation within Primary PE outcomes only.",
    ],
    agePhaseRelevance: ["early-years", "primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["activity-area-balance", "malta-year-group-forms"],
    tags: ["malta", "pathways", "curriculum", "scheme-builder", "planning-assistant"],
  },
  {
    id: "malta-year-group-forms",
    title: "Malta Year Groups and Forms",
    category: "malta-context",
    summary:
      "Maltese schools use Year 1–11 and Form 3–5 labels; Year 9 aligns with Form 3, through Year 11 / Form 5 at secondary.",
    keyPrinciples: [
      "Year group drives outcome filtering in the curriculum database.",
      "Form labels in teacher language should map to year groups.",
      "Primary (Y1–6), Middle (Y7–8), Secondary (Y9–11) bands differ pedagogically.",
    ],
    whyItMattersInPE:
      "Planning Assistant and Lesson Builder use year group to filter outcomes — wrong mapping produces wrong suggestions.",
    whenToUse: [
      "Natural language planning queries.",
      "Teacher profile year group defaults.",
      "Cross-phase primary/secondary departments.",
    ],
    commonMistakes: [
      "Treating Form 5 as Year 5.",
      "Planning secondary content for primary year groups.",
      "Ignoring middle school as distinct phase.",
    ],
    practicalApplications: [
      "Confirm year group in scheme setup.",
      "Use Form labels in speech; app maps to year IDs.",
      "Check Planning Assistant detected context card.",
    ],
    lessonPlanningPrompts: [
      "Is the year group correct for this class?",
      "Does language in WALT match student age?",
    ],
    assessmentPrompts: [
      "Are outcomes tagged to the correct year band?",
      "Does reporting use correct year/form label?",
    ],
    differentiationPrompts: [
      "Middle school may need bridge between primary and secondary styles.",
      "Form 5 may need exam-course alignment where applicable.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["malta-curriculum-pathways", "primary-motor-development"],
    tags: ["malta", "year-groups", "form-3", "form-5", "planning-assistant"],
  },
  {
    id: "malta-facilities-context",
    title: "Planning for Maltese School Facilities",
    category: "malta-context",
    summary:
      "Many Maltese schools share halls, yards, and limited swimming access — plans should include contingencies for space, heat, and timetabling.",
    keyPrinciples: [
      "Indoor alternatives ready for heat or rain.",
      "Hall size limits game formats.",
      "Swimming and outdoor units need advance booking.",
    ],
    whyItMattersInPE:
      "Lessons fail when they assume ideal facilities. Local context awareness keeps schemes deliverable.",
    whenToUse: [
      "Scheme planning at term start.",
      "Lesson Builder equipment and space fields.",
      "Planning Assistant resource suggestions.",
    ],
    commonMistakes: [
      "Full-pitch games planned for small halls.",
      "No wet weather unit alternative.",
      "Assuming pool access without confirmation.",
    ],
    practicalApplications: [
      "Hall-friendly small-sided games.",
      "Fitness circuits needing minimal equipment.",
      "Shared calendar for pool and hall slots.",
    ],
    lessonPlanningPrompts: [
      "What is the smallest space this lesson needs?",
      "What is the wet weather backup?",
    ],
    assessmentPrompts: [
      "Can assessment run in available space?",
      "Are safety margins adequate for hall walls?",
    ],
    differentiationPrompts: [
      "Reduce playing area before reducing learning intention.",
      "Equipment-light variants for limited storage.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["lesson-structure-phases", "activity-area-balance"],
    tags: ["facilities", "malta", "hall", "weather", "resources"],
  },
  {
    id: "malta-sport-culture",
    title: "Maltese Sport and Community Context",
    category: "malta-context",
    summary:
      "Connect PE to local sport interests — football, waterpolo, handball, athletics, and community clubs — to increase relevance without replacing curriculum breadth.",
    keyPrinciples: [
      "Local passion can hook engagement if linked to learning.",
      "Still teach breadth beyond popular sports.",
      "Community clubs vary by locality — signpost generically.",
    ],
    whyItMattersInPE:
      "Students engage when PE feels connected to Maltese life. Use culture as context, not as the whole curriculum.",
    whenToUse: [
      "Invasion and net games units.",
      "Active for life plenaries.",
      "Secondary motivation when engagement drops.",
    ],
    commonMistakes: [
      "Only football all year because of student interest.",
      "Assuming all students share same sporting interests.",
      "No reference to girls' and diverse participation routes.",
    ],
    practicalApplications: [
      "Use local club examples in WALT relevance.",
      "Handball and netball alongside football.",
      "Invite community coaches where school policy allows.",
    ],
    lessonPlanningPrompts: [
      "What local context makes this unit meaningful?",
      "Are multiple Maltese sport traditions represented over the year?",
    ],
    assessmentPrompts: [
      "Do students connect learning to community opportunities?",
      "Is breadth maintained across activity areas?",
    ],
    differentiationPrompts: [
      "Offer examples beyond single popular sports.",
      "Include non-team activities valued locally (swimming, walking).",
    ],
    agePhaseRelevance: ["middle-school", "secondary"],
    pathwayRelevance: ["general-pe", "alp-pe", "alp-sports-vocational", "sport-values"],
    relatedModels: ["motivation-relevance", "active-for-life"],
    tags: ["malta", "community", "football", "handball", "engagement"],
  },
  {
    id: "malta-inspection-readiness",
    title: "Inspection-Ready PE Documentation",
    category: "malta-context",
    summary:
      "Maintain clear WALT, WILF, outcome links, assessment evidence, and scheme progression so PE practice is visible to coordinators and visitors.",
    keyPrinciples: [
      "Curriculum alignment visible in saved schemes and lessons.",
      "Assessment evidence not only in teacher memory.",
      "Pedagogical intent documented lightly but clearly.",
    ],
    whyItMattersInPE:
      "Coordinators and inspection frameworks expect planning to match delivery. The app's Quality Checklist supports this habit.",
    whenToUse: [
      "Before saving lessons and schemes.",
      "Department moderation weeks.",
      "Coverage analytics before reporting.",
    ],
    commonMistakes: [
      "Generic WALT copied across lessons.",
      "Outcomes selected but not assessed.",
      "Schemes with empty activity structures.",
    ],
    practicalApplications: [
      "Run quality checklist before export.",
      "Ensure each lesson has ≥1 outcome.",
      "Note pedagogical model on scheme lens.",
    ],
    lessonPlanningPrompts: [
      "Could a colleague understand your intent from this plan?",
      "Is assessment evidence described?",
    ],
    assessmentPrompts: [
      "Are outcome codes traceable in the plan?",
      "Is there a consolidation or assessment lesson?",
    ],
    differentiationPrompts: [
      "Document differentiation approach briefly.",
      "Show inclusive adaptations in plan.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["learning-intention-clarity", "scheme-progression-logic", "observation-recording"],
    tags: ["quality-checklist", "documentation", "inspection", "coordinator"],
  },
];
