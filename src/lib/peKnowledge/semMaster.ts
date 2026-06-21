/**
 * Sport Education Model (SEM) Intelligence Engine v1 — original content for PE Curriculum Studio.
 */

import type { PEKnowledgeEntry } from "./types";

export interface SEMFramework {
  definition: string;
  rationale: string;
  keyCharacteristics: string[];
  benefits: string[];
  limitations: string[];
  implementationGuidance: string[];
  primaryAdaptation: string[];
  secondaryAdaptation: string[];
  inclusionConsiderations: string[];
  assessmentOpportunities: string[];
}

export interface SEMCharacteristic {
  id: string;
  name: string;
  purpose: string;
  peValue: string;
  implementationIdeas: string[];
  commonMistakes: string[];
  ageAdaptations: string[];
}

export interface SEMRole {
  id: string;
  name: string;
  responsibilities: string[];
  learningOutcomes: string[];
  leadershipOpportunities: string[];
  assessmentOpportunities: string[];
}

export interface SEMWarning {
  id: string;
  warning: string;
  whyItMatters: string;
  suggestedFix: string;
  teacherPrompt: string;
}

export const SEM_CORE_MESSAGE =
  "Sport Education is a season-based curriculum model — not simply competition. Pupils belong to teams, take authentic roles, keep records, and experience sport as a meaningful season.";

export const SEM_FRAMEWORK: SEMFramework = {
  definition:
    "Sport Education Model (SEM) is a season-based pedagogical approach where pupils experience sport through team affiliation, formal competition, student roles, record keeping, and culminating festivity over multiple lessons.",
  rationale:
    "SEM develops competence, affiliation, and authentic sport culture by giving pupils sustained membership, responsibility, and meaningful competition — not one-off matches.",
  keyCharacteristics: [
    "Seasons spanning multiple lessons",
    "Persistent team affiliation",
    "Formal competition with published results",
    "Authentic student roles beyond playing",
    "Record keeping and statistics",
    "Culminating festive event",
    "Reflection on participation and responsibility",
  ],
  benefits: [
    "Builds team identity and belonging",
    "Develops leadership through non-playing roles",
    "Motivates through meaningful competition",
    "Teaches sport literacy — rules, tactics, officiating",
    "Creates authentic assessment evidence across domains",
    "Engages pupils who prefer organisation over performance",
  ],
  limitations: [
    "Requires sustained unit length — not suitable for single lessons",
    "Needs careful inclusion planning for mixed ability",
    "Can over-emphasise winning without fair play balance",
    "Role rotation takes planning time",
    "Record keeping can become teacher-heavy without pupil ownership",
  ],
  implementationGuidance: [
    "Plan a full season before lesson one — phases, teams, roles, records",
    "Launch with orientation: explain season, teams, roles, and scoring",
    "Assign roles early and rotate across the season",
    "Use round-robin or modified formats — avoid early elimination",
    "Publish standings and fair play points visibly",
    "Build to a culminating event with broad recognition",
    "End with team and individual reflection",
  ],
  primaryAdaptation: [
    "Shorter seasons with simplified roles (Captain, Referee, Scorekeeper)",
    "Picture-based role cards and team badges",
    "Teacher-led record keeping with pupil helpers",
    "Cooperative scoring — team earns points together",
    "Modified rules for smaller spaces and mixed ability",
  ],
  secondaryAdaptation: [
    "Full role portfolio with journalist and wellbeing officer",
    "Pupil-managed statistics and league tables",
    "Inter-team playoffs with fair play weighting",
    "Cross-class mini-league or festival",
    "Leadership portfolios evidencing role performance",
  ],
  inclusionConsiderations: [
    "Assign non-playing roles matched to strengths — not punishment",
    "Mixed-ability teams with balanced competitiveness",
    "Adapt competition format — everyone contributes to team points",
    "EAL support: visual role cards and simplified rule sheets",
    "SEND: modified participation pathways with same team affiliation",
    "Low confidence: wellbeing and fair play roles build belonging first",
  ],
  assessmentOpportunities: [
    "Holistic rubric: physical, cognitive, social, affective",
    "Role performance observation checklists",
    "Fair play and effort point evidence",
    "Team meeting contributions and tactical decisions",
    "Record keeping accuracy as cognitive evidence",
    "Culminating event reflection against season goals",
  ],
};

