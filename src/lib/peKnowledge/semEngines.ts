/**
 * Sport Education Model (SEM) Intelligence Engine v1 — planning and evaluation engines.
 */

import type { LessonBuilderFormData } from "@/lib/lesson-builder/types";
import type { SchemeOfWork } from "@/lib/types";
import type { LessonApplyTarget } from "./applySuggestions";
import type { LessonKnowledgeContext } from "./types";
import {
  isSEMRelevant,
  SEM_CHARACTERISTICS,
  SEM_ROLES,
  SEM_WARNINGS,
  type SEMSeasonPhaseRecord,
  type SEMSeasonRecord,
  type SEMTeamRecord,
} from "./semMaster";

export type SEMQualityBand = "Exceptional" | "Strong" | "Developing" | "Limited";

export interface SEMContext extends LessonKnowledgeContext {
  topicId?: string;
  activity?: string;
  walt?: string;
  wilf?: string;
  activities?: string;
  differentiation?: string;
  assessmentNotes?: string;
  reflectionNotes?: string;
  structuredActivityText?: string;
  lessonCount?: number;
  classSize?: number;
  teamCount?: number;
}

export interface SEMQualityInsight {
  id: string;
  area: string;
  message: string;
  prompt?: string;
  entryId?: string;
  fix?: {
    target: LessonApplyTarget;
    text: string;
    actionLabel: string;
    asQuestions?: boolean;
  };
}

export interface SEMSeasonLesson {
  lessonNumber: number;
  phase: string;
  phaseNumber: number;
  focus: string;
  suggestedWalt: string;
  suggestedActivities: string[];
  roles: string[];
  competitionNote?: string;
}

export interface SEMSeasonPlan {
  activity: string;
  yearGroup?: string;
  pathway?: string;
  lessonCount: number;
  phases: { phase: number; name: string; lessonNumbers: number[]; focus: string }[];
  lessons: SEMSeasonLesson[];
  seasonRecord: SEMSeasonRecord;
}

const PHASE_TEMPLATES = [
  { phase: 1, name: "Orientation", focus: "Introduce season, rules, teams, roles, and scoring system" },
  { phase: 2, name: "Team Building", focus: "Team identity, values, meetings, and cooperative challenges" },
  { phase: 3, name: "Skill Development", focus: "Technical skill practice linked to season sport" },
  { phase: 4, name: "Tactical Development", focus: "Tactical problems, modified games, and role practice" },
  { phase: 5, name: "Competition", focus: "Formal fixtures, league play, and record keeping" },
  { phase: 6, name: "Final Event", focus: "Culminating festival, finals, or playoff round" },
  { phase: 7, name: "Reflection", focus: "Season review, awards, and transfer reflection" },
];

const TEAM_NAME_PREFIXES = ["Thunder", "Storm", "Phoenix", "Titan", "Eagle", "Shark", "Comet", "Vortex"];
const TEAM_COLOURS = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Teal", "White"];
const TEAM_VALUES = [
  "Respect and effort",
  "Teamwork first",
  "Fair play always",
  "Support every player",
  "Try your best",
  "Include everyone",
];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreBand(score: number): SEMQualityBand {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Developing";
  return "Limited";
}

function distributeLessonsAcrossPhases(lessonCount: number): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  if (lessonCount <= 0) return counts;

  if (lessonCount <= 4) {
    counts[0] = 1;
    counts[1] = 1;
    counts[4] = Math.max(1, lessonCount - 3);
    counts[6] = 1;
    return counts;
  }

  const weights = [1, 1, 2, 2, 3, 1, 1];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let assigned = 0;
  for (let i = 0; i < 7; i++) {
    counts[i] = Math.max(1, Math.round((weights[i] / totalWeight) * lessonCount));
    assigned += counts[i];
  }
  while (assigned > lessonCount) {
    const idx = counts.findIndex((c, i) => c > 1 && i !== 0 && i !== 6);
    if (idx === -1) break;
    counts[idx]--;
    assigned--;
  }
  while (assigned < lessonCount) {
    counts[4]++;
    assigned++;
  }
  return counts;
}

