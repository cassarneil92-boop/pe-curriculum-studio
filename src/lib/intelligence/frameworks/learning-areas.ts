/**
 * Official Maltese PE learning area taxonomy (MELA / LA structure).
 * Used for analytics grouping — does not modify curriculum source data.
 */

export type LearningAreaId =
  | "fundamentals"
  | "fitness"
  | "individual-activity"
  | "team-games"
  | "outdoor-recreation"
  | "holistic-development"
  | "healthy-lifestyle"
  | "sport-values"
  | "pe-option";

export interface LearningAreaDefinition {
  id: LearningAreaId;
  label: string;
  phase: "primary" | "secondary" | "both";
  topicIds: string[];
  codePrefixes?: string[];
}

/** Topic id → learning area mapping for analytics. */
export const LEARNING_AREAS: LearningAreaDefinition[] = [
  {
    id: "fundamentals",
    label: "Fundamentals",
    phase: "primary",
    topicIds: ["fundamentals", "movement", "games"],
    codePrefixes: ["F"],
  },
  {
    id: "fitness",
    label: "Fitness",
    phase: "secondary",
    topicIds: ["fitness"],
    codePrefixes: ["F7", "F8", "F9", "F10", "F11"],
  },
  {
    id: "individual-activity",
    label: "Individual Activities",
    phase: "both",
    topicIds: [
      "athletics",
      "gymnastics",
      "educational-dance",
      "dance",
      "martial-arts",
      "swimming",
      "swimming-aquatics",
    ],
    codePrefixes: ["AT", "A", "GY", "ED", "DC", "MA", "S", "SW"],
  },
  {
    id: "team-games",
    label: "Team Games",
    phase: "both",
    topicIds: [
      "invasion-games",
      "net-games",
      "football",
      "basketball",
      "handball",
      "hockey",
      "volleyball",
      "badminton",
      "pickleball",
      "touch-rugby",
      "tchoukball",
    ],
    codePrefixes: ["IG", "NG", "GS", "G"],
  },
  {
    id: "outdoor-recreation",
    label: "Outdoor & Recreation",
    phase: "both",
    topicIds: [
      "outdoor-recreation",
      "orienteering",
      "trekking",
      "team-building",
      "ultimate-frisbee",
      "mini-tennis",
      "archery",
    ],
    codePrefixes: ["OR"],
  },
  {
    id: "holistic-development",
    label: "Holistic Development",
    phase: "secondary",
    topicIds: ["holistic-development", "teamwork", "leadership"],
    codePrefixes: ["HD"],
  },
  {
    id: "healthy-lifestyle",
    label: "Healthy Lifestyle",
    phase: "both",
    topicIds: ["healthy-lifestyle"],
  },
  {
    id: "sport-values",
    label: "Sport Values",
    phase: "both",
    topicIds: ["sport-values"],
  },
  {
    id: "pe-option",
    label: "PE Option / Theory",
    phase: "secondary",
    topicIds: ["pe-option-theory", "pe-option-sec"],
  },
];

const TOPIC_TO_AREA = new Map<string, LearningAreaId>();

for (const area of LEARNING_AREAS) {
  for (const topicId of area.topicIds) {
    TOPIC_TO_AREA.set(topicId.toLowerCase(), area.id);
  }
}

export function getLearningAreaForTopic(topicId: string): LearningAreaId | null {
  return TOPIC_TO_AREA.get(topicId.trim().toLowerCase()) ?? null;
}

export function getLearningAreaLabel(areaId: LearningAreaId): string {
  return LEARNING_AREAS.find((a) => a.id === areaId)?.label ?? areaId;
}

export function getLearningAreaForCode(code: string): LearningAreaId | null {
  const upper = code.trim().toUpperCase();
  for (const area of LEARNING_AREAS) {
    if (area.codePrefixes?.some((prefix) => upper.startsWith(prefix))) {
      return area.id;
    }
  }
  return null;
}
