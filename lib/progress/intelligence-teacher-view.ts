import type { CalendarEntry, LessonPlan, PathwayId, SchemeOfWork } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { buildLessonBuilderLink, buildSchemesLink } from "@/lib/curriculum-hub/planning-links";
import type { CurriculumIntelligenceReport } from "@/lib/progress/curriculum-intelligence";
import {
  getLearningAreaForTopic,
  getLearningAreaLabel,
  type LearningAreaId,
} from "@/src/lib/intelligence/frameworks/learning-areas";
import { lessonHasContent } from "@/lib/scheme-builder/helpers";

export type CurriculumAreaHealth = "strong" | "needs_attention" | "missing";

export interface CurriculumAreaStatus {
  id: LearningAreaId;
  label: string;
  health: CurriculumAreaHealth;
  topicId: string;
}

export interface IntelligenceRecommendation {
  id: string;
  title: string;
  reason: string;
  lessonHref: string;
  schemeHref: string;
}

export interface CurriculumBalanceItem {
  label: string;
  barLength: number;
}

export interface CurriculumAlert {
  id: string;
  message: string;
}

export interface IntelligenceQuickAction {
  id: string;
  label: string;
  href: string;
}

export interface IntelligenceTeacherView {
  health: {
    strong: CurriculumAreaStatus[];
    needsAttention: CurriculumAreaStatus[];
    missing: CurriculumAreaStatus[];
  };
  recommendations: IntelligenceRecommendation[];
  balance: CurriculumBalanceItem[];
  alerts: CurriculumAlert[];
  quickActions: IntelligenceQuickAction[];
}

/** Teacher-facing curriculum areas — not individual sports. */
const TEACHER_FOCUS_AREAS: {
  id: LearningAreaId;
  label: string;
  topicId: string;
  preferScheme?: boolean;
}[] = [
  { id: "team-games", label: "Team Games", topicId: "invasion-games" },
  { id: "individual-activity", label: "Athletics", topicId: "athletics" },
  { id: "fitness", label: "Fitness", topicId: "fitness" },
  {
    id: "healthy-lifestyle",
    label: "Healthy Lifestyle",
    topicId: "healthy-lifestyle",
    preferScheme: true,
  },
  { id: "sport-values", label: "Sport Values", topicId: "sport-values" },
  { id: "outdoor-recreation", label: "Outdoor & Recreation", topicId: "outdoor-recreation", preferScheme: true },
];

const SPORT_TOPIC_PATTERN =
  /\b(archery|badminton|ultimate|frisbee|volleyball|football|basketball|handball|hockey|pickleball|tchoukball|rugby|tennis|netball|cricket)\b/i;

function countAreaActivity(
  areaId: LearningAreaId,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): { planned: number; delivered: number } {
  let planned = 0;
  let delivered = 0;

  for (const lesson of lessons) {
    if (getLearningAreaForTopic(lesson.topicId) !== areaId) continue;
    planned += 1;
    if (lesson.date) delivered += 0;
  }

  for (const scheme of schemes) {
    if (getLearningAreaForTopic(scheme.topicId) !== areaId) continue;
    for (const lesson of scheme.lessons ?? []) {
      if (!lessonHasContent(lesson) && lesson.deliveryStatus !== "delivered") continue;
      planned += 1;
      if (lesson.deliveryStatus === "delivered") delivered += 1;
    }
  }

  return { planned, delivered };
}

function classifyArea(planned: number, delivered: number): CurriculumAreaHealth {
  if (planned === 0 && delivered === 0) return "missing";
  if (delivered >= 2) return "strong";
  if (delivered >= 1 && planned <= delivered + 1) return "strong";
  if (planned >= 1 && delivered === 0) return "needs_attention";
  if (planned > 0 && delivered / planned < 0.35) return "needs_attention";
  return "strong";
}