export function lessonToSEMContext(lesson: LessonBuilderFormData): SEMContext {
  const structured = (lesson.structuredActivities ?? [])
    .map((a) => `${a.name} ${a.taskDescription} ${a.students}`)
    .join(" ");
  return {
    yearGroup: lesson.yearGroup,
    pathway: lesson.selectedPathways?.[0] ?? lesson.pathwayId,
    topicId: lesson.topicId,
    activityArea: lesson.topicId,
    activity: lesson.topicId,
    walt: lesson.walt ?? lesson.learningIntention,
    wilf: lesson.successCriteria,
    activities: lesson.activities,
    differentiation: lesson.differentiation,
    assessmentNotes: lesson.assessmentNotes,
    reflectionNotes: lesson.reflectionNotes,
    structuredActivityText: structured,
    lessonAim: lesson.walt ?? lesson.learningIntention,
  };
}

export function collectSEMText(ctx: SEMContext): string {
  return [
    ctx.walt,
    ctx.wilf,
    ctx.activities,
    ctx.structuredActivityText,
    ctx.differentiation,
    ctx.assessmentNotes,
    ctx.reflectionNotes,
    ctx.lessonAim,
    ctx.activityArea,
    ctx.activity,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function generateSEMSeason(context: SEMContext): SEMSeasonPlan {
  const activity = context.activity ?? context.activityArea ?? context.topicId ?? "invasion game";
  const lessonCount = Math.max(4, context.lessonCount ?? 8);
  const phaseCounts = distributeLessonsAcrossPhases(lessonCount);
  const phases: SEMSeasonPlan["phases"] = [];
  const lessons: SEMSeasonLesson[] = [];
  let lessonNumber = 1;

  for (let i = 0; i < PHASE_TEMPLATES.length; i++) {
    const template = PHASE_TEMPLATES[i];
    const count = phaseCounts[i];
    const lessonNumbers: number[] = [];
    for (let j = 0; j < count; j++) {
      lessonNumbers.push(lessonNumber);
      const rolesForPhase =
        template.phase <= 2
          ? ["Captain", "Equipment Manager"]
          : template.phase <= 4
            ? ["Coach", "Referee", "Statistician"]
            : ["Coach", "Referee", "Statistician", "Fair Play Officer", "Journalist"];

      lessons.push({
        lessonNumber,
        phase: template.name,
        phaseNumber: template.phase,
        focus: template.focus,
        suggestedWalt: `We are learning to ${template.phase <= 3 ? "develop" : "apply"} ${activity} skills through our ${template.name.toLowerCase()} phase`,
        suggestedActivities: [
          template.phase === 1 ? "Season launch: teams, roles, rules, scoring" : "Team meeting (5 min)",
          template.phase <= 3 ? `${activity} skill or tactical practice` : `${activity} fixture or festival match`,
          template.phase >= 5 ? "Update league table and fair play points" : "Role practice rotation",
          template.phase === 7 ? "Season awards and reflection" : "Team debrief against WILF",
        ],
        roles: rolesForPhase,
        competitionNote:
          template.phase >= 5 ? "Formal competition — round-robin or festival format" : undefined,
      });
      lessonNumber++;
    }
    if (count > 0) {
      phases.push({
        phase: template.phase,
        name: template.name,
        lessonNumbers,
        focus: template.focus,
      });
    }
  }

  const teams = generateSEMTeams({ ...context, teamCount: context.teamCount ?? 4 }).teams;

  const seasonRecord: SEMSeasonRecord = {
    id: `sem-${activity.replace(/\s+/g, "-")}-${Date.now()}`,
    activity,
    yearGroup: context.yearGroup,
    pathway: context.pathway,
    lessonCount,
    phases: phases as SEMSeasonPhaseRecord[],
    teams,
    roles: [],
    standings: teams.map((t) => ({ teamId: t.id, points: 0, played: 0 })),
  };

  return { activity, yearGroup: context.yearGroup, pathway: context.pathway, lessonCount, phases, lessons, seasonRecord };
}

export function generateSEMTeams(context: SEMContext): {
  teams: SEMTeamRecord[];
  allocationGuidance: string[];
  mixedAbilityGuidance: string[];
  inclusionGuidance: string[];
  teamIdentityIdeas: string[];
} {
  const teamCount = Math.min(8, Math.max(2, context.teamCount ?? 4));
  const teams: SEMTeamRecord[] = [];

  for (let i = 0; i < teamCount; i++) {
    teams.push({
      id: `team-${i + 1}`,
      name: `${TEAM_NAME_PREFIXES[i % TEAM_NAME_PREFIXES.length]} ${activityShortName(context.activity ?? "Sport")}`,
      colour: TEAM_COLOURS[i % TEAM_COLOURS.length],
      values: [TEAM_VALUES[i % TEAM_VALUES.length], TEAM_VALUES[(i + 2) % TEAM_VALUES.length]],
      wins: 0,
      losses: 0,
      draws: 0,
      fairPlayPoints: 0,
      effortPoints: 0,
    });
  }

  return {
    teams,
    allocationGuidance: [
      "Balance teams by skill — avoid stacking all strong players in one team",
      "Keep friendship groups partially split to build new affiliation",
      "Assign captains for leadership potential, not only highest skill",
    ],
    mixedAbilityGuidance: [
      "Each team needs players, supporters, and role specialists",
      "Use handicap scoring or bonus points for team cooperation",
      "Rotate playing time so all contribute to fixture results",
    ],
    inclusionGuidance: [
      "Pair low-confidence pupils with wellbeing officer role option",
      "EAL pupils: visual team badge and role card",
      "SEND: modified playing role with full team membership maintained",
    ],
    teamIdentityIdeas: [
      "Design team badge in lesson 1",
      "Create team chant or handshake",
      "Agree two team values displayed on poster",
    ],
  };
}

function activityShortName(activity: string): string {
  const lower = activity.toLowerCase();
  if (/football|soccer|handball|basketball|hockey|rugby|netball/.test(lower)) {
    return activity.split(/[\s-]/)[0] ?? "United";
  }
  return "United";
}

export function generateSEMRoleAssignments(context: SEMContext): {
  assignments: { roleId: string; roleName: string; count: number; notes: string }[];
  rotationPlan: string;
  balanceNotes: string[];
} {
  const classSize = context.classSize ?? 28;
  const teamCount = Math.max(2, context.teamCount ?? 4);
  const pupilsPerTeam = Math.ceil(classSize / teamCount);
  const isPrimary = context.yearGroup?.includes("year-1") || context.yearGroup?.includes("year-2") ||
    context.yearGroup?.includes("year-3") || context.yearGroup?.includes("year-4");

  const rolesToUse = isPrimary
    ? SEM_ROLES.filter((r) => ["captain", "referee", "statistician", "equipment-manager"].includes(r.id))
    : SEM_ROLES;

  const assignments = rolesToUse.map((role) => {
    const count = role.id === "captain" ? teamCount : Math.max(1, Math.floor(classSize / rolesToUse.length));
    return {
      roleId: role.id,
      roleName: role.name,
      count,
      notes: `${count} pupil(s) — ${role.responsibilities[0]}`,
    };
  });

  return {
    assignments,
    rotationPlan: isPrimary
      ? "Rotate 3 core roles every 2 lessons"
      : "Rotate full role portfolio each lesson — track on role rotation chart",
    balanceNotes: [
      `~${pupilsPerTeam} pupils per team across ${teamCount} teams`,
      "Ensure every pupil holds at least 2 different roles across the season",
      "Match referee and statistician roles to pupils developing confidence",
    ],
  };
}

export function generateSEMAssessmentFramework(context: SEMContext): {
  categories: {
    domain: string;
    indicators: string[];
    rubricIdeas: string[];
    evidenceOpportunities: string[];
    observationPrompts: string[];
  }[];
} {
  const activity = context.activity ?? context.activityArea ?? "sport";
  return {
    categories: [
      {
        domain: "Physical",
        indicators: ["Skill execution", "Performance under competition", "Movement quality"],
        rubricIdeas: [
          "Emerging / Developing / Confident / Expert skill performance",
          "Personal improvement across season — not rank order",
        ],
        evidenceOpportunities: [
          `${activity} skill observation during fixtures`,
          "Personal best tracker across season",
          "Video snapshot of technique in competition",
        ],
        observationPrompts: [
          "Can pupil perform skill under defensive pressure?",
          "Has performance improved since orientation phase?",
        ],
      },
      {
        domain: "Cognitive",
        indicators: ["Tactics", "Rules knowledge", "Decision making"],
        rubricIdeas: [
          "Recalls rules → applies rules → adapts tactics",
          "Role-specific cognitive checklist (referee, coach, statistician)",
        ],
        evidenceOpportunities: [
          "Tactical explanation in team meeting",
          "Referee rule application log",
          "Statistician data interpretation",
        ],
        observationPrompts: [
          "Does pupil explain why a tactic was chosen?",
          "Can referee apply rule consistently?",
        ],
      },
      {
        domain: "Social",
        indicators: ["Teamwork", "Communication", "Collaboration in roles"],
        rubricIdeas: [
          "Isolated → Cooperative → Leading communication",
          "Team meeting contribution rubric",
        ],
        evidenceOpportunities: [
          "Peer feedback on teamwork",
          "Coach role observation during timeout",
          "Fair play officer report",
        ],
        observationPrompts: [
          "Does pupil include all teammates in decisions?",
          "Communication clear under match pressure?",
        ],
      },
      {
        domain: "Affective",
        indicators: ["Leadership", "Responsibility", "Sportsmanship"],
        rubricIdeas: [
          "Fair play points scale 1–5",
          "Leadership role portfolio with examples",
        ],
        evidenceOpportunities: [
          "Fair play point log across season",
          "Captain inclusion checklist",
          "Season reflection on responsibility growth",
        ],
        observationPrompts: [
          "Shows sportsmanship when losing?",
          "Takes responsibility for role without reminder?",
        ],
      },
    ],
  };
}

export function evaluateSEMMotivationPotential(context: SEMContext): {
  score: number;
  autonomy: { present: boolean; note: string };
  competence: { present: boolean; note: string };
  relatedness: { present: boolean; note: string };
  strengths: string[];
  risks: string[];
  improvements: string[];
} {
  const text = collectSEMText(context);
  let score = 40;
  const strengths: string[] = [];
  const risks: string[] = [];
  const improvements: string[] = [];

  const autonomy = /\b(choice|role|captain|self.?select|team decision|pupil.?led)\b/i.test(text);
  const competence = /\b(skill|improve|progress|personal best|challenge|develop)\b/i.test(text);
  const relatedness = /\b(team|affiliation|belong|together|fair play|support|include)\b/i.test(text);

  if (autonomy) { score += 20; strengths.push("Autonomy through roles and team decisions"); }
  else { risks.push("Limited pupil autonomy"); improvements.push("Add pupil roles and team meetings"); }

  if (competence) { score += 20; strengths.push("Competence development planned"); }
  else { risks.push("Competence path unclear"); improvements.push("Link fixtures to skill development phases"); }

  if (relatedness) { score += 20; strengths.push("Team affiliation supports relatedness"); }
  else { risks.push("Weak team belonging signals"); improvements.push("Create persistent teams with identity in lesson 1"); }

  if (/\b(winner takes all|elimination|knockout)\b/i.test(text)) {
    risks.push("Win-only motivation may reduce relatedness");
    improvements.push("Add fair play and effort points alongside results");
  }

  return {
    score: clamp(score),
    autonomy: { present: autonomy, note: autonomy ? "Roles and choices present" : "Add role assignment and team decisions" },
    competence: { present: competence, note: competence ? "Skill progression linked" : "Add skill development phases" },
    relatedness: { present: relatedness, note: relatedness ? "Team affiliation signalled" : "Build team identity and belonging" },
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
    improvements: improvements.slice(0, 3),
  };
}

export function evaluateSEMInclusion(context: SEMContext): {
  score: number;
  send: string[];
  eal: string[];
  lowConfidence: string[];
  lowSkill: string[];
  highSkill: string[];
  suggestedRoles: string[];
  adaptations: string[];
  participationSupports: string[];
} {
  const text = collectSEMText(context);
  let score = 45;
  const diff = `${context.differentiation ?? ""}`.toLowerCase();

  if (/\b(role|captain|referee|statistician|wellbeing|fair play|include)\b/i.test(text)) score += 15;
  if (/\b(mixed.?ability|differentiat|support|adapt|send|eal|confidence)\b/i.test(text)) score += 15;
  if (/\b(participation|everyone|all pupils|rotate)\b/i.test(text)) score += 10;

  return {
    score: clamp(score),
    send: [
      "Non-playing roles with full team membership",
      "Modified rules with same team points system",
      "Visual role cards and simplified fixture list",
    ],
    eal: [
      "Picture-based role and rule cards",
      "Bilingual key vocabulary for sport terms",
      "Journalist role with sentence starters",
    ],
    lowConfidence: [
      "Wellbeing Officer or Equipment Manager to start",
      "Practice roles before live competition",
      "Private encouragement — avoid public ranking",
    ],
    lowSkill: [
      "Specialist role contribution counts toward team points",
      "Handicap or bonus scoring for team cooperation",
      "Shorter playing rotations with full role participation",
    ],
    highSkill: [
      "Coach or Captain with leadership criteria — not dominance",
      "Stretch: design tactical play for team meeting",
      "Peer coaching role with assessment rubric",
    ],
    suggestedRoles: ["Wellbeing Officer", "Statistician", "Equipment Manager", "Fair Play Officer", "Journalist"],
    adaptations: diff.includes("support")
      ? ["Use existing differentiation notes alongside role pathways", "Team points include role performance"]
      : ["Add role-based participation pathways", "Fair play points weighted equally to wins"],
    participationSupports: [
      "Every pupil assigned a role before first fixture",
      "Rotate roles so no one is sidelined all season",
      "Participation points for attendance and effort",
    ],
  };
}

export function evaluateSEMCompetitionBalance(context: SEMContext): {
  score: number;
  verdict: "balanced" | "excessive" | "under-competitive";
  flags: string[];
  suggestions: string[];
} {
  const text = collectSEMText(context);
  let score = 55;
  const flags: string[] = [];
  const suggestions: string[] = [];

  if (/\b(elimination|knockout|winner takes all|single elimination)\b/i.test(text)) {
    flags.push("Elimination structure");
    score -= 20;
    suggestions.push("Switch to round-robin so all teams play full season");
  }
  if (/\b(excessive|intense|high stakes|must win)\b/i.test(text)) {
    flags.push("Excessive competition emphasis");
    score -= 15;
    suggestions.push("Balance results with fair play and effort points");
  }
  if (!/\b(round.?robin|league|fixture|fair play|effort point|participation)\b/i.test(text)) {
    flags.push("Disengagement risk — format unclear");
    suggestions.push("Add round-robin fixtures with published schedule");
  } else {
    score += 15;
  }

  if (/\b(fair play|effort|bonus|participation score)\b/i.test(text)) score += 15;

  const verdict =
    flags.includes("Elimination structure") || flags.includes("Excessive competition emphasis")
      ? "excessive"
      : !/\b(compet|fixture|league|tournament|match)\b/i.test(text)
        ? "under-competitive"
        : "balanced";

  if (verdict === "under-competitive") {
    suggestions.push("Add formal competition phase with visible fixtures");
  }

  return { score: clamp(score), verdict, flags: flags.slice(0, 3), suggestions: suggestions.slice(0, 4) };
}

export function generateFairPlayFramework(context: SEMContext): {
  values: { name: string; behaviours: string[] }[];
  pointSystem: string[];
  trackingIdeas: string[];
  recognitionIdeas: string[];
} {
  return {
    values: [
      { name: "Respect", behaviours: ["Shake hands before and after", "Accept referee decisions", "Encourage opponents"] },
      { name: "Responsibility", behaviours: ["Arrive ready for role", "Complete record-keeping duties", "Own mistakes"] },
      { name: "Teamwork", behaviours: ["Include all teammates", "Share playing time", "Support after errors"] },
      { name: "Effort", behaviours: ["Try throughout match", "Recover after setback", "Sustain intensity"] },
      { name: "Inclusion", behaviours: ["Invite quieter peers", "Adapt for teammates", "Celebrate all contributions"] },
    ],
    pointSystem: [
      "Fair Play Officer awards 0–3 points per team per fixture",
      "Effort points: 1 per pupil meeting team effort criteria",
      "Bonus point for respecting values when losing",
      "Fair play points weighted at 20% of league standing",
    ],
    trackingIdeas: [
      "Fair play log sheet per fixture",
      "Team fair play total on league poster",
      "Weekly fair play leader badge",
    ],
    recognitionIdeas: [
      "Fair Play Team of the Week",
      "Effort award — not only MVP",
      "Most Improved Team recognition",
      "Peer-nominated sportsmanship award",
    ],
  };
}

export function generateSEMRecordKeeping(context: SEMContext): {
  teamTables: string[];
  attendanceTracking: string[];
  leadershipPoints: string[];
  effortPoints: string[];
  fairPlayPoints: string[];
  performanceStatistics: string[];
  futureReadyFields: string[];
} {
  return {
    teamTables: [
      "League table: Played | Won | Drawn | Lost | Points | Fair Play",
      "Role rotation chart by pupil and lesson",
      "Season fixture list with dates and results",
    ],
    attendanceTracking: [
      "Team attendance register per lesson",
      "Participation point for full attendance",
      "Note role fulfilment when pupil absent",
    ],
    leadershipPoints: [
      "Captain leadership checklist per fixture",
      "Coach timeout quality rating 1–3",
      "Role completion points per lesson",
    ],
    effortPoints: [
      "Team effort rating after each match",
      "Individual effort token system",
      "Effort points added to league total",
    ],
    fairPlayPoints: [
      "Fair Play Officer log per team per game",
      "Weekly fair play standings",
      "Fair play multiplier in final standings",
    ],
    performanceStatistics: [
      "Scores for/against per team",
      "Top scorer and assist tracker (optional)",
      "Personal improvement stat per pupil",
    ],
    futureReadyFields: [
      "teamId",
      "played",
      "won",
      "drawn",
      "lost",
      "points",
      "fairPlayTotal",
      "effortTotal",
      "rolePoints",
    ],
  };
}

export function generateSEMCulminatingEvent(context: SEMContext): {
  eventName: string;
  format: string[];
  awards: string[];
  celebrations: string[];
  recognition: string[];
  reflectionActivities: string[];
} {
  const activity = context.activity ?? context.activityArea ?? "Sport";
  return {
    eventName: `${activity} Season Festival`,
    format: [
      "Final round-robin or semi-final/final structure",
      "All teams play at least two matches",
      "Mixed ability roles active during event",
    ],
    awards: [
      "Season Champions (results)",
      "Fair Play Team Award",
      "Best Leadership (Captain/Coach)",
      "Most Improved Team",
      "Outstanding Role Performance (Statistician, Referee, Journalist)",
      "Effort Award — voted by peers",
    ],
    celebrations: [
      "Team parade or handshake line",
      "Music during award presentation",
      "Team photo with season poster",
    ],
    recognition: [
      "Every team recognised for one strength",
      "Individual role certificates",
      "Season highlights read by journalist pupils",
    ],
    reflectionActivities: [
      "Team meeting: proudest moment and next goal",
      "Individual exit ticket: role learned and responsibility shown",
      "Transfer question: where else do these values matter?",
    ],
  };
}

export function buildSEMLessonTemplate(context: SEMContext): {
  warmUp: string;
  teamMeeting: string;
  learningTask: string;
  competitionTask: string;
  reflection: string;
  roleResponsibilities: Record<string, string>;
} {
  const activity = context.activity ?? context.activityArea ?? "invasion game";
  const phase = /\b(compet|fixture|league|final|festival)\b/i.test(collectSEMText(context))
    ? "competition"
    : /\b(reflect|review|award)\b/i.test(collectSEMText(context))
      ? "reflection"
      : "development";

  return {
    warmUp: `Team ${activity} warm-up led by Captain — include ball/movement prep and team chant`,
    teamMeeting: "5 min: review WALT/WILF, assign today’s roles, tactical focus for fixture or practice",
    learningTask:
      phase === "development"
        ? `${activity} skill or tactical practice — Coach supports, Referee runs mini-game`
        : `${activity} skill maintenance — quick technique focus before fixture`,
    competitionTask:
      phase === "competition" || phase === "reflection"
        ? "Formal fixture or festival match — Statistician records, Fair Play Officer scores values"
        : "Modified game or intra-team challenge — build toward competition format",
    reflection: "Team debrief: fair play, effort, role performance, next fixture preparation",
    roleResponsibilities: Object.fromEntries(
      SEM_ROLES.map((r) => [r.name, r.responsibilities[0]])
    ),
  };
}

export function evaluateSEMQuality(context: SEMContext): {
  score: number;
  band: SEMQualityBand;
  dimensionScores: Record<string, number>;
  warnings: string[];
  practicalFixes: string[];
  strongestArea: string;
  weakestArea: string;
} {
  const text = collectSEMText(context);
  const dimensionScores: Record<string, number> = {
    affiliation: /\b(team|affiliation|belong|captain|team name|team colour)\b/i.test(text) ? 70 : 35,
    roles: /\b(role|coach|referee|statistician|journalist|captain|equipment|wellbeing|fair play officer)\b/i.test(text) ? 72 : 30,
    competition: /\b(compet|fixture|league|tournament|round.?robin|match)\b/i.test(text) ? 68 : 38,
    records: /\b(record|table|statistic|score|standing|points|attendance)\b/i.test(text) ? 65 : 32,
    reflection: /\b(reflect|review|debrief|team meeting|award|celebrat)\b/i.test(text) ? 70 : 35,
    inclusion: /\b(include|differentiat|send|eal|confidence|mixed.?ability|wellbeing)\b/i.test(text) ? 68 : 40,
    festivity: /\b(festival|celebrat|award|festivity|ceremony|recognition)\b/i.test(text) ? 65 : 35,
  };

  const keys = Object.keys(dimensionScores);
  const score = clamp(keys.reduce((s, k) => s + dimensionScores[k], 0) / keys.length);
  const sorted = [...keys].sort((a, b) => dimensionScores[b] - dimensionScores[a]);

  const warnings: string[] = [];
  const practicalFixes: string[] = [];

  for (const w of SEM_WARNINGS) {
    if (w.id === "competition-only" && dimensionScores.competition >= 60 && dimensionScores.roles < 50) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-affiliation" && dimensionScores.affiliation < 50) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-roles" && dimensionScores.roles < 50) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "elimination" && /\b(elimination|knockout)\b/i.test(text)) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "winners-only" && dimensionScores.festivity < 50 && dimensionScores.competition >= 55) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-records" && dimensionScores.records < 50) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "no-reflection" && dimensionScores.reflection < 50) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
    if (w.id === "inclusion-gap" && dimensionScores.inclusion < 50) {
      warnings.push(w.warning);
      practicalFixes.push(w.suggestedFix);
    }
  }

  return {
    score,
    band: scoreBand(score),
    dimensionScores,
    warnings: [...new Set(warnings)].slice(0, 4),
    practicalFixes: [...new Set(practicalFixes)].slice(0, 4),
    strongestArea: sorted[0] ?? "affiliation",
    weakestArea: sorted[sorted.length - 1] ?? "roles",
  };
}

