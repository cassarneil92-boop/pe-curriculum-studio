import type {
  PedagogyModel,
  SportDefinition,
  SportDimension,
  SportId,
  SportLessonPhase,
  SportSkillDefinition,
} from "./types";

export const PEDAGOGY_LABELS: Record<PedagogyModel, string> = {
  tgfu: "Teaching Games for Understanding (TGfU)",
  "whole-part-whole": "Whole-Part-Whole",
  "whole-analytical-whole": "Whole-Analytical-Whole",
  "constraints-led": "Constraints Led Approach (CLA)",
  "sport-education": "Sport Education Model",
  "cooperative-learning": "Cooperative Learning",
};

export const DIMENSION_LABELS: Record<SportDimension, string> = {
  technical: "Technical",
  tactical: "Tactical",
  physical: "Physical",
  psychological: "Psychological",
  social: "Social",
};

export const ALL_SPORT_IDS: SportId[] = [
  "football",
  "basketball",
  "volleyball",
  "handball",
  "athletics",
  "gymnastics",
  "dance",
  "racket-sports",
];

const FOOTBALL_SKILLS: SportSkillDefinition[] = [
  { id: "passing", label: "Passing", progressionOrder: 1 },
  { id: "receiving", label: "Receiving", progressionOrder: 2, prerequisiteIds: ["passing"] },
  { id: "dribbling", label: "Dribbling", progressionOrder: 3 },
  { id: "finishing", label: "Finishing", progressionOrder: 4, prerequisiteIds: ["passing", "dribbling"] },
  { id: "defending", label: "Defending", progressionOrder: 5 },
  { id: "transition", label: "Transition", progressionOrder: 6, prerequisiteIds: ["passing", "defending"] },
  { id: "pressing", label: "Pressing", progressionOrder: 7, prerequisiteIds: ["defending", "transition"] },
];

const BASKETBALL_SKILLS: SportSkillDefinition[] = [
  { id: "passing", label: "Passing", progressionOrder: 1 },
  { id: "dribbling", label: "Dribbling", progressionOrder: 2 },
  { id: "shooting", label: "Shooting", progressionOrder: 3 },
  { id: "lay-up", label: "Lay-up", progressionOrder: 4, prerequisiteIds: ["dribbling", "shooting"] },
  { id: "defence", label: "Defence", progressionOrder: 5 },
  { id: "rebounding", label: "Rebounding", progressionOrder: 6, prerequisiteIds: ["defence"] },
];

const VOLLEYBALL_SKILLS: SportSkillDefinition[] = [
  { id: "serve", label: "Serve", progressionOrder: 1 },
  { id: "dig", label: "Dig", progressionOrder: 2 },
  { id: "set", label: "Set", progressionOrder: 3, prerequisiteIds: ["dig"] },
  { id: "spike", label: "Spike", progressionOrder: 4, prerequisiteIds: ["set"] },
  { id: "block", label: "Block", progressionOrder: 5, prerequisiteIds: ["spike"] },
  { id: "rotation", label: "Rotation", progressionOrder: 6 },
];

const HANDBALL_SKILLS: SportSkillDefinition[] = [
  { id: "passing", label: "Passing", progressionOrder: 1 },
  { id: "receiving", label: "Receiving", progressionOrder: 2, prerequisiteIds: ["passing"] },
  { id: "dribbling", label: "Dribbling", progressionOrder: 3 },
  { id: "shooting", label: "Shooting", progressionOrder: 4, prerequisiteIds: ["passing", "dribbling"] },
  { id: "defending", label: "Defending", progressionOrder: 5 },
];

const ATHLETICS_SKILLS: SportSkillDefinition[] = [
  { id: "sprint", label: "Sprint", progressionOrder: 1 },
  { id: "jump", label: "Jump", progressionOrder: 2 },
  { id: "throw", label: "Throw", progressionOrder: 3 },
];

const GYMNASTICS_SKILLS: SportSkillDefinition[] = [
  { id: "balance", label: "Balance", progressionOrder: 1 },
  { id: "rotation", label: "Rotation", progressionOrder: 2 },
  { id: "travel", label: "Travel", progressionOrder: 3 },
  { id: "flight", label: "Flight", progressionOrder: 4, prerequisiteIds: ["balance", "rotation"] },
  { id: "landing", label: "Landing", progressionOrder: 5, prerequisiteIds: ["flight"] },
];

const DANCE_SKILLS: SportSkillDefinition[] = [
  { id: "locomotion", label: "Locomotion", progressionOrder: 1 },
  { id: "choreography", label: "Choreography", progressionOrder: 2 },
  { id: "expression", label: "Expression", progressionOrder: 3 },
  { id: "performance", label: "Performance", progressionOrder: 4, prerequisiteIds: ["choreography"] },
];

const RACKET_SKILLS: SportSkillDefinition[] = [
  { id: "grip", label: "Grip", progressionOrder: 1 },
  { id: "serve", label: "Serve", progressionOrder: 2, prerequisiteIds: ["grip"] },
  { id: "forehand", label: "Forehand", progressionOrder: 3 },
  { id: "backhand", label: "Backhand", progressionOrder: 4, prerequisiteIds: ["forehand"] },
  { id: "movement", label: "Court movement", progressionOrder: 5 },
];

function phases(...labels: string[]): SportLessonPhase[] {
  return labels.map((label, index) => ({
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    order: index + 1,
  }));
}

