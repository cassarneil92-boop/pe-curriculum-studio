import type { PEKnowledgeEntry } from "./types";

export const MOTIVATION_ENTRIES: PEKnowledgeEntry[] = [
  {
    id: "motivation-autonomy",
    title: "Autonomy Support in PE",
    category: "motivation",
    summary:
      "Students engage more deeply when they have meaningful choice in activity, challenge level, or how they demonstrate learning.",
    keyPrinciples: [
      "Choice within structure — not unlimited freedom.",
      "Explain rationale so tasks feel purposeful.",
      "Avoid controlling language that undermines ownership.",
    ],
    whyItMattersInPE:
      "Forced participation without voice breeds compliance or resistance. Autonomy increases effort in mixed-motivation classes.",
    whenToUse: [
      "Secondary lessons where engagement is uneven.",
      "Differentiation and extension tasks.",
      "Student-led warm-ups or cool-downs.",
    ],
    commonMistakes: [
      "Offering fake choice with no real impact.",
      "Removing all structure in the name of freedom.",
      "Only giving choice to well-behaved students.",
    ],
    practicalApplications: [
      "Choose your challenge level: support / core / extend.",
      "Student selects team role for the lesson.",
      "Pick one of three approved activities for the main phase.",
    ],
    lessonPlanningPrompts: [
      "Where can students make one meaningful choice?",
      "Have you explained why this activity matters?",
    ],
    assessmentPrompts: [
      "Do students understand what they are working toward?",
      "Can they explain their chosen level and progress?",
    ],
    differentiationPrompts: [
      "Choice boards with equivalent learning outcomes.",
      "Self-selected practice partners with clear criteria.",
    ],
    agePhaseRelevance: ["middle-school", "secondary"],
    pathwayRelevance: ["general-pe", "pe-option-sec", "alp-pe", "fitness-curriculum"],
    relatedModels: ["challenge-by-choice", "sport-education"],
    tags: ["engagement", "choice", "secondary-pe", "differentiation"],
  },
  {
    id: "motivation-competence",
    title: "Competence and Perceived Success",
    category: "motivation",
    summary:
      "Motivation rises when students believe they can improve and see evidence of progress against clear, achievable criteria.",
    keyPrinciples: [
      "Set criteria students can hit this lesson.",
      "Track improvement from personal baseline.",
      "Match task difficulty to current ability.",
    ],
    whyItMattersInPE:
      "Repeated failure in public settings damages motivation fast. Competence support keeps students trying.",
    whenToUse: [
      "Skill acquisition lessons.",
      "Fitness testing and personal best units.",
      "Classes with wide ability ranges.",
    ],
    commonMistakes: [
      "Single standard for all regardless of starting point.",
      "Ranking students publicly every lesson.",
      "Moving on before students experience success.",
    ],
    practicalApplications: [
      "Personal best sheets across the scheme.",
      "Tiered success criteria: bronze / silver / gold.",
      "Video or photo evidence of improvement.",
    ],
    lessonPlanningPrompts: [
      "What does success look like for the lowest and highest attainer?",
      "How will progress be visible today?",
    ],
    assessmentPrompts: [
      "Has the student improved against their own baseline?",
      "Do they believe they can get better with practice?",
    ],
    differentiationPrompts: [
      "Adjust equipment, space, or opposition for achievable success.",
      "Same learning intention, different performance indicators.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["movement-confidence", "assessment-for-learning"],
    tags: ["engagement", "success-criteria", "mixed-ability", "fitness"],
  },
  {
    id: "motivation-relatedness",
    title: "Relatedness and Belonging in PE",
    category: "motivation",
    summary:
      "Students persist when they feel connected to peers, respected by the teacher, and part of a positive group culture.",
    keyPrinciples: [
      "Inclusive grouping reduces social threat.",
      "Teacher warmth and fairness matter as much as activities.",
      "Team identity can motivate without excluding others.",
    ],
    whyItMattersInPE:
      "PE is highly social. Isolation, bullying, or dominant cliques destroy participation — especially in adolescence.",
    whenToUse: [
      "Start of year and new scheme introductions.",
      "Sport Education seasons.",
      "Any lesson with team selection.",
    ],
    commonMistakes: [
      "Captains picking teams publicly.",
      "Allowing exclusionary banter unchecked.",
      "Same social groups every lesson without rotation.",
    ],
    practicalApplications: [
      "Random or teacher-assigned teams with roles for all.",
      "Fair play points and team agreements.",
      "Circle time or pair check-ins at lesson start.",
    ],
    lessonPlanningPrompts: [
      "How will you prevent social exclusion today?",
      "What builds team belonging without humiliating anyone?",
    ],
    assessmentPrompts: [
      "Are all students included in group tasks?",
      "Do students report feeling safe in the class?",
    ],
    differentiationPrompts: [
      "Structured roles so quieter students contribute.",
      "Buddy systems for students new to the activity.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["cooperative-learning", "sport-education", "tpsr"],
    tags: ["belonging", "fair-play", "team-selection", "social-skills"],
  },
  {
    id: "motivation-relevance",
    title: "Making Learning Relevant",
    category: "motivation",
    summary:
      "Connect activities to students' lives, interests, and future health so effort feels worthwhile beyond the mark scheme.",
    keyPrinciples: [
      "Link skills to real game or life situations.",
      "Use local and cultural references where appropriate.",
      "Show how outcomes connect to health and wellbeing.",
    ],
    whyItMattersInPE:
      "Why are we doing this? is a fair question. Relevance answers it and reduces off-task behaviour.",
    whenToUse: [
      "Introducing new units.",
      "Fitness and health-related lessons.",
      "When student buy-in is low.",
    ],
    commonMistakes: [
      "Assuming relevance is obvious.",
      "Only citing professional sport examples.",
      "No connection to Maltese context or student experience.",
    ],
    practicalApplications: [
      "Open with a scenario: when would you use this in a match?",
      "Link fitness work to activities students enjoy outside school.",
      "Guest or video from local community sport.",
    ],
    lessonPlanningPrompts: [
      "Can you state in one sentence why this matters to students?",
      "What local example makes this real?",
    ],
    assessmentPrompts: [
      "Can students explain the purpose of the activity?",
      "Do they connect learning to health or participation goals?",
    ],
    differentiationPrompts: [
      "Let students choose a relevant application context.",
      "Use interest-based examples in questioning.",
    ],
    agePhaseRelevance: ["middle-school", "secondary"],
    pathwayRelevance: ["general-pe", "fitness-curriculum", "sport-values", "alp-pe"],
    relatedModels: ["active-for-life", "malta-curriculum-pathways"],
    tags: ["engagement", "health", "purpose", "secondary-pe"],
  },
  {
    id: "challenge-by-choice",
    title: "Challenge by Choice",
    category: "motivation",
    summary:
      "Students select appropriate challenge levels while the teacher maintains safety boundaries and clear learning intentions.",
    keyPrinciples: [
      "All levels must be respected — no shame for choosing support.",
      "Teacher sets non-negotiable safety limits.",
      "Challenge can be physical, tactical, or social.",
    ],
    whyItMattersInPE:
      "Adventure education and mixed-ability PE need structured risk-taking. Choice increases ownership while keeping lessons safe.",
    whenToUse: [
      "Gymnastics, outdoor education, climbing contexts.",
      "Fitness circuits with tiered stations.",
      "Extension tasks in secondary PE.",
    ],
    commonMistakes: [
      "Pressuring students to pick harder options.",
      "Unsafe options presented as equal choices.",
      "No clear criteria for each level.",
    ],
    practicalApplications: [
      "Three height options on vault or jump tasks.",
      "Fitness station: choose reps band with same time on task.",
      "Tactical challenge: support / core / extend game rules.",
    ],
    lessonPlanningPrompts: [
      "What are the support, core, and extend versions of this task?",
      "How will you honour every choice without comparison?",
    ],
    assessmentPrompts: [
      "Did the student work at an appropriate challenge level?",
      "Did they progress levels when ready?",
    ],
    differentiationPrompts: [
      "Visual menu of challenge options at each station.",
      "Private level selection to reduce social pressure.",
    ],
    agePhaseRelevance: ["primary", "middle-school", "secondary"],
    pathwayRelevance: ["all"],
    relatedModels: ["motivation-autonomy", "inclusion-universal-design"],
    tags: ["differentiation", "adventure", "gymnastics", "fitness", "choice"],
  },
];
