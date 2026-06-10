import type { TopicColor } from "@/lib/design/topic-theme";

/** Visual metadata only — does not control topic card visibility. */
export interface TopicVisualMeta {
  id: string;
  color: TopicColor;
  emoji: string;
  category: string;
}

const TOPIC_META_ENTRIES: { patterns: string[]; meta: Omit<TopicVisualMeta, "id"> }[] = [
  { patterns: ["football"], meta: { color: "green", emoji: "⚽", category: "Games" } },
  { patterns: ["handball"], meta: { color: "teal", emoji: "🤾", category: "Games" } },
  { patterns: ["basketball"], meta: { color: "teal", emoji: "🏀", category: "Games" } },
  { patterns: ["volleyball"], meta: { color: "blue", emoji: "🏐", category: "Games" } },
  { patterns: ["netball"], meta: { color: "blue", emoji: "🥅", category: "Games" } },
  { patterns: ["rugby"], meta: { color: "green", emoji: "🏉", category: "Games" } },
  { patterns: ["hockey"], meta: { color: "green", emoji: "🏑", category: "Games" } },
  { patterns: ["invasion"], meta: { color: "teal", emoji: "🎯", category: "Games" } },
  { patterns: ["net games"], meta: { color: "blue", emoji: "🎾", category: "Games" } },
  { patterns: ["striking", "fielding"], meta: { color: "green", emoji: "🏏", category: "Games" } },
  { patterns: ["athletic"], meta: { color: "amber", emoji: "🏃", category: "Athletics" } },
  { patterns: ["gymnastic"], meta: { color: "rose", emoji: "🤸", category: "Gymnastics" } },
  { patterns: ["dance"], meta: { color: "rose", emoji: "💃", category: "Dance" } },
  { patterns: ["fitness"], meta: { color: "amber", emoji: "💪", category: "Fitness" } },
  { patterns: ["outdoor"], meta: { color: "green", emoji: "🌲", category: "Outdoor" } },
  { patterns: ["healthy", "lifestyle", "health"], meta: { color: "purple", emoji: "❤️", category: "Health" } },
  { patterns: ["sport values", "teamwork", "leadership", "fair play"], meta: { color: "purple", emoji: "🤝", category: "Values" } },
  { patterns: ["pe option", "officiating", "training principles"], meta: { color: "slate", emoji: "📋", category: "PE Option" } },
  { patterns: ["alp physical", "alp pe", "movement competence"], meta: { color: "slate", emoji: "🎓", category: "ALP PE" } },
  { patterns: ["alp sports", "vocational", "coaching basics"], meta: { color: "slate", emoji: "🏆", category: "ALP Sports" } },
  { patterns: ["swim", "aquatic"], meta: { color: "blue", emoji: "🏊", category: "Aquatics" } },
  { patterns: ["fundamental", "locomotor", "early years"], meta: { color: "green", emoji: "🧒", category: "Primary" } },
];

function normaliseTopic(value: string): string {
  return value.trim().toLowerCase();
}

export function topicKeyFromLabel(label: string): string {
  return normaliseTopic(label).replace(/[^a-z0-9]+/g, "-");
}

export function getTopicVisualMeta(topicLabel: string): TopicVisualMeta {
  const key = normaliseTopic(topicLabel);

  for (const entry of TOPIC_META_ENTRIES) {
    if (entry.patterns.some((pattern) => key.includes(pattern))) {
      return {
        id: topicKeyFromLabel(topicLabel),
        ...entry.meta,
      };
    }
  }

  return {
    id: topicKeyFromLabel(topicLabel),
    color: "teal",
    emoji: "📚",
    category: "Curriculum",
  };
}