function buildAreaStatuses(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  report: CurriculumIntelligenceReport
): CurriculumAreaStatus[] {
  const plannedByArea = new Map(
    report.planned.byLearningArea.map((s) => [s.id, s.modeCount ?? 0])
  );
  const taughtByArea = new Map(
    report.taught.byLearningArea.map((s) => [s.id, s.modeCount ?? 0])
  );

  return TEACHER_FOCUS_AREAS.map((area) => {
    const activity = countAreaActivity(area.id, lessons, schemes);
    const planned = Math.max(activity.planned, plannedByArea.get(area.id) ?? 0);
    const delivered = Math.max(activity.delivered, taughtByArea.get(area.id) ?? 0);

    return {
      id: area.id,
      label: area.label,
      health: classifyArea(planned, delivered),
      topicId: area.topicId,
    };
  });
}

function limitHealthItems(statuses: CurriculumAreaStatus[]): IntelligenceTeacherView["health"] {
  const strong = statuses.filter((s) => s.health === "strong");
  const needsAttention = statuses.filter((s) => s.health === "needs_attention");
  const missing = statuses.filter((s) => s.health === "missing");

  const maxTotal = 6;
  let remaining = maxTotal;
  const pick = <T,>(items: T[], max: number): T[] => {
    const n = Math.min(items.length, max, remaining);
    remaining -= n;
    return items.slice(0, n);
  };

  return {
    missing: pick(missing, 3),
    needsAttention: pick(needsAttention, 3),
    strong: pick(strong, remaining),
  };
}

function buildRecommendationLinks(
  area: (typeof TEACHER_FOCUS_AREAS)[number],
  appPathways: PathwayId[],
  yearGroupId: YearGroupId
): { lessonHref: string; schemeHref: string; title: string } {
  const params = {
    appPathways,
    yearGroupId,
    topicLabel: area.label,
  };

  return {
    lessonHref: buildLessonBuilderLink({ ...params, topicLabel: area.topicId }),
    schemeHref: buildSchemesLink({ ...params, topicLabel: area.topicId }),
    title: area.preferScheme ? `${area.label} mini-unit` : `${area.label} lesson`,
  };
}

function buildRecommendations(
  statuses: CurriculumAreaStatus[],
  appPathways: PathwayId[],
  yearGroupId: YearGroupId
): IntelligenceRecommendation[] {
  const candidates = statuses.filter(
    (s) => s.health === "missing" || s.health === "needs_attention"
  );

  const areaConfig = new Map(TEACHER_FOCUS_AREAS.map((a) => [a.id, a]));

  return candidates.slice(0, 3).map((status) => {
    const config = areaConfig.get(status.id)!;
    const links = buildRecommendationLinks(config, appPathways, yearGroupId);

    let reason = "";
    if (status.health === "missing") {
      reason =
        config.id === "fitness"
          ? "No fitness coverage detected this term."
          : `No ${status.label.toLowerCase()} coverage detected this term.`;
    } else if (config.id === "healthy-lifestyle") {
      reason = "Healthy Lifestyle under represented.";
    } else {
      reason = `Planned but not yet delivered — ${status.label.toLowerCase()} needs attention.`;
    }

    return {
      id: `rec-${status.id}`,
      title: links.title,
      reason,
      lessonHref: links.lessonHref,
      schemeHref: links.schemeHref,
    };
  });
}

function buildBalanceItems(
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  report: CurriculumIntelligenceReport
): CurriculumBalanceItem[] {
  const scores = TEACHER_FOCUS_AREAS.map((area) => {
    const activity = countAreaActivity(area.id, lessons, schemes);
    const plannedOutcomes = report.planned.byLearningArea.find((s) => s.id === area.id)?.modeCount ?? 0;
    const deliveredOutcomes = report.taught.byLearningArea.find((s) => s.id === area.id)?.modeCount ?? 0;
    const score = activity.planned + activity.delivered * 2 + plannedOutcomes * 0.3 + deliveredOutcomes * 0.5;
    return { label: area.label, score };
  });

  const holisticDelivered = report.taught.byHolisticDevelopment.reduce(
    (n, slice) => n + (slice.modeCount ?? 0),
    0
  );
  scores.push({ label: "Holistic Development", score: holisticDelivered });

  const maxScore = Math.max(...scores.map((s) => s.score), 1);

  return scores.map(({ label, score }) => ({
    label,
    barLength: score === 0 ? 0 : Math.max(1, Math.round((score / maxScore) * 10)),
  }));
}

