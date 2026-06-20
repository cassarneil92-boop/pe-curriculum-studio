export type LessonTemplateType =
  | "introduction"
  | "skill-development"
  | "application"
  | "tactical"
  | "pressure"
  | "assessment";

export interface LessonStructureTemplate {
  type: LessonTemplateType;
  focus: string;
  warmUp: string;
  mainActivity: string;
  coolDown: string;
  primaryActivityLabel: string;
}

export function pickLessonTypesForCount(lessonCount: number): LessonTemplateType[] {
  if (lessonCount <= 1) return ["introduction"];
  if (lessonCount === 2) return ["introduction", "assessment"];
  if (lessonCount === 3) return ["introduction", "application", "assessment"];
  if (lessonCount === 4) {
    return ["introduction", "skill-development", "application", "assessment"];
  }
  if (lessonCount === 5) {
    return ["introduction", "skill-development", "application", "pressure", "assessment"];
  }

  const base: LessonTemplateType[] = [
    "introduction",
    "skill-development",
    "tactical",
    "application",
    "pressure",
    "assessment",
  ];
  if (lessonCount <= base.length) {
    return base.slice(0, lessonCount);
  }
  return [
    ...base,
    ...Array.from({ length: lessonCount - base.length }, () => "skill-development" as const),
  ];
}

function templateForType(
  type: LessonTemplateType,
  topicLabel: string,
  skillLabel: string,
  sportPhase?: string
): LessonStructureTemplate {
  const topic = topicLabel || "this unit";
  const skill = skillLabel || "the focus skill";
  const phase = sportPhase?.trim();

  switch (type) {
    case "introduction":
      return {
        type,
        focus: phase ?? `Introduction to ${skill} in ${topic}`,
        warmUp: `Pulse raiser and dynamic stretches linked to ${topic}.`,
        mainActivity: `Skill introduction: demonstrate and explore ${skill} with unopposed practice.`,
        coolDown: "Reflection: what is the key coaching point for today?",
        primaryActivityLabel: "Skill introduction",
      };
    case "skill-development":
      return {
        type,
        focus: phase ?? `Developing ${skill} technique`,
        warmUp: `Activate movement patterns for ${skill} in ${topic}.`,
        mainActivity: `Technical practice: repetition of ${skill} with quality coaching points.`,
        coolDown: "Pair share — one strength and one target from today's practice.",
        primaryActivityLabel: "Technical practice",
      };
    case "application":
      return {
        type,
        focus: phase ?? `Applying ${skill} in modified ${topic} contexts`,
        warmUp: `Game-related warm up revisiting ${skill}.`,
        mainActivity: `Modified game: apply ${skill} in a conditioned ${topic} activity.`,
        coolDown: "Review how the skill was used during the modified game.",
        primaryActivityLabel: "Modified game",
      };
    case "tactical":
      return {
        type,
        focus: phase ?? `Tactical use of ${skill} in ${topic}`,
        warmUp: `Scenario activation for ${topic} decision making.`,
        mainActivity: `Scenario based activity: when and how to use ${skill} in play.`,
        coolDown: "Game challenge debrief — best tactical decision today.",
        primaryActivityLabel: "Scenario based activity",
      };
    case "pressure":
      return {
        type,
        focus: phase ?? `${skill} under pressure in ${topic}`,
        warmUp: `Competitive warm up with light pressure on ${skill}.`,
        mainActivity: `Competitive activity: perform ${skill} under time or defensive pressure.`,
        coolDown: "Review — how did pressure change performance?",
        primaryActivityLabel: "Competitive activity",
      };
    case "assessment":
      return {
        type,
        focus: phase ?? `Assessment and consolidation of ${skill}`,
        warmUp: `Review warm up linked to ${topic} success criteria.`,
        mainActivity: `Assessment task: observe ${skill} in practice and game application.`,
        coolDown: "Plenary: students self-assess against WILF criteria.",
        primaryActivityLabel: "Assessment task",
      };
  }
}

export function buildLessonStructure(
  type: LessonTemplateType,
  topicLabel: string,
  skillLabel: string,
  sportPhase?: string
): LessonStructureTemplate {
  return templateForType(type, topicLabel, skillLabel, sportPhase);
}

export function formatStructuredLessonActivities(template: LessonStructureTemplate): string {
  return [
    "Warm up:",
    template.warmUp,
    "",
    "Main activity:",
    template.mainActivity,
    "",
    "Cool down:",
    template.coolDown,
  ].join("\n");
}

export function isValidLessonActivities(activities: string): boolean {
  const lower = activities.toLowerCase();
  if (!lower.includes("warm up")) return false;
  if (!lower.includes("main activity")) return false;
  if (!lower.includes("cool down")) return false;

  const mainMatch = activities.match(/main activity:\s*([\s\S]*?)(?:\n\n|\ncool down:|$)/i);
  const mainBody = mainMatch?.[1]?.trim().toLowerCase() ?? "";
  if (!mainBody || mainBody === "cool down" || mainBody.startsWith("cool down")) {
    return false;
  }
  return true;
}

export function buildLessonTemplatesForScheme(
  lessonCount: number,
  topicLabel: string,
  skillLabel: string,
  sportPhases: string[]
): LessonStructureTemplate[] {
  const types = pickLessonTypesForCount(lessonCount);
  return types.map((type, index) =>
    buildLessonStructure(type, topicLabel, skillLabel, sportPhases[index])
  );
}