export function buildSEMPlanningInsights(promptOrText: string, ctx?: SEMContext): string[] {
  const context: SEMContext = ctx ?? { lessonAim: promptOrText, walt: promptOrText, activities: promptOrText };
  const combined = collectSEMText(context) + " " + promptOrText;
  if (!isSEMRelevant(combined)) return [];

  const quality = evaluateSEMQuality(context);
  const competition = evaluateSEMCompetitionBalance(context);
  const insights: string[] = [];

  if (quality.dimensionScores.affiliation < 55) insights.push("Create persistent teams with names and values.");
  if (quality.dimensionScores.roles < 55) insights.push("Assign student roles — coach, referee, statistician.");
  if (quality.dimensionScores.records < 55) insights.push("Add fair play scoring and a visible league table.");
  if (quality.dimensionScores.competition < 55) insights.push("Add season structure with formal fixtures.");
  if (competition.flags.length > 0) insights.push("Add fair play scoring — avoid elimination formats.");
  if (quality.dimensionScores.reflection < 55) insights.push("Plan team meeting reflection after each fixture.");

  if (insights.length === 0) {
    insights.push("Launch season: teams, roles, scoring system, and fixture list in lesson 1.");
  }

  return insights.slice(0, 5);
}

export function buildPedagogyCoachSEMMetrics(lesson: LessonBuilderFormData): {
  score: number;
  band: string;
  roleOpportunities: string;
  responsibilityOpportunities: string;
  reflectionOpportunities: string;
  teamAffiliationIdeas: string;
  warning: string | null;
} | null {
  const ctx = lessonToSEMContext(lesson);
  const text = collectSEMText(ctx);
  if (!isSEMRelevant(text) && !lesson.pedagogicalModels?.includes("sport-education")) return null;

  const quality = evaluateSEMQuality(ctx);
  const roles = generateSEMRoleAssignments({ ...ctx, classSize: 28 });
  const template = buildSEMLessonTemplate(ctx);
  const teams = generateSEMTeams(ctx);

  return {
    score: quality.score,
    band: quality.band,
    roleOpportunities: roles.assignments.slice(0, 3).map((a) => a.roleName).join(", ") || "Captain, Referee, Statistician",
    responsibilityOpportunities: SEM_ROLES.find((r) => r.id === "fair-play-officer")?.responsibilities[0] ?? "Fair play monitoring",
    reflectionOpportunities: template.reflection,
    teamAffiliationIdeas: teams.teamIdentityIdeas[0] ?? "Team badge and values poster",
    warning: quality.warnings[0] ?? null,
  };
}

