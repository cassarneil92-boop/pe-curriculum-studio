import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";
import { generateId } from "@/lib/storage";
import { buildFitnessActivityBlocks } from "@/src/lib/peKnowledge/fitnessCurriculumEngines";
import type { SuggestionBadge } from "@/lib/lesson-builder/planning-coach-labels";
import type { LessonActivity } from "@/lib/types";

export type ActivityBlockType =
  | "warm-up"
  | "skill-practice"
  | "conditioned-practice"
  | "small-sided-game"
  | "reflection";

export interface ActivitySuggestion {
  id: string;
  blockType: ActivityBlockType;
  name: string;
  purpose: string;
  durationMinutes: number;
  equipment: string;
  progression: string;
  differentiationEasier: string;
  differentiationHarder: string;
  studentsGroup: string;
  badge: SuggestionBadge;
}

const TOPIC_EQUIPMENT: Record<string, string[]> = {
  football: ["Footballs", "Cones", "Bibs", "Goals or markers"],
  basketball: ["Basketballs", "Cones", "Bibs"],
  handball: ["Handballs", "Cones", "Bibs", "Goals"],
  volleyball: ["Volleyballs", "Cones", "Nets or tape"],
  hockey: ["Hockey sticks", "Balls", "Cones", "Goals"],
  athletics: ["Cones", "Stopwatch", "Measuring tape"],
  gymnastics: ["Mats", "Benches", "Cones"],
  fitness: ["Cones", "Timers", "Bibs"],
};

function defaultEquipment(topicId: string): string {
  const key = topicId.toLowerCase();
  for (const [topic, items] of Object.entries(TOPIC_EQUIPMENT)) {
    if (key.includes(topic)) return items.join(", ");
  }
  return "Cones, Bibs, Balls (as appropriate)";
}

function skillPhrase(skillName: string, topicName: string): string {
  if (skillName) return `${skillName.toLowerCase()} in ${topicName.toLowerCase()}`;
  return topicName.toLowerCase() || "the lesson focus";
}

function isPrimarySetting(roleLabel: string): boolean {
  return /primary|early/i.test(roleLabel);
}

