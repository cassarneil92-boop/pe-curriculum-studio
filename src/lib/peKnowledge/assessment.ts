import type { PEKnowledgeEntry } from "./types";

export const ASSESSMENT_ENTRIES: PEKnowledgeEntry[] = [
  {
    id: "assessment-for-learning",
    title: "Assessment for Learning (AfL) in PE",
    category: "assessment",
    summary:
      "Use ongoing evidence — observation, questioning, peer feedback — to adjust teaching and help students know what to improve next.",
    keyPrinciples: [
      "Share learning intentions and success criteria clearly.",
      "Feedback moves learning forward, not only grades.",
      "Students self and peer assess with structure.",
    ],
    whyItMattersInPE:
      "PE assessment is often subjective or absent. AfL makes criteria visible and reduces surprise in formal assessment weeks.",
    whenToUse: [
      "Every lesson plenary.",
      "Scheme lessons before summative assessment.",
      "When students don't know what good looks like.",
    ],
    commonMistakes: [
      "Vague criteria: try your best.",
      "Feedback without time to act on it.",
      "Only teacher-led assessment in fast games.",
    ],
    practicalApplications: [
      "WILF displayed and referenced mid-lesson.",
      "Traffic light self-assessment against one criterion.",
      "Stop–improve–retry after peer observation.",
    ],
    lessonPlanningPrompts: [
      "What will students check before the end of the lesson?",
      "When will they receive feedback they can use today?",
    ],
    assessmentPrompts: [
      "Can the student identify the gap between current and target performance?",
      "Is criteria language aligned with curriculum outcomes?",
    ],
    differentiationPrompts: [
      "Tiered success criteria with same intention.",
      "Visual or video models for criteria.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["feedback-timing", "formative-peer-assessment"],
    tags: ["wilf", "walt", "formative", "quality-checklist", "feedback"],
  },
  {
    id: "formative-peer-assessment",
    title: "Structured Peer Assessment",
    category: "assessment",
    summary:
      "Train students to observe one or two criteria and give specific, kind, useful feedback using scaffolds.",
    keyPrinciples: [
      "One focus per observation cycle.",
      "Sentence stems prevent vague comments.",
      "Teach what helpful feedback sounds like.",
    ],
    whyItMattersInPE:
      "Teachers cannot see every student in game play. Peers increase feedback frequency and develop tactical language.",
    whenToUse: [
      "Skill replication and technique phases.",
      "Small-sided games with clear roles.",
      "Secondary option and ALP courses.",
    ],
    commonMistakes: [
      "Unstructured tell your partner what they did wrong.",
      "Peer assessment without modelling.",
      "Using it as a cover for social criticism.",
    ],
    practicalApplications: [
      "Observe one pass — was the head up? yes/no + one tip.",
      "Two stars and a wish on a checklist.",
      "Rotate observer role in group tasks.",
    ],
    lessonPlanningPrompts: [
      "What single criterion will peers observe?",
      "How will you model helpful vs unhelpful feedback?",
    ],
    assessmentPrompts: [
      "Is peer feedback accurate against teacher observation?",
      "Do students apply peer suggestions?",
    ],
    differentiationPrompts: [
      "Provide written stems for EAL or shy students.",
      "Pair strategically for constructive culture.",
    ],
    agePhaseRelevance: ["middle-school", "secondary"],
    pathwayRelevance: ["general-pe", "pe-option-sec", "alp-pe"],
    relatedModels: ["assessment-for-learning", "cooperative-learning"],
    tags: ["peer-assessment", "feedback", "secondary-pe", "observation"],
  },
  {
    id: "summative-pe-assessment",
    title: "Summative Assessment Design in PE",
    category: "assessment",
    summary:
      "End-of-unit assessment should sample curriculum outcomes in representative conditions with transparent criteria and moderation awareness.",
    keyPrinciples: [
      "Assess in context where possible, not only drills.",
      "Use rubrics aligned to official outcomes.",
      "Collect multiple evidence points across the unit.",
    ],
    whyItMattersInPE:
      "Single-lesson snapshots misrepresent learning. Summative design should reflect what the scheme actually taught.",
    whenToUse: [
      "Final lesson of a scheme.",
      "Reporting periods and MATSEC-related courses.",
      "Moderation preparation across departments.",
    ],
    commonMistakes: [
      "Assessing skills never taught in the unit.",
      "Subjective grading without shared rubrics.",
      "Fitness scores used as sole PE grade.",
    ],
    practicalApplications: [
      "Modified game assessment with observation grid.",
      "Recorded evidence portfolio across lessons.",
      "Student self-assessment plus teacher judgement.",
    ],
    lessonPlanningPrompts: [
      "Which outcomes will summative evidence address?",
      "Is the task representative of what was taught?",
    ],
    assessmentPrompts: [
      "Would another teacher agree using the same rubric?",
      "Does the grade reflect outcomes, not attitude alone?",
    ],
    differentiationPrompts: [
      "Alternative evidence modes where appropriate.",
      "Adjusted conditions with documented criteria.",
    ],
    agePhaseRelevance: ["middle-school", "secondary"],
    pathwayRelevance: ["general-pe", "pe-option-sec", "alp-pe", "alp-sports-vocational"],
    relatedModels: ["assessment-for-learning", "holistic-pe-assessment"],
    tags: ["summative", "rubrics", "scheme-design", "reporting"],
  },
  {
    id: "holistic-pe-assessment",
    title: "Holistic PE Assessment",
    category: "assessment",
    summary:
      "Value physical, cognitive, social, and affective learning — not only measurable performance — when judging progress.",
    keyPrinciples: [
      "Multiple domains can be assessed in one lesson.",
      "Social and affective criteria must be explicit.",
      "Avoid conflating behaviour grades with skill grades.",
    ],
    whyItMattersInPE:
      "Maltese curriculum and sport values pathways expect fair play, cooperation, and understanding — not only athletic output.",
    whenToUse: [
      "Sport Values and primary holistic units.",
      "Scheme reports and student conferences.",
      "Lessons with strong teamwork objectives.",
    ],
    commonMistakes: [
      "Effort grades with no criteria.",
      "Ignoring tactical understanding in invasion games.",
      "Assessing only the best performers.",
    ],
    practicalApplications: [
      "Rubric rows for skill, decision, communication, fair play.",
      "Exit questions on rules and strategy.",
      "Teacher notes on leadership and inclusion.",
    ],
    lessonPlanningPrompts: [
      "Which non-physical outcomes are assessable today?",
      "How will you record social/affective evidence?",
    ],
    assessmentPrompts: [
      "Does evidence cover more than one learning domain?",
      "Are sport values visible in assessment criteria?",
    ],
    differentiationPrompts: [
      "Weight domains appropriately for individual profiles.",
      "Allow verbal demonstration of understanding.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["sport-values", "primary-pe", "general-pe"],
    relatedModels: ["physical-literacy-overview", "tpsr"],
    tags: ["holistic", "sport-values", "fair-play", "primary-pe"],
  },
  {
    id: "observation-recording",
    title: "Efficient Observation Recording",
    category: "assessment",
    summary:
      "Use grids, codes, and focused sampling so teachers capture evidence during active lessons without stopping flow.",
    keyPrinciples: [
      "Observe one focus group or criterion per block.",
      "Pre-print grids aligned to outcomes.",
      "Digital or paper — consistency matters more than format.",
    ],
    whyItMattersInPE:
      "If assessment only happens after the lesson, evidence is lost. Lightweight recording supports AfL and reporting.",
    whenToUse: [
      "Game-based assessment lessons.",
      "Large classes.",
      "Scheme data collection for coverage tracking.",
    ],
    commonMistakes: [
      "Trying to record everything at once.",
      "No link between notes and outcome codes.",
      "Assessment stopping student activity.",
    ],
    practicalApplications: [
      "Rotate focus group each lesson.",
      "Simple codes: ✓ / ~ / ✗ against WILF.",
      "Tablet notes tagged to student and outcome.",
    ],
    lessonPlanningPrompts: [
      "Who will you observe during each activity phase?",
      "What grid or code set will you use?",
    ],
    assessmentPrompts: [
      "Is there enough evidence per student for reporting?",
      "Do notes map to curriculum outcome codes?",
    ],
    differentiationPrompts: [
      "Target extra observation for students with unclear progress.",
      "Student self-tracking reduces teacher load.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["assessment-for-learning", "summative-pe-assessment"],
    tags: ["observation", "recording", "coverage", "reporting"],
  },
];