export const SPORT_DEFINITIONS: SportDefinition[] = [
  {
    id: "football",
    topicIds: ["football"],
    label: "Football",
    skills: FOOTBALL_SKILLS,
    lessonPhases: phases("Technique", "Opposed practice", "Small sided game", "Reflection"),
    recommendedPedagogy: ["tgfu", "constraints-led", "cooperative-learning"],
    resources: ["Balls", "Goals", "Bibs", "Cones"],
    dimensions: ["technical", "tactical", "physical", "psychological", "social"],
  },
  {
    id: "basketball",
    topicIds: ["basketball"],
    label: "Basketball",
    skills: BASKETBALL_SKILLS,
    lessonPhases: phases("Ball mastery", "Skill execution", "Transition game", "Reflection"),
    recommendedPedagogy: ["tgfu", "constraints-led", "sport-education"],
    resources: ["Basketballs", "Cones", "Bibs", "Hoops"],
    dimensions: ["technical", "tactical", "physical", "social"],
  },
  {
    id: "volleyball",
    topicIds: ["volleyball"],
    label: "Volleyball",
    skills: VOLLEYBALL_SKILLS,
    lessonPhases: phases("Cooperative rally", "Skill practice", "Modified game", "Reflection"),
    recommendedPedagogy: ["tgfu", "whole-part-whole", "cooperative-learning"],
    resources: ["Volleyballs", "Nets or tape", "Cones", "Bibs"],
    dimensions: ["technical", "tactical", "physical", "social"],
  },
  {
    id: "handball",
    topicIds: ["handball"],
    label: "Handball",
    skills: HANDBALL_SKILLS,
    lessonPhases: phases("Technique", "Timing", "Shooting under pressure", "Reflection"),
    recommendedPedagogy: ["tgfu", "constraints-led"],
    resources: ["Handballs", "Goals", "Cones", "Bibs"],
    dimensions: ["technical", "tactical", "physical", "social"],
  },
  {
    id: "athletics",
    topicIds: ["athletics"],
    label: "Athletics",
    skills: ATHLETICS_SKILLS,
    lessonPhases: phases("Technique", "Application", "Measurement", "Reflection"),
    recommendedPedagogy: ["whole-part-whole", "whole-analytical-whole"],
    resources: ["Stopwatches", "Measuring tape", "Markers", "Cones"],
    dimensions: ["technical", "physical", "psychological"],
  },
  {
    id: "gymnastics",
    topicIds: ["gymnastics"],
    label: "Gymnastics",
    skills: GYMNASTICS_SKILLS,
    lessonPhases: phases("Shape and balance", "Sequence building", "Performance", "Reflection"),
    recommendedPedagogy: ["whole-part-whole", "whole-analytical-whole"],
    resources: ["Mats", "Benches", "Apparatus", "Cones"],
    dimensions: ["technical", "physical", "psychological"],
  },
  {
    id: "dance",
    topicIds: ["dance", "educational-dance"],
    label: "Dance",
    skills: DANCE_SKILLS,
    lessonPhases: phases("Warm-up and motif", "Choreography", "Performance", "Reflection"),
    recommendedPedagogy: ["whole-part-whole", "cooperative-learning"],
    resources: ["Music player", "Open space", "Mirrors (if available)"],
    dimensions: ["technical", "physical", "psychological", "social"],
  },
  {
    id: "racket-sports",
    topicIds: ["badminton", "mini-tennis", "tennis", "pickleball", "table-tennis"],
    label: "Racket Sports",
    skills: RACKET_SKILLS,
    lessonPhases: phases("Grip and control", "Skill practice", "Modified rally", "Reflection"),
    recommendedPedagogy: ["whole-part-whole", "constraints-led", "tgfu"],
    resources: ["Rackets", "Shuttlecocks/balls", "Nets", "Cones"],
    dimensions: ["technical", "tactical", "physical"],
  },
];

export const SPORT_STRONG_OUTCOME_THRESHOLD = 8;
export const SPORT_THIN_OUTCOME_THRESHOLD = 2;
export const SKILL_STRONG_THRESHOLD = 3;

export function getSportDefinitionById(sportId: SportId): SportDefinition | undefined {
  return SPORT_DEFINITIONS.find((s) => s.id === sportId);
}

export function getSportDefinitionByTopicId(topicId: string): SportDefinition | undefined {
  const key = topicId.toLowerCase();
  return SPORT_DEFINITIONS.find((s) =>
    s.topicIds.some((id) => key === id || key.includes(id))
  );
}

export function resolveSportIdFromTopic(topicId: string): SportId | null {
  return getSportDefinitionByTopicId(topicId)?.id ?? null;
}

export function getSkillInSport(
  sport: SportDefinition,
  skillId: string
): SportSkillDefinition | undefined {
  const key = skillId.toLowerCase();
  return sport.skills.find(
    (s) => s.id === key || key.includes(s.id) || s.label.toLowerCase().includes(key)
  );
}

export function getNextSkillsInSport(
  sport: SportDefinition,
  skillId: string
): SportSkillDefinition[] {
  const current = getSkillInSport(sport, skillId);
  if (!current) return sport.skills.slice(0, 3);
  return sport.skills.filter((s) => s.progressionOrder > current.progressionOrder).slice(0, 3);
}

export function getPreviousSkillsInSport(
  sport: SportDefinition,
  skillId: string
): SportSkillDefinition[] {
  const current = getSkillInSport(sport, skillId);
  if (!current) return [];
  return sport.skills.filter((s) => s.progressionOrder < current.progressionOrder);
}

export function formatPedagogyRecommendations(models: PedagogyModel[]): string {
  return models.map((m) => PEDAGOGY_LABELS[m]).join(" + ");
}
