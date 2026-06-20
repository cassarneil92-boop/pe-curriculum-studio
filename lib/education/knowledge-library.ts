import type { KnowledgeSource, PedagogyKnowledgeEntry } from "./types";

const TGfU_SOURCE: KnowledgeSource = {
  id: "tgfu-bunker-thorpe",
  title: "Teaching Games for Understanding: Theory, Research, and Practice",
  author: "Bunker & Thorpe",
  year: 1982,
  url: "https://scholar.google.com/scholar?q=Teaching+Games+for+Understanding+Bunker+Thorpe",
  domain: "scholar.google.com",
  tier: "tier-1",
  evidenceLevel: "Peer-reviewed research",
};

const SE_SOURCE: KnowledgeSource = {
  id: "se-siedentop",
  title: "Sport Education: Quality PE through positive sport experiences",
  author: "Siedentop",
  year: 1994,
  url: "https://scholar.google.com/scholar?q=Sport+Education+Siedentop",
  domain: "scholar.google.com",
  tier: "tier-1",
  evidenceLevel: "Peer-reviewed research",
};

const CL_SOURCE: KnowledgeSource = {
  id: "cl-johnson-johnson",
  title: "Cooperation and Competition: Theory and Research",
  author: "Johnson & Johnson",
  year: 1989,
  url: "https://eric.ed.gov/?q=cooperative+learning+physical+education",
  domain: "eric.ed.gov",
  tier: "tier-1",
  evidenceLevel: "Peer-reviewed research",
};

const WPW_BOOK: KnowledgeSource = {
  id: "wpw-kirk",
  title: "Teaching Physical Education for Learning",
  author: "Kirk",
  year: 2013,
  url: "https://scholar.google.com/scholar?q=Teaching+Physical+Education+for+Learning+Kirk",
  domain: "scholar.google.com",
  tier: "tier-2",
  evidenceLevel: "Professional book",
};

const SHAPE_TGfU: KnowledgeSource = {
  id: "shape-tgfu",
  title: "Teaching Games for Understanding — SHAPE America guidance",
  author: "SHAPE America",
  year: 2020,
  url: "https://www.shapeamerica.org/",
  domain: "shapeamerica.org",
  tier: "tier-3",
  evidenceLevel: "Verified organisation",
};

const AFPE: KnowledgeSource = {
  id: "afpe-pe",
  title: "Association for Physical Education — Safe practice and pedagogy",
  author: "afPE",
  year: 2024,
  url: "https://www.afpe.org.uk/",
  domain: "afpe.org.uk",
  tier: "tier-3",
  evidenceLevel: "Verified organisation",
};

const PL_INTL: KnowledgeSource = {
  id: "pl-intl",
  title: "Physical Literacy — International Physical Literacy Association",
  author: "IPLA",
  year: 2024,
  url: "https://www.physical-literacy.org.uk/",
  domain: "physical-literacy.org.uk",
  tier: "tier-3",
  evidenceLevel: "Verified organisation",
};

const MIDDLE_YEARS = [
  "Year 5",
  "Year 6",
  "Year 7",
  "Year 8",
  "Year 9",
  "Year 10",
  "Year 11",
];

const INVASION_SPORTS = ["Football", "Basketball", "Handball", "Netball", "Hockey"];