export function buildSEMQualityReview(lesson: LessonBuilderFormData): {
  score: number;
  band: SEMQualityBand;
  checks: { label: string; met: boolean }[];
  warnings: string[];
  recommendations: string[];
} {
  const ctx = lessonToSEMContext(lesson);
  const quality = evaluateSEMQuality(ctx);
  const competition = evaluateSEMCompetitionBalance(ctx);
  const inclusion = evaluateSEMInclusion(ctx);

  const checks = [
    { label: "Roles present", met: quality.dimensionScores.roles >= 55 },
    { label: "Affiliation present", met: quality.dimensionScores.affiliation >= 55 },
    { label: "Competition balanced", met: competition.verdict === "balanced" },
    { label: "Reflection included", met: quality.dimensionScores.reflection >= 55 },
    { label: "Inclusion supported", met: inclusion.score >= 55 },
  ];

  return {
    score: quality.score,
    band: quality.band,
    checks,
    warnings: quality.warnings,
    recommendations: quality.practicalFixes.length > 0 ? quality.practicalFixes : [`Strengthen ${quality.weakestArea} — core SEM characteristic`],
  };
}

export function buildSEMQualityInsights(lesson: LessonBuilderFormData): SEMQualityInsight[] {
  const ctx = lessonToSEMContext(lesson);
  if (!isSEMRelevant(collectSEMText(ctx)) && !lesson.pedagogicalModels?.includes("sport-education")) return [];

  const review = buildSEMQualityReview(lesson);
  const insights: SEMQualityInsight[] = [];

  insights.push({
    id: "sem-review",
    area: "SEM Review",
    message: `${review.band} SEM design (${review.score}/100)`,
    prompt: review.checks.filter((c) => !c.met).map((c) => c.label).join("; ") || "Core SEM checks met",
    entryId: "sem-master",
  });

  for (const w of review.warnings.slice(0, 2)) {
    const fix = SEM_WARNINGS.find((x) => x.warning === w);
    insights.push({
      id: `sem-${w.slice(0, 12)}`,
      area: "Sport Education Model",
      message: w,
      prompt: fix?.whyItMatters,
      entryId: "sem-master",
      fix: fix
        ? {
            target: w.includes("role") ? "reflectionNotes" : w.includes("fair") ? "assessmentNotes" : "teacherNotes",
            text: fix.suggestedFix,
            actionLabel: "Apply fix",
          }
        : undefined,
    });
  }

  return insights;
}

