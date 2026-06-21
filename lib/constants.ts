import type { PathwayId, PlanningLevel } from "./types";

export const APP_NAME = "PE Curriculum Studio";
export const APP_SUBTITLE = "Malta";

export const PATHWAYS: { id: PathwayId; label: string; description: string }[] = [
  {
    id: "early-years-pe",
    label: "Early Years",
    description: "Movement foundations for KG1–Year 2.",
  },
  {
    id: "primary-pe",
    label: "Primary PE",
    description: "Core physical education for Years 1–6.",
  },
  {
    id: "general-pe",
    label: "General PE",
    description: "Secondary physical education for Years 7–11.",
  },
  {
    id: "pe-option-sec",
    label: "PE Option SEC",
    description: "Years 9–11 examined subject leading to SEC certificate.",
  },
  {
    id: "alp-pe",
    label: "ALP Physical Education",
    description: "Applied Learning Programme in Physical Education.",
  },
  {
    id: "alp-sports-vocational",
    label: "ALP Sports Vocational",
    description: "Vocational sports pathway within ALP.",
  },
  {
    id: "fitness-curriculum",
    label: "Fitness Curriculum",
    description: "Health-related fitness and wellbeing focus.",
  },
  {
    id: "sport-values",
    label: "Sport Values",
    description: "Fair play, respect, and personal development through sport.",
  },
];

export { YEAR_GROUP_IDS as YEAR_GROUPS } from "./year-groups";
export {
  DEFAULT_YEAR_GROUP_ID,
  getYearGroupLabel,
  normalizeYearGroupForMatching,
  toImportedYearGroupLabels,
  YEAR_GROUP_OPTIONS,
  YEAR_GROUP_SECTIONS,
} from "./year-groups";

export const PLANNING_LEVELS: { id: PlanningLevel; label: string; description: string }[] = [
  {
    id: "macro",
    label: "Macro",
    description: "Annual or term-wide curriculum map.",
  },
  {
    id: "meso",
    label: "Meso",
    description: "Half-term or unit block planning.",
  },
  {
    id: "micro",
    label: "Micro",
    description: "Weekly sequence and progression.",
  },
  {
    id: "daily",
    label: "Daily",
    description: "Individual lesson slots.",
  },
];

export const SPORTS = [
  "Athletics",
  "Badminton",
  "Basketball",
  "Cricket",
  "Dance",
  "Football",
  "Gymnastics",
  "Handball",
  "Hockey",
  "Netball",
  "Rugby",
  "Swimming",
  "Tennis",
  "Volleyball",
  "Fitness",
  "General",
];

export const SKILLS = [
  "Passing",
  "Throwing",
  "Catching",
  "Kicking",
  "Dribbling",
  "Shooting",
  "Defending",
  "Attacking",
  "Movement",
  "Balance",
  "Coordination",
  "Endurance",
  "Strength",
  "Flexibility",
  "Teamwork",
  "Tactics",
];

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "home" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/lessons", label: "Lesson Plans", icon: "lessons" },
  { href: "/lesson-builder", label: "Lesson Builder", icon: "builder" },
  { href: "/schemes", label: "Schemes of Work", icon: "schemes" },
  { href: "/curriculum", label: "Curriculum Hub", icon: "curriculum" },
  { href: "/curriculum-analytics", label: "Teaching Progress", icon: "analytics" },
  { href: "/curriculum-assistant", label: "Curriculum Assistant", icon: "assistant" },
  { href: "/resources", label: "Teaching Resources", icon: "resources" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;

export const NAV_SECTIONS = [
  {
    title: "Planning",
    items: [
      { href: "/calendar", label: "Calendar", icon: "calendar" },
      { href: "/lessons", label: "Lesson Plans", icon: "lessons" },
      { href: "/lesson-builder", label: "Lesson Builder", icon: "builder" },
      { href: "/schemes", label: "Schemes of Work", icon: "schemes" },
    ],
  },
  {
    title: "Curriculum",
    items: [
      { href: "/curriculum", label: "Curriculum Hub", icon: "curriculum" },
      { href: "/curriculum-coverage", label: "Coverage Dashboard", icon: "coverage" },
      { href: "/curriculum-analytics", label: "Teaching Progress", icon: "analytics" },
      { href: "/curriculum-intelligence", label: "Planning Insights", icon: "intelligence" },
    ],
  },
  {
    title: "Tools",
    items: [
      { href: "/resources", label: "Teaching Resources", icon: "resources" },
      { href: "/curriculum-assistant", label: "Planning Assistant", icon: "assistant" },
    ],
  },
  {
    title: "Settings",
    items: [{ href: "/settings", label: "Settings", icon: "settings" }],
  },
] as const;

/** Technical curriculum tools — linked from Settings, routes preserved. */
export const ADVANCED_NAV_ITEMS = [
  { href: "/curriculum-tester", label: "Curriculum Tester", icon: "tester" },
  { href: "/curriculum-coverage", label: "Curriculum Coverage", icon: "coverage" },
  { href: "/curriculum-visibility-audit", label: "Available Curriculum Check", icon: "audit" },
] as const;

export function getPathwayLabel(id: PathwayId): string {
  return PATHWAYS.find((p) => p.id === id)?.label ?? id;
}

export function getPlanningLevelLabel(id: PlanningLevel): string {
  return PLANNING_LEVELS.find((l) => l.id === id)?.label ?? id;
}
