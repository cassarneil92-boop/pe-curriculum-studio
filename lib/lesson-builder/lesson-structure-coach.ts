import type { LessonActivity, LessonEndingComponent, LessonPlan } from "@/lib/types";

export type ActivityPhase =
  | "warm-up"
  | "skill"
  | "conditioned"
  | "game"
  | "reflection"
  | "other";

export interface StructureTimelineItem {
  name: string;
  minutes: number | null;
  phase: ActivityPhase;
}

export interface StructureFeedback {
  id: string;
  severity: "warning" | "info";
  message: string;
}

export interface StructureRecommendation {
  id: string;
  message: string;
}

export interface LessonStructureReport {
  timeline: StructureTimelineItem[];
  totalPlannedMinutes: number | null;
  lessonDuration: number;
  feedback: StructureFeedback[];
  recommendations: StructureRecommendation[];
}

function parseMinutes(value: string): number | null {
  if (!value.trim()) return null;
  const match = value.match(/(\d+)\s*(?:min|mins|minute|minutes|m\b)/i);
  if (match) return parseInt(match[1], 10);
  const bare = value.match(/^(\d+)$/);
  return bare ? parseInt(bare[1], 10) : null;
}

function classifyPhase(name: string): ActivityPhase {
  const lower = name.toLowerCase();
  if (/warm|pulse|activate|mobility/.test(lower)) return "warm-up";
  if (/reflect|plenary|review|cool.?down|debrief/.test(lower)) return "reflection";
  if (/condition|modified|constraint/.test(lower)) return "conditioned";
  if (/game|match|ssg|small.?sided|competition/.test(lower)) return "game";
  if (/skill|practice|drill|technique|development/.test(lower)) return "skill";
  return "other";
}

function hasProgression(activity: LessonActivity): boolean {
  return activity.progressions.some((p) => p.trim());
}

function hasReflectionEnding(endings: LessonEndingComponent[]): boolean {
  return endings.some(
    (e) =>
      e.type === "reflection" ||
      e.type === "quick-questioning" ||
      /reflect|plenary|exit|review/i.test(e.title)
  );
}

export function buildLessonStructureReport(
  lesson: Pick<
    LessonPlan,
    "structuredActivities" | "lessonEndings" | "duration"
  >
): LessonStructureReport {
  const activities = lesson.structuredActivities ?? [];
  const endings = lesson.lessonEndings ?? [];
  const lessonDuration = lesson.duration || 60;

  const timeline: StructureTimelineItem[] = activities.map((activity) => ({
    name: activity.name.trim() || `Activity ${activity.number}`,
    minutes: parseMinutes(activity.time),
    phase: classifyPhase(activity.name || activity.taskDescription),
  }));

  const timed = timeline.filter((item) => item.minutes !== null);
  const totalPlannedMinutes =
    timed.length > 0 ? timed.reduce((sum, item) => sum + (item.minutes ?? 0), 0) : null;

  const feedback: StructureFeedback[] = [];
  const recommendations: StructureRecommendation[] = [];

  const warmUpItems = timeline.filter((t) => t.phase === "warm-up");
  const warmUpMinutes = warmUpItems.reduce((sum, t) => sum + (t.minutes ?? 0), 0);
  if (warmUpItems.length > 0 && warmUpMinutes > lessonDuration * 0.2) {
    feedback.push({
      id: "warmup-long",
      severity: "warning",
      message: "Warm up may be too long for this lesson duration",
    });
    recommendations.push({
      id: "warmup-reduce",
      message: "Reduce warm up to 6–8 minutes and move sooner into skill practice",
    });
  }

  if (activities.length > 0 && !activities.some(hasProgression)) {
    feedback.push({
      id: "no-progression",
      severity: "warning",
      message: "No progression detected across activity blocks",
    });
    recommendations.push({
      id: "add-progression",
      message: "Add a progression step from unopposed practice to game application",
    });
  }

  const hasReflectionActivity = timeline.some((t) => t.phase === "reflection");
  if (!hasReflectionActivity && !hasReflectionEnding(endings)) {
    feedback.push({
      id: "no-reflection",
      severity: "warning",
      message: "No reflection opportunity detected",
    });
    recommendations.push({
      id: "add-plenary",
      message: "Add a plenary question or short reflection at the end of the lesson",
    });
  }

  const gameMinutes = timeline
    .filter((t) => t.phase === "game")
    .reduce((sum, t) => sum + (t.minutes ?? 0), 0);
  if (gameMinutes > lessonDuration * 0.55) {
    feedback.push({
      id: "game-heavy",
      severity: "warning",
      message: "Game time may dominate the lesson structure",
    });
    recommendations.push({
      id: "add-conditioned",
      message: "Add a conditioned game or skill practice block before extended play",
    });
  }

  if (activities.length > 0 && !warmUpItems.length) {
    feedback.push({
      id: "no-warmup",
      severity: "info",
      message: "No dedicated warm up block identified",
    });
    recommendations.push({
      id: "add-warmup",
      message: "Open with a short warm up to prepare students for the main focus",
    });
  }

  if (
    totalPlannedMinutes !== null &&
    totalPlannedMinutes > lessonDuration + 5
  ) {
    feedback.push({
      id: "over-planned",
      severity: "info",
      message: "Planned activity time exceeds the lesson duration",
    });
  }

  return {
    timeline,
    totalPlannedMinutes,
    lessonDuration,
    feedback,
    recommendations,
  };
}