export function buildSchemeSEMTips(
  scheme: Pick<SchemeOfWork, "lessons" | "topicId" | "yearGroup" | "pathway" | "selectedPathways">,
  activeLessonIndex = 0
): string[] {
  const text = scheme.lessons.map((l) => `${l.walt} ${l.wilf ?? ""} ${l.activities}`).join(" ");
  const ctx: SEMContext = {
    yearGroup: scheme.yearGroup,
    pathway: scheme.selectedPathways?.[0] ?? scheme.pathway,
    topicId: scheme.topicId,
    activity: scheme.topicId,
    lessonCount: scheme.lessons.length,
    walt: text,
    activities: text,
  };

  if (!isSEMRelevant(text) && scheme.lessons.length < 5) return [];

  const season = generateSEMSeason(ctx);
  const assessment = generateSEMAssessmentFramework(ctx);
  const tips: string[] = [];

  if (scheme.lessons.length >= 5) {
    tips.push(`SEM unit opportunity: ${scheme.lessons.length}-lesson season for ${season.activity}`);
    const activePhase = season.lessons[activeLessonIndex]?.phase ?? season.phases[0]?.name;
    tips.push(`Season phase (lesson ${activeLessonIndex + 1}): ${activePhase}`);
  }

  tips.push(`Competition: ${season.phases.find((p) => p.name === "Competition")?.focus ?? "Round-robin fixtures with fair play points"}`);
  tips.push(`Assessment: ${assessment.categories[0]?.domain} — ${assessment.categories[0]?.evidenceOpportunities[0]}`);
  tips.push(`Culminating event: ${generateSEMCulminatingEvent(ctx).awards.slice(0, 2).join("; ")}`);
  tips.push(`Record keeping: ${generateSEMRecordKeeping(ctx).teamTables[0]}`);

  return tips.slice(0, 6);
}

/** Export season record for future dashboard / printable integration. */
export function buildSEMSeasonRecord(context: SEMContext): SEMSeasonRecord {
  return generateSEMSeason(context).seasonRecord;
}

export function getSEMCharacteristicsSummary(): string[] {
  return SEM_CHARACTERISTICS.map((c) => `${c.name}: ${c.purpose}`);
}

export function getSEMRolesSummary(): string[] {
  return SEM_ROLES.map((r) => `${r.name}: ${r.responsibilities[0]}`);
}
