import type { LessonTemplateType } from "@/lib/assistant/lesson-structure-templates";
import { getPlanningSkillDisplayName } from "@/src/lib/curriculum/planning";

interface ResourceContext {
  topicId: string;
  skillId: string;
  lessonType: LessonTemplateType;
  lessonIndex: number;
}

const BASE_EQUIPMENT = ["Whistle", "Cones"];

const TOPIC_RESOURCES: Record<string, string[]> = {
  football: ["Footballs", "Cones", "Bibs", "Goals or markers"],
  basketball: ["Basketballs", "Cones", "Bibs"],
  handball: ["Handballs", "Cones", "Bibs", "Goals"],
  volleyball: ["Volleyballs", "Cones", "Nets or tape"],
  hockey: ["Hockey sticks", "Balls", "Cones", "Goals"],
  athletics: ["Stopwatch", "Measuring tape", "Markers", "Cones"],
  gymnastics: ["Mats", "Benches", "Apparatus", "Cones"],
  dance: ["Speaker", "Music device", "Cones"],
  fitness: ["Timers", "Cones", "Bibs"],
  netball: ["Netballs", "Bibs", "Cones"],
};

const SKILL_RESOURCE_HINTS: Record<string, string[]> = {
  shooting: ["Goals", "Target markers"],
  passing: ["Balls", "Cones"],
  serving: ["Nets or tape", "Balls"],
  running: ["Stopwatch", "Markers"],
  jumping: ["Measuring tape", "Mats"],
};

function normalizeTopicKey(topicId: string): string {
  const key = topicId.toLowerCase();
  for (const topic of Object.keys(TOPIC_RESOURCES)) {
    if (key.includes(topic)) return topic;
  }
  return "generic";
}

function resourcesForLessonType(lessonType: LessonTemplateType): string[] {
  switch (lessonType) {
    case "assessment":
      return ["Clipboard", "Timer"];
    case "pressure":
      return ["Bibs", "Timer"];
    case "tactical":
      return ["Bibs", "Cones"];
    default:
      return [];
  }
}

export function pickResourcesForLesson(context: ResourceContext): string[] {
  const topicKey = normalizeTopicKey(context.topicId);
  const topicBase =
    topicKey === "generic"
      ? ["Balls", "Cones", "Bibs"]
      : TOPIC_RESOURCES[topicKey] ?? ["Balls", "Cones", "Bibs"];

  const skillName = context.skillId
    ? getPlanningSkillDisplayName(context.skillId).toLowerCase()
    : "";
  const skillExtras: string[] = [];
  for (const [skill, items] of Object.entries(SKILL_RESOURCE_HINTS)) {
    if (skillName.includes(skill)) {
      skillExtras.push(...items);
    }
  }

  const typeExtras = resourcesForLessonType(context.lessonType);

  const merged = [...topicBase, ...skillExtras, ...typeExtras, ...BASE_EQUIPMENT];
  const unique: string[] = [];
  for (const item of merged) {
    if (!unique.includes(item)) unique.push(item);
  }
  return unique.slice(0, 5);
}

export function pickResourcesForTopic(topicId: string): string[] {
  return pickResourcesForLesson({
    topicId,
    skillId: "",
    lessonType: "skill-development",
    lessonIndex: 0,
  });
}
