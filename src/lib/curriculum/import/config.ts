import type { PathwayId } from "../types";
import type { CurriculumSourceFormat, ImportSourceConfig } from "./types";

/** Known Malta PE pathways — used to validate extracted pathway IDs. */
export const KNOWN_PATHWAYS: Record<
  PathwayId,
  { label: string; filenameHints: string[] }
> = {
  "early-years-pe": {
    label: "Early Years PE",
    filenameHints: ["early-years", "early_years", "ey-pe", "kindergarten"],
  },
  "primary-pe": {
    label: "Primary PE",
    filenameHints: ["primary-pe", "primary_pe", "primary"],
  },
  "middle-school-pe": {
    label: "Middle School PE",
    filenameHints: ["middle-school", "middle_school", "middle"],
  },
  "secondary-pe": {
    label: "Secondary PE",
    filenameHints: ["secondary-pe", "secondary_pe", "secondary"],
  },
  "pe-option-sec": {
    label: "PE Option SEC",
    filenameHints: ["pe-option", "pe_option", "sec-option", "option-sec"],
  },
  "alp-pe": {
    label: "ALP Physical Education",
    filenameHints: ["alp-pe", "alp_pe", "alp-physical"],
  },
  "alp-sports-vocational": {
    label: "ALP Sports Vocational",
    filenameHints: ["alp-sports", "alp_sports", "sports-vocational", "vocational"],
  },
  "fitness-curriculum": {
    label: "Fitness Curriculum",
    filenameHints: ["fitness", "fitness-curriculum", "hrf"],
  },
};

/** Topic labels recognised in curriculum PDF section headers and LO codes. */
export const TOPIC_ALIASES: Record<string, string> = {
  handball: "Handball",
  hb: "Handball",
  football: "Football",
  fb: "Football",
  soccer: "Football",
  basketball: "Basketball",
  bb: "Basketball",
  athletics: "Athletics",
  ath: "Athletics",
  at: "Athletics",
  fitness: "Fitness",
  fit: "Fitness",
  ft: "Fitness",
  gymnastics: "Gymnastics",
  gym: "Gymnastics",
  gy: "Gymnastics",
  volleyball: "Volleyball",
  vb: "Volleyball",
  netball: "Netball",
  nb: "Netball",
  swimming: "Swimming / Aquatics",
  aquatics: "Swimming / Aquatics",
  sw: "Swimming / Aquatics",
  dance: "Educational Dance",
  "educational dance": "Educational Dance",
  hockey: "Hockey",
  hk: "Hockey",
  rugby: "Rugby",
  rg: "Rugby",
  "invasion games": "Invasion Games",
  ig: "Invasion Games",
  "net games": "Net Games",
  ng: "Net Games",
  "striking and fielding": "Striking and Fielding Games",
  sf: "Striking and Fielding Games",
  outdoor: "Outdoor Recreation",
  "outdoor recreation": "Outdoor Recreation",
  or: "Outdoor Recreation",
  "healthy lifestyle": "Healthy Lifestyle",
  teamwork: "Teamwork",
  leadership: "Leadership",
  "sport values": "Sport Values",
  "pe option theory": "PE Option Theory",
  "alp physical education": "ALP Physical Education",
  "alp sports vocational": "ALP Sports Vocational",
};

/** Skill labels recognised in curriculum text. */
export const SKILL_ALIASES: Record<string, string> = {
  passing: "Passing",
  pass: "Passing",
  receiving: "Receiving",
  receive: "Receiving",
  catching: "Catching",
  catch: "Catching",
  throwing: "Throwing",
  throw: "Throwing",
  shooting: "Shooting",
  shoot: "Shooting",
  kicking: "Kicking",
  kick: "Kicking",
  dribbling: "Dribbling",
  dribble: "Dribbling",
  finishing: "Shooting",
  finish: "Shooting",
  running: "Running",
  run: "Running",
  sprinting: "Sprinting",
  sprint: "Sprinting",
  jumping: "Jumping",
  jump: "Jumping",
  landing: "Landing",
  land: "Landing",
  movement: "Movement",
  move: "Movement",
  endurance: "Endurance",
  stamina: "Endurance",
  strength: "Strength",
  flexibility: "Flexibility",
  stretch: "Flexibility",
  coordination: "Coordination",
  balance: "Balance",
  balancing: "Balance",
  rolling: "Rolling",
  roll: "Rolling",
  travelling: "Travelling",
  traveling: "Travelling",
  travel: "Travelling",
  agility: "Agility",
  speed: "Speed",
  defending: "Defending",
  defend: "Defending",
  attacking: "Attacking",
  attack: "Attacking",
  tactics: "Analysis",
  analyse: "Analysis",
  analyze: "Analysis",
  observation: "Analysis",
  teamwork: "Cooperation",
  cooperation: "Cooperation",
  cooperate: "Cooperation",
  communication: "Communication",
  communicate: "Communication",
  officiating: "Officiating",
  referee: "Officiating",
  safety: "Safety",
  safe: "Safety",
  serving: "Passing",
  serve: "Passing",
};