export const SEM_CHARACTERISTICS: SEMCharacteristic[] = [
  {
    id: "seasons",
    name: "Seasons",
    purpose: "Structure learning across multiple connected lessons with narrative arc.",
    peValue: "Pupils see progress from orientation to culminating event — not isolated games.",
    implementationIdeas: [
      "Map 6–8 lesson arc: orient → build → develop → compete → celebrate → reflect",
      "Display season calendar on wall or digital board",
      "Name the season (e.g. Spring Handball League)",
    ],
    commonMistakes: ["Treating SEM as one tournament day", "No phase progression"],
    ageAdaptations: [
      "Primary: 4–6 lesson mini-season",
      "Secondary: 8–12 lesson full season with playoffs",
    ],
  },
  {
    id: "team-affiliation",
    name: "Team Affiliation",
    purpose: "Create persistent membership, identity, and loyalty across lessons.",
    peValue: "Belonging motivates effort and responsibility beyond individual skill.",
    implementationIdeas: [
      "Team names, colours, and values decided in lesson 1",
      "Team meetings at start of each lesson",
      "Same teams across entire season — no re-picking each week",
    ],
    commonMistakes: ["New teams every lesson", "Captains always highest skilled pupils"],
    ageAdaptations: [
      "Primary: animal or colour team names with badges",
      "Secondary: pupil-designed team identity and chants",
    ],
  },
  {
    id: "formal-competition",
    name: "Formal Competition",
    purpose: "Provide authentic competitive structure with rules, fixtures, and results.",
    peValue: "Competition drives tactical learning and emotional engagement when balanced.",
    implementationIdeas: [
      "Round-robin fixtures published in advance",
      "Modified rules matched to learning focus",
      "Bonus points for tactical goals or fair play",
    ],
    commonMistakes: ["Knockout elimination early", "Winning-only scoring", "No link to learning intention"],
    ageAdaptations: [
      "Primary: cooperative team challenges with shared score",
      "Secondary: league table with fair play multiplier",
    ],
  },
  {
    id: "student-roles",
    name: "Student Roles",
    purpose: "Distribute responsibility and develop sport literacy beyond playing.",
    peValue: "Every pupil contributes — coach, referee, statistician, journalist, and more.",
    implementationIdeas: [
      "Role cards with clear responsibilities",
      "Rotate roles each lesson or phase",
      "Role debrief in team meeting",
    ],
    commonMistakes: ["Only captains have roles", "Roles as busy work without learning", "Same pupils always officiate"],
    ageAdaptations: [
      "Primary: 3–4 core roles with visuals",
      "Secondary: full role portfolio with assessment criteria",
    ],
  },
  {
    id: "record-keeping",
    name: "Record Keeping",
    purpose: "Make performance, effort, and fair play visible and trackable.",
    peValue: "Statistics teach sport literacy and create assessment evidence.",
    implementationIdeas: [
      "League table updated after each lesson",
      "Statistician records scores, assists, fair play points",
      "Attendance and effort tracker per team",
    ],
    commonMistakes: ["Teacher keeps all records alone", "Records never shared with pupils", "Only win/loss tracked"],
    ageAdaptations: [
      "Primary: simple tally chart on whiteboard",
      "Secondary: pupil-managed spreadsheet or poster league",
    ],
  },
  {
    id: "culminating-event",
    name: "Culminating Event",
    purpose: "Provide festive closure that celebrates the season authentically.",
    peValue: "Motivates sustained effort and creates memorable sport experience.",
    implementationIdeas: [
      "Finals day or festival round-robin",
      "Awards ceremony with multiple categories",
      "Team presentation of season highlights",
    ],
    commonMistakes: ["Only winners celebrated", "No link back to season learning", "Event without preparation"],
    ageAdaptations: [
      "Primary: class festival with effort and fair play awards",
      "Secondary: playoffs plus MVP, fair play, and leadership awards",
    ],
  },
  {
    id: "festivity",
    name: "Festivity",
    purpose: "Build positive sport culture through celebration, ritual, and community.",
    peValue: "Festivity increases motivation and positive affect toward PE.",
    implementationIdeas: [
      "Team chants, handshakes, or pre-match routines",
      "Music during warm-up or awards",
      "Peer recognition moments in plenary",
    ],
    commonMistakes: ["Festivity only for winning team", "Culture of mockery or exclusion"],
    ageAdaptations: [
      "Primary: sticker or certificate for team values",
      "Secondary: pupil-led awards voted by peers",
    ],
  },
];

