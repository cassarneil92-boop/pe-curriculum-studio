import type { PEKnowledgeEntry } from "./types";

export const PHYSICAL_LITERACY_ENTRIES: PEKnowledgeEntry[] = [
  {
    id: "physical-literacy-overview",
    title: "Physical Literacy — Holistic Movement Competence",
    category: "physical-literacy",
    summary:
      "Physical literacy is the motivation, confidence, physical competence, knowledge, and understanding to value and take responsibility for engagement in physical activities for life.",
    keyPrinciples: [
      "Motivation and confidence are as important as motor skill.",
      "Competence develops across diverse movement contexts.",
      "Knowledge and understanding support lifelong participation.",
    ],
    whyItMattersInPE:
      "Curriculum outcomes often focus on performance. Physical literacy reminds teachers to develop the whole person — not only the ablest movers.",
    whenToUse: [
      "Scheme planning across multiple activity areas.",
      "When students avoid PE due to low confidence.",
      "Primary and middle years foundation units.",
    ],
    commonMistakes: [
      "Equating physical literacy with elite performance.",
      "Ignoring affective domains in assessment.",
      "Only offering competitive team sports.",
    ],
    practicalApplications: [
      "Balance competitive, cooperative, and individual activities in a scheme.",
      "Student goal-setting on confidence as well as skill.",
      "Expose students to aquatic, outdoor, and expressive movement.",
    ],
    lessonPlanningPrompts: [
      "Which element of physical literacy does this lesson develop?",
      "How will less confident students experience success?",
    ],
    assessmentPrompts: [
      "Has confidence or motivation shifted, not only technique?",
      "Can students explain why an activity benefits their health?",
    ],
    differentiationPrompts: [
      "Offer movement choices within the same learning intention.",
      "Celebrate personal progress, not only comparative ranking.",
    ],
    agePhaseRelevance: ["early-years", "primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["fundamental-movement-skills", "motivation-autonomy"],
    tags: ["lifelong-participation", "confidence", "holistic", "primary-pe"],
  },
  {
    id: "fundamental-movement-skills",
    title: "Fundamental Movement Skills (FMS)",
    category: "physical-literacy",
    summary:
      "Locomotor, stability, and object-control skills form the foundation for more specialised sport and physical activity participation.",
    keyPrinciples: [
      "FMS should be taught explicitly before assuming they develop naturally.",
      "Quality matters more than speed in early development.",
      "FMS underpin sport-specific skills later.",
    ],
    whyItMattersInPE:
      "Students who skip FMS development struggle in secondary sport units. Strong foundations reduce injury risk and increase participation.",
    whenToUse: [
      "Early years and primary PE.",
      "Intervention groups in middle school.",
      "Warm-ups in any scheme needing movement quality.",
    ],
    commonMistakes: [
      "Rushing to sport-specific skills too early.",
      "Only practising FMS in isolation without application.",
      "Neglecting object control for locomotor skills.",
    ],
    practicalApplications: [
      "Run–jump–throw progressions in athletics units.",
      "Balance and rotation stations in gymnastics.",
      "Throwing and catching progressions before invasion games.",
    ],
    lessonPlanningPrompts: [
      "Which FMS category is today's focus?",
      "Where will students apply this skill in a game or challenge?",
    ],
    assessmentPrompts: [
      "Is movement controlled and efficient?",
      "Can the student combine FMS in a simple sequence?",
    ],
    differentiationPrompts: [
      "Reduce distance or speed while maintaining form focus.",
      "Use larger or softer equipment for object control.",
    ],
    agePhaseRelevance: ["early-years", "primary", "middle-school"],
    pathwayRelevance: ["early-years-pe", "primary-pe", "general-pe"],
    relatedModels: ["physical-literacy-overview", "whole-part-whole"],
    tags: ["fundamentals", "primary-pe", "motor-development", "progression"],
  },
  {
    id: "movement-confidence",
    title: "Building Movement Confidence",
    category: "physical-literacy",
    summary:
      "Confidence grows when students experience success, perceive competence, and feel safe to attempt new movements without fear of ridicule.",
    keyPrinciples: [
      "Success experiences must be achievable and visible.",
      "Peer culture strongly affects willingness to try.",
      "Teacher language shapes self-perception.",
    ],
    whyItMattersInPE:
      "Anxious students opt out, modify effort, or avoid changing. Confidence work unlocks participation and honest assessment.",
    whenToUse: [
      "Swimming, gymnastics, and dance where exposure feels risky.",
      "New activities at the start of a scheme.",
      "Classes with visible ability gaps.",
    ],
    commonMistakes: [
      "Public comparison of performance.",
      "Forcing participation without gradual exposure.",
      "Ignoring students who hide at the back.",
    ],
    practicalApplications: [
      "Personal best challenges instead of class rankings.",
      "Private self-assessment before public sharing.",
      "Celebrate attempt and improvement explicitly.",
    ],
    lessonPlanningPrompts: [
      "Where can every student succeed in the first 10 minutes?",
      "How will you protect dignity during demonstrations?",
    ],
    assessmentPrompts: [
      "Is the student willing to attempt the skill?",
      "Has self-reported confidence changed across the unit?",
    ],
    differentiationPrompts: [
      "Alternative roles or modified tasks with same learning intention.",
      "Optional progression levels students choose.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["motivation-autonomy", "inclusion-universal-design"],
    tags: ["confidence", "affective", "swimming", "gymnastics", "inclusion"],
  },
  {
    id: "active-for-life",
    title: "Active for Life Pathways",
    category: "physical-literacy",
    summary:
      "PE should connect school experience to community sport, recreation, fitness, and outdoor activity beyond the classroom.",
    keyPrinciples: [
      "Expose students to diverse activity types.",
      "Teach how to participate, not only how to win.",
      "Link to local clubs, facilities, and Maltese sport culture.",
    ],
    whyItMattersInPE:
      "Students who only experience school sport may drop out at 16. Showing pathways sustains health and community engagement.",
    whenToUse: [
      "End of scheme plenaries.",
      "Secondary option and ALP courses.",
      "Fitness and outdoor education units.",
    ],
    commonMistakes: [
      "Assuming students know where to play outside school.",
      "Only promoting elite pathways.",
      "No follow-up information after taster sessions.",
    ],
    practicalApplications: [
      "Signpost local clubs and free community sessions.",
      "Taster rotations: fitness, recreational games, outdoor activity.",
      "Homework: try one active pursuit and reflect.",
    ],
    lessonPlanningPrompts: [
      "What could a student do this weekend related to today's lesson?",
      "Which local opportunities connect to this activity area?",
    ],
    assessmentPrompts: [
      "Can students identify an activity they might continue?",
      "Do they understand basic participation rules outside school?",
    ],
    differentiationPrompts: [
      "Suggest low-cost home or neighbourhood options.",
      "Include non-club activities (walking, swimming, cycling).",
    ],
    agePhaseRelevance: ["middle-school", "secondary"],
    pathwayRelevance: ["general-pe", "pe-option-sec", "fitness-curriculum", "alp-pe"],
    relatedModels: ["malta-curriculum-pathways", "motivation-relevance"],
    tags: ["lifelong-participation", "community", "secondary-pe", "health"],
  },
];
