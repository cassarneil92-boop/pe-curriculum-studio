import type { PEKnowledgeEntry } from "./types";

export const CHILD_DEVELOPMENT_ENTRIES: PEKnowledgeEntry[] = [
  {
    id: "primary-motor-development",
    title: "Primary Motor Development",
    category: "child-development",
    summary:
      "Children aged 5–11 develop coordination, balance, and object control at varying rates — instruction must match developmental stage not age alone.",
    keyPrinciples: [
      "Development is non-linear; avoid labelling too early.",
      "Short attention spans need frequent task changes.",
      "Play-based learning supports motor exploration.",
    ],
    whyItMattersInPE:
      "Year 5 students are not mini-secondary athletes. Primary PE should build FMS and joy before specialised tactics.",
    whenToUse: [
      "Year 1–6 lesson and scheme planning.",
      "Primary PE pathway units.",
      "Differentiating expectations by stage not grade alone.",
    ],
    commonMistakes: [
      "Full sport rules before basic control.",
      "Long lines waiting for one turn.",
      "Adult-sized equipment for small hands.",
    ],
    practicalApplications: [
      "Station work with 3–4 minute rotations.",
      "Smaller balls, lower nets, shorter pitches.",
      "Story-based movement for early primary.",
    ],
    lessonPlanningPrompts: [
      "Is task complexity right for this age band?",
      "How much waiting time will there be?",
    ],
    assessmentPrompts: [
      "Are criteria developmental, not elite?",
      "Is progress measured from individual baseline?",
    ],
    differentiationPrompts: [
      "Equipment sizes matched to hand/foot size.",
      "Simplified rules with same movement goal.",
    ],
    agePhaseRelevance: ["early-years", "primary"],
    pathwayRelevance: ["early-years-pe", "primary-pe"],
    relatedModels: ["fundamental-movement-skills", "cognitive-load-management"],
    tags: ["primary-pe", "motor-development", "year-1", "year-5", "fundamentals"],
  },
  {
    id: "adolescent-growth-pe",
    title: "Adolescent Growth and PE",
    category: "child-development",
    summary:
      "Rapid growth, hormonal change, and self-consciousness affect coordination, confidence, and willingness to participate in PE.",
    keyPrinciples: [
      "Temporary clumsiness during growth spurts is normal.",
      "Body image sensitivity peaks in adolescence.",
      "Sleep, nutrition, and stress affect performance.",
    ],
    whyItMattersInPE:
      "Middle and secondary teachers may misread awkwardness as lack of effort. Developmental awareness protects dignity and motivation.",
    whenToUse: [
      "Year 7–11 gymnastics, swimming, fitness.",
      "Changing room and kit-sensitive lessons.",
      "Fitness testing interpretation.",
    ],
    commonMistakes: [
      "Public body comparison during fitness tests.",
      "Expecting uniform coordination across same-age class.",
      "Ignoring menstrual cycle impact on participation.",
    ],
    practicalApplications: [
      "Private fitness tracking where possible.",
      "Flexible kit and participation options.",
      "Re-teach coordination without embarrassment.",
    ],
    lessonPlanningPrompts: [
      "Could any activity increase self-consciousness?",
      "Are fitness norms age-appropriate and explained?",
    ],
    assessmentPrompts: [
      "Are growth-related dips interpreted fairly?",
      "Is assessment dignified for adolescent learners?",
    ],
    differentiationPrompts: [
      "Alternative demonstrations or roles.",
      "Modified uniform expectations per school policy.",
    ],
    agePhaseRelevance: ["middle-school", "secondary"],
    pathwayRelevance: ["general-pe", "pe-option-sec", "fitness-curriculum"],
    relatedModels: ["movement-confidence", "inclusion-gender-equity"],
    tags: ["secondary-pe", "year-7", "year-9", "fitness", "wellbeing"],
  },
  {
    id: "attention-and-transitions",
    title: "Attention and Transitions",
    category: "child-development",
    summary:
      "Manage attention spans, transitions, and routines differently across age groups to maximise activity time and reduce behaviour issues.",
    keyPrinciples: [
      "Younger children need shorter blocks and clear signals.",
      "Predictable routines reduce anxiety and disruption.",
      "Transitions are teachable classroom management skills.",
    ],
    whyItMattersInPE:
      "Lost minutes in changing and setup reduce learning. Developmentally appropriate routines keep PE purposeful.",
    whenToUse: [
      "Primary and Year 7 induction schemes.",
      "Large group hall or yard lessons.",
      "First weeks of term.",
    ],
    commonMistakes: [
      "Complex instructions after every transition.",
      "No signal for stop, listen, move.",
      "Assuming older students need no routine.",
    ],
    practicalApplications: [
      "Visual timer for station rotations.",
      "Equipment monitors and setup roles.",
      "Same warm-up ritual each lesson.",
    ],
    lessonPlanningPrompts: [
      "How will students move between activities?",
      "What signal stops play instantly?",
    ],
    assessmentPrompts: [
      "Is lost time reducing evidence collection?",
      "Do routines support inclusion?",
    ],
    differentiationPrompts: [
      "Visual schedule for students who need predictability.",
      "Pre-warning before transitions.",
    ],
    agePhaseRelevance: ["early-years", "primary", "middle-school"],
    pathwayRelevance: ["all"],
    relatedModels: ["cognitive-load-management", "inclusion-send-pe"],
    tags: ["behaviour", "primary-pe", "transitions", "management"],
  },
  {
    id: "social-emotional-pe",
    title: "Social-Emotional Development in PE",
    category: "child-development",
    summary:
      "PE develops cooperation, emotion regulation, and resilience — especially when teachers name and teach social skills explicitly.",
    keyPrinciples: [
      "Conflict in games is a learning opportunity.",
      "Emotion regulation supports fair play.",
      "Primary years build sharing; secondary builds leadership.",
    ],
    whyItMattersInPE:
      "Social skills transfer to wider school life. Sport Values and TPSR pathways expect explicit social-emotional teaching.",
    whenToUse: [
      "Competitive lessons and tournaments.",
      "Sport Values pathway schemes.",
      "When friction appears in group work.",
    ],
    commonMistakes: [
      "Assuming fair play develops without teaching.",
      "Punishing loss of temper without repair strategy.",
      "Ignoring social learning in favour of skill only.",
    ],
    practicalApplications: [
      "Fair play debrief after games.",
      "Repair protocol: stop, breathe, resolve.",
      "Leadership roles rotating weekly.",
    ],
    lessonPlanningPrompts: [
      "What social skill is being taught today?",
      "How will you handle conflict if it arises?",
    ],
    assessmentPrompts: [
      "Can students evaluate fair behaviour?",
      "Is social progress noted alongside skill?",
    ],
    differentiationPrompts: [
      "Social scripts for students who struggle with conflict.",
      "Smaller groups to reduce social overload.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["sport-values", "primary-pe", "general-pe"],
    relatedModels: ["tpsr", "motivation-relatedness"],
    tags: ["social-skills", "fair-play", "sport-values", "behaviour"],
  },
  {
    id: "early-years-movement-play",
    title: "Early Years Movement Play",
    category: "child-development",
    summary:
      "Young children learn through exploratory play, sensory experience, and short joyful activities — not formal sport instruction.",
    keyPrinciples: [
      "Play is the primary medium for learning.",
      "Safety and supervision without over-restriction.",
      "Language-rich movement stories and songs.",
    ],
    whyItMattersInPE:
      "Early years PE (KG and Year 1) sets attitudes toward movement. Negative early experiences are hard to reverse.",
    whenToUse: [
      "Early years PE and KG movement sessions.",
      "Transition into Year 1 PE.",
      "Indoor movement when outdoor space is limited.",
    ],
    commonMistakes: [
      "Formal drills inappropriate for age.",
      "Over-competitive structures.",
      "Sessions too long for concentration.",
    ],
    practicalApplications: [
      "Obstacle journeys and animal walks.",
      "Parachute, scarf, and beanbag play.",
      "Music and rhythm movement.",
    ],
    lessonPlanningPrompts: [
      "Is this play-based and joyful?",
      "Are sessions short with variety?",
    ],
    assessmentPrompts: [
      "Are observations descriptive, not graded?",
      "Is participation willing and curious?",
    ],
    differentiationPrompts: [
      "Sensory-friendly options for sensitive children.",
      "Adult support for gross motor delay.",
    ],
    agePhaseRelevance: ["early-years", "primary"],
    pathwayRelevance: ["early-years-pe", "primary-pe"],
    relatedModels: ["fundamental-movement-skills", "physical-literacy-overview"],
    tags: ["early-years", "kg", "play", "year-1"],
  },
];