export const SEM_ROLES: SEMRole[] = [
  {
    id: "coach",
    name: "Coach",
    responsibilities: [
      "Lead team warm-up and pre-match talk",
      "Suggest tactical changes during timeouts",
      "Support teammates with encouragement",
    ],
    learningOutcomes: [
      "Communicate tactics clearly",
      "Observe team performance and adapt",
      "Demonstrate leadership under pressure",
    ],
    leadershipOpportunities: ["Timeout decisions", "Half-time team talk", "Substitute management"],
    assessmentOpportunities: ["Observe tactical instruction quality", "Peer rating of support given"],
  },
  {
    id: "captain",
    name: "Captain",
    responsibilities: [
      "Represent team in coin toss or fixture meetings",
      "Model fair play and effort",
      "Support role rotation and inclusion",
    ],
    learningOutcomes: ["Lead by example", "Resolve minor disputes", "Include all teammates"],
    leadershipOpportunities: ["Team spokesperson", "Motivating struggling teammates"],
    assessmentOpportunities: ["Fair play observation", "Inclusion checklist during match"],
  },
  {
    id: "referee",
    name: "Referee",
    responsibilities: [
      "Apply agreed rules consistently",
      "Manage safe play and respect",
      "Explain decisions calmly",
    ],
    learningOutcomes: ["Understand and apply rules", "Communicate under pressure", "Show impartiality"],
    leadershipOpportunities: ["Officiate full or partial match", "Rule clarification for peers"],
    assessmentOpportunities: ["Rule knowledge check", "Consistency of officiating"],
  },
  {
    id: "statistician",
    name: "Statistician",
    responsibilities: [
      "Record scores, attempts, and fair play points",
      "Update league table after matches",
      "Report statistics in team meeting",
    ],
    learningOutcomes: ["Accurate data recording", "Interpret performance trends", "Present data to team"],
    leadershipOpportunities: ["Manage official team records", "Identify patterns for tactics"],
    assessmentOpportunities: ["Accuracy of records", "Data presentation in plenary"],
  },
  {
    id: "journalist",
    name: "Journalist",
    responsibilities: [
      "Report on match highlights",
      "Interview players about tactics",
      "Write team newsletter or bulletin",
    ],
    learningOutcomes: ["Describe performance using sport vocabulary", "Ask analytical questions"],
    leadershipOpportunities: ["Season review article", "Match-day commentary"],
    assessmentOpportunities: ["Written or verbal match report", "Use of tactical language"],
  },
  {
    id: "equipment-manager",
    name: "Equipment Manager",
    responsibilities: [
      "Set up and collect equipment",
      "Check safety and organisation",
      "Support smooth transitions between activities",
    ],
    learningOutcomes: ["Organisation and responsibility", "Safety awareness"],
    leadershipOpportunities: ["Pre-lesson setup lead", "Equipment audit"],
    assessmentOpportunities: ["Setup efficiency", "Safety checklist completion"],
  },
  {
    id: "wellbeing-officer",
    name: "Wellbeing Officer",
    responsibilities: [
      "Check in on teammates' confidence and inclusion",
      "Support pupils who feel left out",
      "Promote positive team atmosphere",
    ],
    learningOutcomes: ["Empathy and inclusion", "Peer support skills"],
    leadershipOpportunities: ["Inclusion buddy during competition", "Team morale check-ins"],
    assessmentOpportunities: ["Inclusion observation", "Peer feedback on support"],
  },
  {
    id: "fair-play-officer",
    name: "Fair Play Officer",
    responsibilities: [
      "Monitor respect, effort, and sportsmanship",
      "Award fair play points to own and opposing teams",
      "Report fair play summary after match",
    ],
    learningOutcomes: ["Recognise fair play behaviours", "Apply agreed values consistently"],
    leadershipOpportunities: ["Fair play nomination", "Values reminder before match"],
    assessmentOpportunities: ["Fair play point log", "Values reflection"],
  },
];