/** LO code middle-segment → topic name (e.g. PRI.HB.P1 → Handball). */
export const CODE_TOPIC_SEGMENTS: Record<string, string> = {
  HB: "Handball",
  FB: "Football",
  BB: "Basketball",
  AT: "Athletics",
  ATH: "Athletics",
  FT: "Fitness",
  FIT: "Fitness",
  GY: "Gymnastics",
  GYM: "Gymnastics",
  VB: "Volleyball",
  NB: "Netball",
  SW: "Swimming / Aquatics",
  DAN: "Educational Dance",
  IG: "Invasion Games",
  NG: "Net Games",
  SF: "Striking and Fielding Games",
  OR: "Outdoor Recreation",
  HK: "Hockey",
  RG: "Rugby",
};

/** LO code skill-segment hints (last segment prefix). */
export const CODE_SKILL_SEGMENTS: Record<string, string> = {
  P: "Passing",
  R: "Receiving",
  T: "Throwing",
  S: "Shooting",
  K: "Kicking",
  D: "Dribbling",
  F: "Shooting",
  M: "Movement",
  E: "Endurance",
  C: "Coordination",
  B: "Balance",
  J: "Jumping",
  L: "Landing",
  A: "Attacking",
  G: "Agility",
};

export const YEAR_GROUP_PATTERNS = [
  /\bYear\s*([1-9]|1[0-1])\b/gi,
  /\bForm\s*([1-5])\b/gi,
] as const;

export const VALUE_KEYWORDS: { pattern: RegExp; theme: string; label: string }[] = [
  { pattern: /\bfair\s*play\b/i, theme: "fair-play", label: "Fair play" },
  { pattern: /\brespect\b/i, theme: "respect", label: "Respect" },
  { pattern: /\bteamwork\b/i, theme: "teamwork", label: "Teamwork" },
  { pattern: /\bresponsibility\b/i, theme: "responsibility", label: "Responsibility" },
  { pattern: /\binclusion\b/i, theme: "inclusion", label: "Inclusion" },
  { pattern: /\bleadership\b/i, theme: "leadership", label: "Leadership" },
  { pattern: /\bsportsmanship\b/i, theme: "fair-play", label: "Sportsmanship" },
];

/** IM 36 is out of scope (coverage up to Form 5 only). */
export const IGNORED_SOURCE_PATTERNS: RegExp[] = [
  /^IM36/i,
  /^IM_36/i,
  /im\s*36/i,
];

export function isIgnoredSourceFile(filename: string): boolean {
  const base = filename.replace(/\.(pdf|docx)$/i, "");
  return IGNORED_SOURCE_PATTERNS.some((pattern) => pattern.test(filename) || pattern.test(base));
}

const FILENAME_PATHWAY_RULES: { pattern: RegExp; pathwayId: PathwayId; label: string; yearGroups?: string[] }[] = [
  { pattern: /kinder|early[\s_-]?years|level[\s_-]?3/i, pathwayId: "early-years-pe", label: "Early Years PE", yearGroups: ["Year 1", "Year 2"] },
  { pattern: /sec\s*32|sec32/i, pathwayId: "pe-option-sec", label: "PE Option SEC", yearGroups: ["Year 10", "Year 11"] },
  { pattern: /sport[\s_-]?values/i, pathwayId: "secondary-pe", label: "Secondary PE", yearGroups: ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11"] },
  { pattern: /fitness|cope/i, pathwayId: "fitness-curriculum", label: "Fitness Curriculum" },
  { pattern: /pe[\s_-]?syllabus|learning[\s_-]?outcomes/i, pathwayId: "secondary-pe", label: "Secondary PE" },
  {
    pattern: /accredited\s*alp\s*sports|alp\s*sports\s*lo/i,
    pathwayId: "alp-sports-vocational",
    label: "ALP Sports Vocational",
  },
  {
    pattern: /alp\s*supplementary\s*lo.*l2/i,
    pathwayId: "alp-sports-vocational",
    label: "ALP Sports Vocational",
  },
  {
    pattern: /alp\s*supplementary.*pe|lifeskills|healthy\s*lifestyle/i,
    pathwayId: "alp-pe",
    label: "ALP Physical Education",
  },
];

export function inferPathwayFromFilename(filename: string): ImportSourceConfig | null {
  const base = filename.replace(/\.(pdf|docx)$/i, "");
  const format: CurriculumSourceFormat = /\.docx$/i.test(filename) ? "docx" : "pdf";

  for (const rule of FILENAME_PATHWAY_RULES) {
    if (rule.pattern.test(base)) {
      return {
        file: filename,
        pathwayId: rule.pathwayId,
        pathwayLabel: rule.label,
        defaultYearGroups: rule.yearGroups,
        format,
      };
    }
  }

  const lower = base.toLowerCase();
  for (const [id, meta] of Object.entries(KNOWN_PATHWAYS)) {
    if (meta.filenameHints.some((hint) => lower.includes(hint))) {
      return {
        file: filename,
        pathwayId: id,
        pathwayLabel: meta.label,
        format,
      };
    }
  }

  return null;
}
