import type { PEKnowledgeEntry } from "./types";

export const INCLUSION_ENTRIES: PEKnowledgeEntry[] = [
  {
    id: "inclusion-universal-design",
    title: "Universal Design for Learning in PE",
    category: "inclusion",
    summary:
      "Plan multiple means of engagement, representation, and action so more students can access the same learning intention from the start.",
    keyPrinciples: [
      "Design for the margins — everyone benefits.",
      "Same learning intention, varied pathways.",
      "Proactive planning beats reactive adaptation.",
    ],
    whyItMattersInPE:
      "Retrofitting inclusion after planning often fails. UDL keeps all students active and dignified in mixed-ability Maltese classes.",
    whenToUse: [
      "Every lesson plan before teaching.",
      "Scheme design for heterogeneous classes.",
      "When supporting EAL, SEND, or physical limitations.",
    ],
    commonMistakes: [
      "Separate activities that isolate students.",
      "Lowering expectations instead of adjusting access.",
      "Only adapting when behaviour breaks down.",
    ],
    practicalApplications: [
      "Offer visual, verbal, and demo-based instruction.",
      "Same game with rule/equipment tiers for all.",
      "Roles that include non-running contributions.",
    ],
    lessonPlanningPrompts: [
      "Can every student access the learning intention today?",
      "What barriers might exist before the lesson starts?",
    ],
    assessmentPrompts: [
      "Is assessment measuring the intention, not one fixed method?",
      "Can students demonstrate learning in an alternative way?",
    ],
    differentiationPrompts: [
      "Equipment size, space, time, or opposition adjustments.",
      "Alternative response modes: demo, draw, or explain.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
    pathwayRelevance: ["all"],
    relatedModels: ["challenge-by-choice", "cooperative-learning"],
    tags: ["send", "eal", "differentiation", "access", "planning"],
  },
  {
    id: "inclusion-gender-equity",
    title: "Gender-Inclusive PE Practice",
    category: "inclusion",
    summary:
      "Challenge stereotypes, ensure equitable access, and create environments where all genders participate fully and safely.",
    keyPrinciples: [
      "Avoid default gendered grouping unless purposeful.",
      "Use language that includes all students.",
      "Address stereotype threat in traditionally gendered activities.",
    ],
    whyItMattersInPE:
      "Girls and non-binary students often receive less feedback, fewer touches, or narrower activity offers. Equity improves participation and outcomes.",
    whenToUse: [
      "Team games and fitness testing.",
      "Dance, gymnastics, and combat activities.",
      "Scheme selection and resource choices.",
    ],
    commonMistakes: [
      "Boys vs girls games without pedagogical reason.",
      "Assuming interest based on gender.",
      "Ignoring changing room or kit barriers.",
    ],
    practicalApplications: [
      "Mixed teams with equitable role rotation.",
      "Diverse role models in examples and media.",
      "Flexible kit policies where school rules allow.",
    ],
    lessonPlanningPrompts: [
      "Could any grouping or language exclude students?",
      "Are all students expected to succeed in this activity area?",
    ],
    assessmentPrompts: [
      "Are participation rates equitable across the class?",
      "Does feedback frequency reach all students?",
    ],
    differentiationPrompts: [
      "Offer activities that challenge stereotypes thoughtfully.",
      "Private changing or alternative spaces where needed.",
    ],
    agePhaseRelevance: ["middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["motivation-relatedness", "tpsr"],
    tags: ["equity", "gender", "participation", "secondary-pe"],
  },
  {
    id: "inclusion-send-pe",
    title: "Inclusive Practice for SEND in PE",
    category: "inclusion",
    summary:
      "Adapt tasks, communication, and environment so students with special educational needs and disabilities fully participate in meaningful PE.",
    keyPrinciples: [
      "Consult pupils and support staff on what helps.",
      "Modify task, not always the learning intention.",
      "Sensory and communication needs affect PE uniquely.",
    ],
    whyItMattersInPE:
      "PE can be the highlight or hardest lesson of the week for SEND students. Thoughtful inclusion is a legal and moral expectation.",
    whenToUse: [
      "Planning for known SEND profiles.",
      "Noisy or fast-paced game lessons.",
      "Swimming and outdoor trips.",
    ],
    commonMistakes: [
      "Sideline assistant role with no learning purpose.",
      "Over-simplifying until activity is meaningless.",
      "Not preparing peers for inclusive participation.",
    ],
    practicalApplications: [
      "Visual schedules and countdown timers.",
      "Predictable routines and pre-lesson briefing.",
      "Partner work with trained peer supporters.",
    ],
    lessonPlanningPrompts: [
      "What does this student need to access, engage, and express learning?",
      "Have you spoken with the learner or LSA?",
    ],
    assessmentPrompts: [
      "Is evidence collected in an accessible format?",
      "Are IEP targets reflected in success criteria?",
    ],
    differentiationPrompts: [
      "Reduce sensory load or offer quiet recovery space.",
      "Break tasks into micro-steps with checklists.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["inclusion-universal-design", "cognitive-load-management"],
    tags: ["send", "access", "differentiation", "lsa", "planning"],
  },
  {
    id: "inclusion-eal-pe",
    title: "Supporting EAL Learners in PE",
    category: "inclusion",
    summary:
      "Use demonstration, visual supports, and peer structures so English language learners access PE content without waiting for fluent language.",
    keyPrinciples: [
      "Show before tell; PE is ideal for embodied learning.",
      "Key vocabulary posted and rehearsed.",
      "Pair with supportive peers for instructions.",
    ],
    whyItMattersInPE:
      "Maltese schools serve diverse language backgrounds. EAL students can excel physically while struggling with verbal instructions.",
    whenToUse: [
      "First lessons in a new sport.",
      "Complex rule introduction.",
      "Assessment with written components.",
    ],
    commonMistakes: [
      "Long verbal briefings without demo.",
      "Penalising language errors in physical assessment.",
      "No bilingual or visual glossary of key terms.",
    ],
    practicalApplications: [
      "Word wall: pass, defend, space, target.",
      "Demonstration stations before whole-class talk.",
      "Allow gesture or home-language peer explanation where appropriate.",
    ],
    lessonPlanningPrompts: [
      "What are the 3–5 key words today?",
      "How will instructions work without relying on speech alone?",
    ],
    assessmentPrompts: [
      "Can the student show the skill even if they cannot fully verbalise it?",
      "Are written tasks proportionate to language demand?",
    ],
    differentiationPrompts: [
      "Picture task cards and simplified written criteria.",
      "Oral assessment option with key word prompts.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["cognitive-load-management", "inclusion-universal-design"],
    tags: ["eal", "language", "visual-support", "malta"],
  },
  {
    id: "inclusion-adaptive-competition",
    title: "Fair Competition Structures",
    category: "inclusion",
    summary:
      "Design competition so winning reflects effort and improvement, not only inherited advantage — keeping competition motivating for all.",
    keyPrinciples: [
      "Handicap, tiered, or parallel competitions balance opportunity.",
      "Process goals alongside outcome goals.",
      "De-emphasise public ranking when harmful.",
    ],
    whyItMattersInPE:
      "Unbalanced competition demotivates weaker students and can inflate complacency in stronger ones. Structure matters.",
    whenToUse: [
      "Intra-class tournaments.",
      "Fitness challenges and athletics days.",
      "Sport Education seasons.",
    ],
    commonMistakes: [
      "Single ladder where same students always win.",
      "Competition with no non-competitive alternative.",
      "Rewarding only speed or strength.",
    ],
    practicalApplications: [
      "Division leagues by prior data or self-tier.",
      "Team points for improvement, fair play, and effort.",
      "Personal best medals alongside winner awards.",
    ],
    lessonPlanningPrompts: [
      "Who might be excluded if we run this competition as planned?",
      "What success can non-winners achieve?",
    ],
    assessmentPrompts: [
      "Are multiple dimensions of success recognised?",
      "Did competition increase or decrease participation?",
    ],
    differentiationPrompts: [
      "Parallel tasks with equivalent prestige.",
      "Mixed ability teams with weighted scoring.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["motivation-competence", "sport-education"],
    tags: ["competition", "fair-play", "mixed-ability", "assessment"],
  },
];