export const PEDAGOGY_KNOWLEDGE: PedagogyKnowledgeEntry[] = [
  {
    id: "tgfu",
    name: "Teaching Games for Understanding",
    category: "Game Based Learning",
    description:
      "A tactical approach placing modified games first so learners discover problems, then practise skills in context before returning to game play.",
    suitableFor: INVASION_SPORTS,
    bestFor: ["Decision Making", "Tactical Awareness", "Game Understanding"],
    ageGroups: MIDDLE_YEARS,
    strengths: [
      "Develops tactical decision making before isolated technique",
      "High engagement through meaningful game contexts",
      "Supports transfer to full game situations",
    ],
    limitations: [
      "Requires skilled questioning from the teacher",
      "Less effective when technique deficits block game participation",
    ],
    lessonExamples: [
      "Modified 3v3 → identify passing options → pass-and-move practice → return to game",
      "Conditioned game with bonus points for successful off-the-ball movement",
    ],
    lessonPhases: [
      "Game form",
      "Tactical problem",
      "Skill practice",
      "Modified game",
      "Reflection",
    ],
    practicalImplications: [
      "Start with a small-sided game before drilling technique",
      "Use questioning to surface tactical problems",
      "Return to a game after practice to test transfer",
    ],
    sources: [TGfU_SOURCE, SHAPE_TGfU],
  },
  {
    id: "whole-part-whole",
    name: "Whole Part Whole",
    category: "Instructional Strategy",
    description:
      "Learners experience the whole activity, isolate a technical part for practice, then return to the whole context to apply learning.",
    suitableFor: [...INVASION_SPORTS, "Volleyball", "Athletics"],
    bestFor: ["Technique Refinement", "Contextual Learning", "Skill Transfer"],
    ageGroups: MIDDLE_YEARS,
    strengths: [
      "Maintains game context while allowing focused technical work",
      "Helps learners see why technique matters",
    ],
    limitations: ["Whole phase can lose focus if the game is too complex initially"],
    lessonExamples: [
      "Small-sided game → passing technique pairs → return to conditioned game",
    ],
    lessonPhases: ["Whole game", "Technical practice", "Return to game", "Review"],
    practicalImplications: [
      "Keep the opening whole experience short but authentic",
      "Link part practice explicitly back to the whole game",
    ],
    sources: [WPW_BOOK, AFPE],
  },
  {
    id: "constraints-led",
    name: "Constraints Led Approach",
    category: "Ecological Dynamics",
    description:
      "Manipulates task, environment, and performer constraints to shape emergent movement solutions without over-prescriptive coaching.",
    suitableFor: INVASION_SPORTS,
    bestFor: ["Adaptability", "Decision Making", "Skill Under Pressure"],
    ageGroups: MIDDLE_YEARS,
    strengths: [
      "Encourages adaptable solutions rather than one correct technique",
      "Useful for manipulating space and passing options",
    ],
    limitations: [
      "Requires careful constraint design",
      "Can look unstructured to observers unfamiliar with CLA",
    ],
    lessonExamples: [
      "Reduce pitch width to force quicker passing decisions",
      "Limit touches to increase passing urgency",
    ],
    lessonPhases: [
      "Establish task constraints",
      "Explore movement solutions",
      "Adjust constraints",
      "Debrief emergent strategies",
    ],
    practicalImplications: [
      "Change space, rules, or equipment rather than giving prescriptive cues only",
      "Allow trial-and-error before refining",
    ],
    sources: [
      {
        id: "cla-research",
        title: "Nonlinear Pedagogy in Skill Acquisition",
        author: "Chow et al.",
        year: 2016,
        url: "https://scholar.google.com/scholar?q=constraints+led+approach+physical+education",
        domain: "scholar.google.com",
        tier: "tier-1",
        evidenceLevel: "Peer-reviewed research",
      },
    ],
  },
  {
    id: "direct-instruction",
    name: "Direct Instruction",
    category: "Teacher Led Instruction",
    description:
      "Explicit modelling, clear success criteria, and structured practice with immediate feedback.",
    suitableFor: ["Athletics", "Gymnastics", "Swimming", ...INVASION_SPORTS],
    bestFor: ["Technique Accuracy", "Safety", "Early Skill Acquisition"],
    ageGroups: MIDDLE_YEARS,
    strengths: ["Clear learning path", "Efficient for novices", "Strong safety routines"],
    limitations: ["Can reduce decision-making if overused", "Less student autonomy"],
    lessonExamples: [
      "Teacher demo → paired practice → teacher feedback → conditioned application",
    ],
    lessonPhases: ["Demonstration", "Guided practice", "Independent practice", "Review"],
    practicalImplications: [
      "Model explicitly with success criteria visible",
      "Use short practice bouts with frequent feedback",
    ],
    sources: [WPW_BOOK, AFPE],
  },
  {
    id: "guided-discovery",
    name: "Guided Discovery",
    category: "Inquiry Based Learning",
    description:
      "Teacher-led questioning helps learners discover solutions rather than being told answers directly.",
    suitableFor: INVASION_SPORTS,
    bestFor: ["Problem Solving", "Student Voice", "Understanding"],
    ageGroups: MIDDLE_YEARS,
    strengths: ["Builds deeper understanding", "Develops questioning and reflection"],
    limitations: ["Takes longer than direct instruction", "Needs skilled facilitation"],
    lessonExamples: [
      "How can you create space without the ball? → explore → refine → apply in game",
    ],
    lessonPhases: ["Problem posed", "Exploration", "Guided refinement", "Application"],
    practicalImplications: [
      "Plan questions before the lesson, not only during",
      "Resist giving the answer too quickly",
    ],
    sources: [WPW_BOOK, AFPE],
  },
  {
    id: "cooperative-learning",
    name: "Cooperative Learning",
    category: "Social Learning",
    description:
      "Structured group interdependence with shared goals, roles, and peer accountability.",
    suitableFor: [...INVASION_SPORTS, "Fitness", "Outdoor Education"],
    bestFor: ["Teamwork", "Communication", "Inclusive Participation"],
    ageGroups: MIDDLE_YEARS,
    strengths: ["Supports mixed ability groups", "Builds social skills alongside physical skills"],
    limitations: ["Requires clear group structures and roles"],
    lessonExamples: ["Team challenge with shared success criteria and peer coaching roles"],
    lessonPhases: ["Group formation", "Shared goal setting", "Cooperative task", "Group reflection"],
    practicalImplications: [
      "Assign roles so every student contributes",
      "Reward group success, not only individual performance",
    ],
    sources: [CL_SOURCE, AFPE],
  },
  {
    id: "sport-education",
    name: "Sport Education",
    category: "Season Based Learning",
    description:
      "Authentic season structure with teams, roles beyond playing, and festivity around competition.",
    suitableFor: INVASION_SPORTS,
    bestFor: ["Team Identity", "Fair Play", "Extended Engagement"],
    ageGroups: MIDDLE_YEARS,
    strengths: ["Motivating season narrative", "Develops officiating and leadership roles"],
    limitations: ["Needs sustained unit length to feel authentic"],
    lessonExamples: ["Season opener with team roles, scorer, and fair-play captain"],
    lessonPhases: [
      "Roles and team identity",
      "Season structure",
      "Competition block",
      "Celebration and review",
    ],
    practicalImplications: [
      "Assign non-playing roles from lesson one",
      "Maintain season standings and fair-play awards",
    ],
    sources: [SE_SOURCE, SHAPE_TGfU],
  },
  {
    id: "inquiry-based",
    name: "Inquiry Based Learning",
    category: "Inquiry Based Learning",
    description:
      "Students investigate a movement problem through questioning, testing, and refining hypotheses.",
    suitableFor: INVASION_SPORTS,
    bestFor: ["Critical Thinking", "Self Direction", "Problem Solving"],
    ageGroups: ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11"],
    strengths: ["Develops learner ownership", "Connects PE to wider thinking skills"],
    limitations: ["Needs clear inquiry boundaries to stay safe and purposeful"],
    lessonExamples: ["What is the best way to beat a press? — test, observe, refine"],
    lessonPhases: ["Inquiry question", "Investigation", "Analysis", "Presentation"],
    practicalImplications: ["Give a clear inquiry question linked to the unit outcome"],
    sources: [AFPE],
  },
  {
    id: "whole-analytic-whole",
    name: "Whole Analytic Whole",
    category: "Instructional Strategy",
    description:
      "Similar to Whole Part Whole but analysis breaks the skill into sub-components analytically before reintegration.",
    suitableFor: ["Gymnastics", "Athletics", "Volleyball"],
    bestFor: ["Complex Skills", "Sequence Building", "Technical Analysis"],
    ageGroups: MIDDLE_YEARS,
    strengths: ["Useful for complex serial skills", "Clear component progression"],
    limitations: ["Can feel fragmented if parts are not linked to whole"],
    lessonExamples: ["Vault approach → board contact drill → full vault attempt"],
    lessonPhases: ["Whole performance", "Analytic breakdown", "Part practice", "Whole reintegration"],
    practicalImplications: ["Name how each analytic part improves the whole performance"],
    sources: [WPW_BOOK],
  },
  {
    id: "non-linear-pedagogy",
    name: "Non Linear Pedagogy",
    category: "Ecological Dynamics",
    description:
      "Rejects rigid linear skill stages; uses representative learning design and varied practice.",
    suitableFor: INVASION_SPORTS,
    bestFor: ["Adaptability", "Representative Learning", "Game Realism"],
    ageGroups: MIDDLE_YEARS,
    strengths: ["Practice looks like the game", "Supports transfer under variability"],
    limitations: ["Requires confidence to tolerate messy learning phases"],
    lessonExamples: ["Varied small-sided games with changing rules each rotation"],
    lessonPhases: ["Representative game", "Variability block", "Constraint manipulation", "Reflection"],
    practicalImplications: ["Vary conditions rather than repeating identical drills"],
    sources: [
      {
        id: "nlp-chow",
        title: "Nonlinear Pedagogy in Coaching",
        author: "Chow et al.",
        year: 2020,
        url: "https://scholar.google.com/scholar?q=nonlinear+pedagogy+coaching",
        domain: "scholar.google.com",
        tier: "tier-1",
        evidenceLevel: "Peer-reviewed research",
      },
    ],
  },
  {
    id: "physical-literacy",
    name: "Physical Literacy",
    category: "Holistic Development",
    description:
      "Develops motivation, confidence, physical competence, knowledge, and understanding for lifelong participation.",
    suitableFor: ["All activities"],
    bestFor: ["Lifelong Participation", "Confidence", "Holistic Development"],
    ageGroups: MIDDLE_YEARS,
    strengths: ["Connects PE to life beyond school", "Values confidence and motivation equally with skill"],
    limitations: ["Needs explicit reflection to make holistic outcomes visible"],
    lessonExamples: ["Self-assessment on confidence, competence, and enjoyment after a unit block"],
    lessonPhases: ["Activate motivation", "Build competence", "Reflect on understanding", "Plan next steps"],
    practicalImplications: ["Ask about confidence and enjoyment, not only performance"],
    sources: [PL_INTL],
  },
  {
    id: "tpsr",
    name: "Teaching Personal and Social Responsibility",
    category: "Social Responsibility",
    description: "Progressive responsibility levels from self-control to caring and community transfer.",
    suitableFor: ["Outdoor Education", "Holistic Development", "Team Games"],
    bestFor: ["Responsibility", "Fair Play", "Social Development"],
    ageGroups: MIDDLE_YEARS,
    strengths: ["Strong behaviour and values framework", "Transfer beyond PE"],
    limitations: ["Requires consistent language across lessons"],
    lessonExamples: ["Level 2 responsibility focus during team challenges with reflection"],
    lessonPhases: ["Responsibility focus", "Activity with accountability", "Reflection on level"],
    practicalImplications: ["Name the responsibility level explicitly each lesson"],
    sources: [AFPE],
  },
  {
    id: "adventure-based-learning",
    name: "Adventure Based Learning",
    category: "Outdoor Learning",
    description: "Challenge-based sequences with progressive risk, teamwork, and debrief.",
    suitableFor: ["Outdoor Education", "Team Building"],
    bestFor: ["Teamwork", "Resilience", "Reflection"],
    ageGroups: MIDDLE_YEARS,
    strengths: ["High engagement and memorable experiences"],
    limitations: ["Requires rigorous safety planning"],
    lessonExamples: ["Team challenge course with structured debrief"],
    lessonPhases: ["Challenge introduction", "Team attempt", "Debrief", "Transfer insight"],
    practicalImplications: ["Always debrief — the learning is in the reflection"],
    sources: [AFPE],
  },
  {
    id: "health-optimising-pe",
    name: "Health Optimising Physical Education",
    category: "Health Education",
    description: "Links movement to wellbeing, health literacy, and lifelong active lifestyles.",
    suitableFor: ["Fitness", "Health Education"],
    bestFor: ["Wellbeing", "Health Literacy", "Lifelong Activity"],
    ageGroups: MIDDLE_YEARS,
    strengths: ["Connects fitness to personal meaning"],
    limitations: ["Needs careful tone to avoid shame-based fitness culture"],
    lessonExamples: ["Design a personally meaningful fitness session with reflection on wellbeing"],
    lessonPhases: ["Health connection", "Personalised activity", "Reflection on wellbeing"],
    practicalImplications: ["Frame fitness around personal goals, not comparison"],
    sources: [PL_INTL, AFPE],
  },
  {
    id: "activist-approach",
    name: "Activist Approach",
    category: "Critical Pedagogy",
    description: "Students co-design units and critically engage with sport culture and inclusion.",
    suitableFor: ["Holistic Development", "Fitness"],
    bestFor: ["Student Voice", "Inclusion", "Critical Thinking"],
    ageGroups: ["Year 8", "Year 9", "Year 10", "Year 11"],
    strengths: ["Highly engaging for secondary students", "Promotes inclusion"],
    limitations: ["Requires time for student input and negotiation"],
    lessonExamples: ["Student-designed game with inclusion rules negotiated as a class"],
    lessonPhases: ["Student input", "Co-designed activity", "Critical reflection"],
    practicalImplications: ["Give genuine choice in unit design where possible"],
    sources: [AFPE],
  },
  {
    id: "adventure-education",
    name: "Adventure Education",
    category: "Outdoor Learning",
    description: "Progressive outdoor challenges developing trust, leadership, and reflection.",
    suitableFor: ["Outdoor Education"],
    bestFor: ["Leadership", "Risk Management", "Teamwork"],
    ageGroups: MIDDLE_YEARS,
    strengths: ["Memorable holistic development"],
    limitations: ["Weather and safety dependency"],
    lessonExamples: ["Progressive trust and problem-solving sequence outdoors"],
    lessonPhases: ["Briefing", "Challenge", "Debrief", "Transfer"],
    practicalImplications: ["Match challenge level to group readiness"],
    sources: [AFPE],
  },
];

export function getPedagogyKnowledge(id: string): PedagogyKnowledgeEntry | undefined {
  return PEDAGOGY_KNOWLEDGE.find((entry) => entry.id === id);
}

export function getAllPedagogyKnowledge(): PedagogyKnowledgeEntry[] {
  return PEDAGOGY_KNOWLEDGE;
}

export function getPedagogyDisplayName(id: string): string {
  return getPedagogyKnowledge(id)?.name ?? id;
}
