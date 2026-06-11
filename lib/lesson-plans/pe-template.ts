import { generateId } from "@/lib/storage";
import type {
  LessonActivity,
  LessonEndingComponent,
  LessonEndingType,
  LessonPlan,
} from "@/lib/types";

export const STUDENT_GROUP_PRESETS = [
  "Whole Class",
  "Pairs",
  "Teams of 4",
  "Groups of 3",
  "Small Groups",
  "Individual",
] as const;

export const TEACHING_CUE_SUGGESTIONS = [
  "Head up",
  "Quality first",
  "Accurate passing",
  "Eyes on the ball",
  "Communicate",
  "Move into space",
  "Low centre of gravity",
  "Ready position",
] as const;

export interface LessonEndingPreset {
  type: LessonEndingType;
  title: string;
  examples: string[];
}

export const LESSON_ENDING_PRESETS: LessonEndingPreset[] = [
  {
    type: "cool-down",
    title: "Cool Down",
    examples: ["Stretching", "Mobility", "Recovery work", "Breathing"],
  },
  {
    type: "reflection",
    title: "Reflection",
    examples: ["Learning diary", "Written reflection", "Peer reflection"],
  },
  {
    type: "quick-questioning",
    title: "Quick Questioning",
    examples: ["Think Pair Share", "Exit questions", "Mini whiteboards", "Show me with fingers"],
  },
  {
    type: "assessment",
    title: "Assessment Opportunity",
    examples: ["Observation", "Peer assessment", "Self assessment", "Questioning"],
  },
  {
    type: "closing-link",
    title: "Closing Link",
    examples: ["Link to next lesson", "Link to wellbeing", "Link to sport performance"],
  },
  {
    type: "custom",
    title: "Custom Component",
    examples: [],
  },
];

export function createEmptyActivity(number: number): LessonActivity {
  return {
    id: generateId(),
    number,
    name: "",
    students: "",
    time: "",
    spaceEquipment: "",
    taskDescription: "",
    progressions: [],
    differentiationEasier: "",
    differentiationHarder: "",
    teachingCues: [],
  };
}

export function createEndingFromPreset(
  preset: LessonEndingPreset,
  order: number,
  customTitle?: string
): LessonEndingComponent {
  const exampleHint =
    preset.examples.length > 0 ? `\n\nExamples: ${preset.examples.join(", ")}` : "";

  return {
    id: generateId(),
    type: preset.type,
    title: customTitle ?? preset.title,
    content: exampleHint.trim(),
    order,
  };
}

/** Sync legacy text fields from structured PE activities for export compatibility. */
export function syncLessonLegacyFields(
  lesson: Pick<
    LessonPlan,
    | "structuredActivities"
    | "activities"
    | "equipment"
    | "differentiation"
    | "lessonEndings"
    | "assessmentNotes"
    | "reflectionNotes"
  >
): Pick<LessonPlan, "activities" | "equipment" | "differentiation" | "assessmentNotes" | "reflectionNotes"> {
  const activities = lesson.structuredActivities ?? [];

  if (activities.length === 0) {
    return {
      activities: lesson.activities ?? "",
      equipment: lesson.equipment ?? "",
      differentiation: lesson.differentiation ?? "",
      assessmentNotes: lesson.assessmentNotes ?? "",
      reflectionNotes: lesson.reflectionNotes ?? "",
    };
  }

  const activitiesText = activities
    .map((a) => {
      const lines = [
        `Activity ${a.number}${a.name ? ` – ${a.name}` : ""}`,
        a.students ? `Students: ${a.students}` : "",
        a.time ? `Time: ${a.time}` : "",
        a.spaceEquipment ? `Space & Equipment: ${a.spaceEquipment}` : "",
        a.taskDescription ? `Task: ${a.taskDescription}` : "",
        a.progressions.length
          ? `Progressions:\n${a.progressions.map((p) => `• ${p}`).join("\n")}`
          : "",
        a.differentiationEasier || a.differentiationHarder
          ? `Differentiation:\n${a.differentiationEasier ? `• Easier: ${a.differentiationEasier}\n` : ""}${a.differentiationHarder ? `• Harder: ${a.differentiationHarder}` : ""}`
          : "",
        a.teachingCues.length
          ? `Teaching Cues:\n${a.teachingCues.map((c) => `• ${c}`).join("\n")}`
          : "",
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n\n");

  const equipment = activities
    .map((a) => a.spaceEquipment)
    .filter(Boolean)
    .join("; ");

  const differentiation = activities
    .filter((a) => a.differentiationEasier || a.differentiationHarder)
    .map(
      (a) =>
        `${a.name || `Activity ${a.number}`}: ${[a.differentiationEasier, a.differentiationHarder].filter(Boolean).join(" / ")}`
    )
    .join("\n");

  const endings = lesson.lessonEndings ?? [];
  const assessmentNotes =
    endings
      .filter((e) => e.type === "assessment")
      .map((e) => `${e.title}: ${e.content}`)
      .join("\n") || lesson.assessmentNotes;

  const reflectionNotes =
    endings
      .filter((e) => e.type === "reflection" || e.type === "cool-down")
      .map((e) => `${e.title}: ${e.content}`)
      .join("\n") || lesson.reflectionNotes;

  return {
    activities: activitiesText,
    equipment,
    differentiation,
    assessmentNotes,
    reflectionNotes,
  };
}

export function renumberActivities(activities: LessonActivity[]): LessonActivity[] {
  return activities.map((activity, index) => ({
    ...activity,
    number: index + 1,
  }));
}