export const SEM_WARNINGS: SEMWarning[] = [
  {
    id: "competition-only",
    warning: "SEM reduced to competition only",
    whyItMatters: "Without roles, records, and affiliation, pupils miss authentic sport experience.",
    suggestedFix: "Add team roles and record keeping to every lesson.",
    teacherPrompt: "What makes this a season — not just a tournament?",
  },
  {
    id: "no-affiliation",
    warning: "No team affiliation",
    whyItMatters: "Pupils need sustained membership to build belonging and responsibility.",
    suggestedFix: "Create persistent teams with names and values in lesson 1.",
    teacherPrompt: "Which team does each pupil belong to for the whole season?",
  },
  {
    id: "no-roles",
    warning: "Student roles missing",
    whyItMatters: "Roles develop leadership and include non-performers meaningfully.",
    suggestedFix: "Assign at least one role per pupil across the season.",
    teacherPrompt: "Who is coach, referee, or statistician today?",
  },
  {
    id: "elimination",
    warning: "Elimination structure risks disengagement",
    whyItMatters: "Early knockouts leave pupils without meaningful participation.",
    suggestedFix: "Use round-robin with fair play and effort points.",
    teacherPrompt: "How does every team stay competitive until the end?",
  },
  {
    id: "winners-only",
    warning: "Festivity rewards winners only",
    whyItMatters: "Many pupils disengage if only champions are recognised.",
    suggestedFix: "Add fair play, effort, leadership, and improvement awards.",
    teacherPrompt: "Who is celebrated beyond the top scorer?",
  },
  {
    id: "no-records",
    warning: "Record keeping absent",
    whyItMatters: "Records make progress visible and build sport literacy.",
    suggestedFix: "Publish league table and update after each lesson.",
    teacherPrompt: "Where is the season standings board?",
  },
  {
    id: "no-reflection",
    warning: "Season reflection missing",
    whyItMatters: "Reflection consolidates learning from roles and competition.",
    suggestedFix: "End each phase with team meeting reflection.",
    teacherPrompt: "What did your team learn this week?",
  },
  {
    id: "inclusion-gap",
    warning: "Inclusion not planned for SEM",
    whyItMatters: "Mixed ability and confidence gaps widen in unchecked competition.",
    suggestedFix: "Assign roles by strength; adapt scoring for participation.",
    teacherPrompt: "How does every pupil contribute to their team today?",
  },
];

/** Future-ready seed types for dashboards, tracking, and printables — UI not built yet. */
export interface SEMTeamRecord {
  id: string;
  name: string;
  colour: string;
  values: string[];
  memberIds?: string[];
  wins: number;
  losses: number;
  draws: number;
  fairPlayPoints: number;
  effortPoints: number;
}

export interface SEMSeasonPhaseRecord {
  phase: number;
  name: string;
  lessonNumbers: number[];
  focus: string;
}

export interface SEMSeasonRecord {
  id: string;
  activity: string;
  yearGroup?: string;
  pathway?: string;
  lessonCount: number;
  phases: SEMSeasonPhaseRecord[];
  teams: SEMTeamRecord[];
  roles: { roleId: string; pupilId?: string; lessonNumber?: number }[];
  standings?: { teamId: string; points: number; played: number }[];
}

export const SEM_MASTER_PE_ENTRY: PEKnowledgeEntry = {
  id: "sem-master",
  title: "Sport Education Model (SEM)",
  category: "pedagogy-model",
  summary: SEM_CORE_MESSAGE,
  keyPrinciples: SEM_FRAMEWORK.keyCharacteristics,
  whyItMattersInPE:
    "SEM gives pupils authentic sport experiences through seasons, teams, roles, and festivity — developing competence, affiliation, and responsibility.",
  whenToUse: [
    "Multi-lesson invasion or net/wall units",
    "League or tournament planning",
    "Leadership and responsibility development",
    "Mixed-ability team sport units",
  ],
  commonMistakes: SEM_WARNINGS.slice(0, 5).map((w) => w.warning),
  practicalApplications: SEM_CHARACTERISTICS.slice(0, 4).map((c) => `${c.name}: ${c.implementationIdeas[0]}`),
  lessonPlanningPrompts: SEM_FRAMEWORK.implementationGuidance.slice(0, 6),
  assessmentPrompts: SEM_FRAMEWORK.assessmentOpportunities.slice(0, 4),
  differentiationPrompts: SEM_FRAMEWORK.inclusionConsiderations.slice(0, 4),
  agePhaseRelevance: ["primary", "middle-school", "secondary", "all"],
  pathwayRelevance: ["all"],
  relatedModels: ["tgfu-master", "tpsr-master", "cooperative-learning-master", "visible-learning-master"],
  tags: ["sem", "sport-education", "season", "team", "competition", "roles", "fair-play", "festivity"],
};

export function isSEMRelevant(text: string): boolean {
  return /\b(season|tournament|league|competition|sport education|sem\b|team affiliation|round.?robin|fixtures|culminating|festivity|fair play points|student roles?|team roles?|captain|statistician|referee role)\b/i.test(
    text
  );
}

export function getSEMCharacteristic(id: string): SEMCharacteristic | undefined {
  return SEM_CHARACTERISTICS.find((c) => c.id === id);
}

export function getSEMRole(id: string): SEMRole | undefined {
  return SEM_ROLES.find((r) => r.id === id);
}