export function buildActivitySuggestions(input: {
  topicId: string;
  topicName: string;
  skillId: string;
  skillName: string;
  yearGroupLabel: string;
  roleLabel: string;
  selectedOutcomeIds: string[];
  lessonDuration: number;
}): ActivitySuggestion[] {
  const focus = skillPhrase(input.skillName, input.topicName);
  const equipment = defaultEquipment(input.topicId);
  const primary = isPrimarySetting(input.roleLabel);
  const duration = Math.max(input.lessonDuration || 60, 30);
  const isFitnessTopic = input.topicId.toLowerCase() === "fitness";

  if (isFitnessTopic) {
    const fitnessBlocks = buildFitnessActivityBlocks(input.skillName, duration);
    return fitnessBlocks.map((block, index) => ({
      id: `fitness-activity-${index}`,
      blockType: index === 0 ? "warm-up" : index === fitnessBlocks.length - 1 ? "reflection" : "skill-practice",
      name: block.name,
      purpose: block.purpose,
      durationMinutes: block.durationMinutes,
      equipment: defaultEquipment("fitness"),
      progression: block.progression,
      differentiationEasier: "Reduce intensity or work intervals — personal effort scale",
      differentiationHarder: "Increase work time or resistance while maintaining form",
      studentsGroup: index === 1 ? "Pairs or small groups" : "Whole class",
      badge: (index === fitnessBlocks.length - 1 ? "ASSESSMENT" : "SKILL") as SuggestionBadge,
    }));
  }

  const warmUp = primary ? 6 : Math.round(duration * 0.12);
  const skillPractice = primary ? 12 : Math.round(duration * 0.22);
  const conditioned = primary ? 10 : Math.round(duration * 0.18);
  const game = primary ? 12 : Math.round(duration * 0.35);
  const reflection = primary ? 5 : Math.max(5, Math.round(duration * 0.08));

  const outcomeHint = input.selectedOutcomeIds
    .map((id) => resolveLearningOutcomeById(id)?.code)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");

  const curriculumNote = outcomeHint
    ? `Linked to curriculum outcomes: ${outcomeHint}`
    : "Aligned to your curriculum focus";

  const blocks: Omit<ActivitySuggestion, "id">[] = [
    {
      blockType: "warm-up",
      name: "Warm Up",
      purpose: `Activate students and introduce movement patterns for ${focus}.`,
      durationMinutes: warmUp,
      equipment: "Cones, Bibs",
      progression: "Pulse raiser → dynamic stretches → skill-related movement",
      differentiationEasier: "Reduce intensity; offer walking options",
      differentiationHarder: "Add directional changes and light pressure",
      studentsGroup: "Whole class",
      badge: "SKILL",
    },
    {
      blockType: "skill-practice",
      name: "Skill Practice",
      purpose: `Develop ${focus} with repetition and quality technique.`,
      durationMinutes: skillPractice,
      equipment,
      progression: `Unopposed practice → paired practice → apply ${input.skillName || "skill"} under light pressure`,
      differentiationEasier: "Larger targets, slower pace, fewer decisions",
      differentiationHarder: "Smaller targets, time pressure, limited touches",
      studentsGroup: primary ? "Pairs" : "Groups of 3",
      badge: "CURRICULUM",
    },
    {
      blockType: "conditioned-practice",
      name: "Conditioned Practice",
      purpose: `Apply ${focus} in a modified game with success conditions.`,
      durationMinutes: conditioned,
      equipment,
      progression: "Conditioned rules → remove conditions gradually → open play",
      differentiationEasier: "Extra space, fewer defenders, bonus points for technique",
      differentiationHarder: "Tighter space, touch limits, bonus for tactical choices",
      studentsGroup: "Teams of 4",
      badge: "SKILL",
    },
    {
      blockType: "small-sided-game",
      name: "Small Sided Game",
      purpose: `Use ${focus} in competitive, game-realistic situations.`,
      durationMinutes: game,
      equipment,
      progression: "Review rules → play → reset and coach key moments",
      differentiationEasier: "Smaller pitch, floating neutral player",
      differentiationHarder: "Overload defence or limit dominant players' touches",
      studentsGroup: "Small groups",
      badge: "SKILL",
    },
    {
      blockType: "reflection",
      name: "Reflection",
      purpose: `Review learning against success criteria for ${focus}. ${curriculumNote}.`,
      durationMinutes: reflection,
      equipment: "None",
      progression: "Pair share → whole-class plenary → link to next lesson",
      differentiationEasier: "Sentence starters provided",
      differentiationHarder: "Students lead peer feedback using success criteria",
      studentsGroup: "Whole class",
      badge: "ASSESSMENT",
    },
  ];

  return blocks.map((block) => ({
    ...block,
    id: `activity-${block.blockType}`,
  }));
}

export function activitySuggestionToLessonActivity(
  suggestion: ActivitySuggestion,
  number: number
): LessonActivity {
  return {
    id: generateId(),
    number,
    name: suggestion.name,
    students: suggestion.studentsGroup,
    time: `${suggestion.durationMinutes} mins`,
    spaceEquipment: suggestion.equipment,
    taskDescription: suggestion.purpose,
    progressions: suggestion.progression ? [suggestion.progression] : [],
    differentiationEasier: suggestion.differentiationEasier,
    differentiationHarder: suggestion.differentiationHarder,
    teachingCues: [],
  };
}

export function buildActivityContextKey(input: {
  topicId: string;
  skillId: string;
  selectedOutcomeIds: string[];
  lessonDuration: number;
  roleLabel: string;
}): string {
  return [
    input.topicId,
    input.skillId,
    input.lessonDuration,
    input.roleLabel,
    [...input.selectedOutcomeIds].sort().join("\0"),
  ].join("|");
}
