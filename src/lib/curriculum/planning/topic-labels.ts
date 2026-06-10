import { getTopicById } from "../registry";

/** Friendly labels for broad curriculum topic ids — not retagged to specific sports. */
export const GENERIC_TOPIC_LABELS: Record<string, string> = {
  games: "Games",
  "invasion-games": "Invasion Games",
  "net-games": "Net Games",
  "striking-fielding": "Striking & Fielding Games",
  "striking-and-fielding-games": "Striking & Fielding Games",
  movement: "Movement",
  "holistic-development": "Holistic Development",
  teamwork: "Teamwork",
  leadership: "Leadership",
  "sport-values": "Sport Values",
  "healthy-lifestyle": "Healthy Lifestyle",
  "outdoor-recreation": "Outdoor Recreation",
  "educational-dance": "Educational Dance",
  "alp-physical-education": "ALP Physical Education",
  "alp-sports-vocational": "ALP Sports Vocational",
  "pe-option-sec": "PE Option",
  fundamentals: "Fundamentals",
  general: "General PE",
};

export const GENERIC_TOPIC_IDS = new Set(Object.keys(GENERIC_TOPIC_LABELS));

function humanizeSlug(id: string): string {
  return id
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getPlanningTopicDisplayName(topicId: string): string {
  const key = topicId.trim().toLowerCase();
  if (GENERIC_TOPIC_LABELS[key]) return GENERIC_TOPIC_LABELS[key];
  return getTopicById(topicId)?.name ?? humanizeSlug(topicId);
}