function hasDeliveredThisMonth(calendar: CalendarEntry[]): boolean {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  return calendar.some(
    (e) => e.deliveryStatus === "delivered" && e.startDate >= monthStart
  );
}

function buildAlerts(
  statuses: CurriculumAreaStatus[],
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[],
  report: CurriculumIntelligenceReport
): CurriculumAlert[] {
  const alerts: CurriculumAlert[] = [];

  for (const status of statuses) {
    if (status.health !== "missing") continue;
    const message =
      status.id === "healthy-lifestyle"
        ? "No Healthy Lifestyle content this term."
        : `No ${status.label} lessons planned.`;
    alerts.push({
      id: `alert-missing-${status.id}`,
      message,
    });
  }

  for (const status of statuses) {
    if (status.health !== "needs_attention") continue;
    if (status.id === "healthy-lifestyle") {
      alerts.push({
        id: "alert-hl-term",
        message: "No Healthy Lifestyle content this term.",
      });
    }
  }

  if ((lessons.length > 0 || schemes.length > 0) && !hasDeliveredThisMonth(calendar)) {
    alerts.push({
      id: "alert-no-delivery-month",
      message: "No delivered lessons this month.",
    });
  }

  for (const gap of report.gaps) {
    if (SPORT_TOPIC_PATTERN.test(gap.message)) continue;
    if (/^no .+ lessons planned$/i.test(gap.message) && !TEACHER_FOCUS_AREAS.some((a) =>
      gap.message.toLowerCase().includes(a.label.toLowerCase())
    )) {
      continue;
    }
    if (
      gap.message.toLowerCase().includes("underrepresented") ||
      gap.message.toLowerCase().includes("under represented") ||
      gap.message.toLowerCase().includes("not yet delivered")
    ) {
      const label = TEACHER_FOCUS_AREAS.find((a) =>
        gap.message.toLowerCase().includes(a.label.toLowerCase())
      )?.label;
      if (label) {
        alerts.push({ id: gap.id, message: gap.message });
      }
    }
  }

  return [...new Map(alerts.map((a) => [a.message, a])).values()].slice(0, 5);
}

function buildQuickActions(
  appPathways: PathwayId[],
  yearGroupId: YearGroupId
): IntelligenceQuickAction[] {
  return [
    {
      id: "qa-fitness",
      label: "Create Fitness Lesson",
      href: buildLessonBuilderLink({
        appPathways,
        yearGroupId,
        topicLabel: "fitness",
      }),
    },
    {
      id: "qa-athletics",
      label: "Create Athletics Lesson",
      href: buildLessonBuilderLink({
        appPathways,
        yearGroupId,
        topicLabel: "athletics",
      }),
    },
    {
      id: "qa-hl-scheme",
      label: "Create Healthy Lifestyle Scheme",
      href: buildSchemesLink({
        appPathways,
        yearGroupId,
        topicLabel: "healthy-lifestyle",
      }),
    },
    {
      id: "qa-assessment",
      label: "Create Assessment",
      href: buildLessonBuilderLink({
        appPathways,
        yearGroupId,
        topicLabel: "sport-values",
        skillLabel: "assessment",
      }),
    },
  ];
}

export function buildAllAreaStatuses(
  report: CurriculumIntelligenceReport,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): CurriculumAreaStatus[] {
  return buildAreaStatuses(lessons, schemes, report);
}

export function buildIntelligenceTeacherView(
  report: CurriculumIntelligenceReport,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[],
  appPathways: PathwayId[],
  yearGroupId: YearGroupId
): IntelligenceTeacherView {
  const allStatuses = buildAreaStatuses(lessons, schemes, report);
  const health = limitHealthItems(allStatuses);

  return {
    health,
    recommendations: buildRecommendations(allStatuses, appPathways, yearGroupId),
    balance: buildBalanceItems(lessons, schemes, report),
    alerts: buildAlerts(allStatuses, lessons, schemes, calendar, report),
    quickActions: buildQuickActions(appPathways, yearGroupId),
  };
}

export function getLearningAreaDisplayLabel(areaId: LearningAreaId): string {
  const focus = TEACHER_FOCUS_AREAS.find((a) => a.id === areaId);
  return focus?.label ?? getLearningAreaLabel(areaId);
}
