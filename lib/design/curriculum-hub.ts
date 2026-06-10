import type { TopicColor } from "./topic-theme";

export interface HubTopicCard {
  id: string;
  name: string;
  color: TopicColor;
  /** Match imported outcome topic field (case-insensitive contains). */
  topicMatch?: string[];
  /** Match imported pathwayId. */
  pathwayId?: string;
  yearRange?: string;
}

export const HUB_TOPIC_CARDS: HubTopicCard[] = [
  { id: "football", name: "Football", color: "green", topicMatch: ["Football"], yearRange: "Year 7–11" },
  { id: "handball", name: "Handball", color: "teal", topicMatch: ["Handball"], yearRange: "Year 7–11" },
  { id: "basketball", name: "Basketball", color: "teal", topicMatch: ["Basketball"], yearRange: "Year 7–11" },
  { id: "volleyball", name: "Volleyball", color: "blue", topicMatch: ["Volleyball"], yearRange: "Year 7–11" },
  { id: "athletics", name: "Athletics", color: "amber", topicMatch: ["Athletics"], yearRange: "Year 1–11" },
  { id: "gymnastics", name: "Gymnastics", color: "rose", topicMatch: ["Gymnastics"], yearRange: "Year 1–11" },
  {
    id: "educational-dance",
    name: "Educational Dance",
    color: "rose",
    topicMatch: ["Educational Dance", "Dance"],
    yearRange: "Year 1–11",
  },
  { id: "fitness", name: "Fitness", color: "amber", topicMatch: ["Fitness"], yearRange: "Year 7–11" },
  {
    id: "outdoor-recreation",
    name: "Outdoor Recreation",
    color: "green",
    topicMatch: ["Outdoor Recreation", "Outdoor"],
    yearRange: "Year 7–11",
  },
  {
    id: "healthy-lifestyle",
    name: "Healthy Lifestyle",
    color: "purple",
    topicMatch: ["Healthy Lifestyle", "Health"],
    yearRange: "All years",
  },
  {
    id: "sport-values",
    name: "Sport Values",
    color: "purple",
    topicMatch: ["Sport Values", "Teamwork", "Leadership"],
    yearRange: "Year 7–11",
  },
  {
    id: "pe-option-sec",
    name: "PE Option SEC",
    color: "slate",
    pathwayId: "pe-option-sec",
    yearRange: "Form 3–5",
  },
  {
    id: "alp-pe",
    name: "ALP PE",
    color: "slate",
    pathwayId: "alp-pe",
    yearRange: "Form 4–5",
  },
  {
    id: "alp-sports",
    name: "ALP Sports Vocational",
    color: "slate",
    pathwayId: "alp-sports-vocational",
    yearRange: "Form 4–5",
  },
];

export function outcomeMatchesHubTopic(
  outcome: { topic?: string; topicId?: string; pathwayId: string },
  card: HubTopicCard
): boolean {
  if (card.pathwayId) return outcome.pathwayId === card.pathwayId;
  if (!card.topicMatch) return false;
  const topic = (outcome.topic ?? outcome.topicId ?? "").toLowerCase();
  return card.topicMatch.some((match) => topic.includes(match.toLowerCase()));
}
