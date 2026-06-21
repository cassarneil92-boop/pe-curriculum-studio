import type { CalendarEntry, LessonPlan, PathwayId, SchemeOfWork } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { buildLessonBuilderLink, buildSchemesLink } from "@/lib/curriculum-hub/planning-links";
import type { CurriculumIntelligenceReport } from "@/lib/progress/curriculum-intelligence";
import { buildSchemeProgressSummary } from "@/lib/progress/summary";
import { schemeDisplayTitle } from "@/lib/scheme-builder/helpers";
import { deriveSchemeStatus } from "@/lib/progress/delivery";
import {
  getLearningAreaForTopic,
  type LearningAreaId,
} from "@/src/lib/intelligence/frameworks/learning-areas";
import { buildAllAreaStatuses, type CurriculumAreaStatus } from "@/lib/progress/intelligence-teacher-view";

export interface PlanningInsightAction {
  id: string;
  message: string;
  detail?: string;
  actionLabel: string;
  actionHref: string;
}

export interface PlanningInsightsView {
  suggestedSteps: PlanningInsightAction[];
  balance: {
    wellRepresented: string[];
    needsAttention: string[];
    notYetPlanned: string[];
  };
  opportunities: PlanningInsightAction[];
}

const TEACHER_AREAS: { id: LearningAreaId; label: string; topicId: string }[] = [
  { id: "team-games", label: "Team Games", topicId: "invasion-games" },
  { id: "individual-activity", label: "Athletics", topicId: "athletics" },
  { id: "fitness", label: "Fitness", topicId: "fitness" },
  { id: "healthy-lifestyle", label: "Healthy Lifestyle", topicId: "healthy-lifestyle" },
  { id: "sport-values", label: "Sport Values", topicId: "sport-values" },
  { id: "outdoor-recreation", label: "Outdoor & Recreation", topicId: "outdoor-recreation" },
];

function areaHasPlanning(
  areaId: LearningAreaId,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[]
): boolean {
  for (const lesson of lessons) {
    if (getLearningAreaForTopic(lesson.topicId) === areaId) return true;
  }
  for (const scheme of schemes) {
    if (getLearningAreaForTopic(scheme.topicId) === areaId) return true;
  }
  return false;
}

function buildSuggestedSteps(
  statuses: CurriculumAreaStatus[],
  schemes: SchemeOfWork[],
  appPathways: PathwayId[],
  yearGroupId: YearGroupId
): PlanningInsightAction[] {
  const steps: PlanningInsightAction[] = [];
  const areaConfig = new Map(TEACHER_AREAS.map((a) => [a.id, a]));

  for (const status of statuses) {
    if (status.health !== "missing" && status.health !== "needs_attention") continue;
    if (steps.length >= 5) break;

    const config = areaConfig.get(status.id);
    if (!config) continue;

    const lessonHref = buildLessonBuilderLink({
      appPathways,
      yearGroupId,
      topicLabel: config.topicId,
    });
    const schemeHref = buildSchemesLink({
      appPathways,
      yearGroupId,
      topicLabel: config.topicId,
    });

    if (status.health === "missing") {
      steps.push({
        id: `step-missing-${status.id}`,
        message: `You have not planned ${status.label} this term.`,
        detail: `Create a ${status.label} lesson to start building coverage.`,
        actionLabel: "Create Lesson",
        actionHref: lessonHref,
      });
    } else {
      steps.push({
        id: `step-attention-${status.id}`,
        message: `${status.label} needs more attention in your plans.`,
        detail: `Plan a ${status.label} activity to strengthen your coverage.`,
        actionLabel: "Create Lesson",
        actionHref: lessonHref,
      });
    }
  }

  const inProgress = schemes.filter((s) => deriveSchemeStatus(s) === "in_progress");
  for (const scheme of inProgress) {
    if (steps.length >= 5) break;
    const summary = buildSchemeProgressSummary(scheme);
    if (summary.deliveredLessons === 0) continue;
    const title = schemeDisplayTitle(scheme);
    steps.push({
      id: `step-scheme-${scheme.id}`,
      message: `${title} coverage is progressing well.`,
      detail: `${summary.deliveredLessons} of ${summary.totalLessons} lessons delivered.`,
      actionLabel: "Open Scheme",
      actionHref: `/schemes?edit=${scheme.id}`,
    });
  }

  for (const status of statuses) {
    if (status.health !== "needs_attention" || status.id !== "sport-values") continue;
    if (steps.some((s) => s.id.includes("sport-values"))) continue;
    if (steps.length >= 5) break;
    const config = areaConfig.get("sport-values")!;
    steps.push({
      id: "step-sport-values",
      message: "Sport Values has not appeared in recent plans.",
      detail: "Plan a Sport Values activity with your class.",
      actionLabel: "Create Lesson",
      actionHref: buildLessonBuilderLink({
        appPathways,
        yearGroupId,
        topicLabel: config.topicId,
      }),
    });
  }

  return steps.slice(0, 5);
}

function buildBalance(statuses: CurriculumAreaStatus[]): PlanningInsightsView["balance"] {
  return {
    wellRepresented: statuses.filter((s) => s.health === "strong").map((s) => s.label),
    needsAttention: statuses.filter((s) => s.health === "needs_attention").map((s) => s.label),
    notYetPlanned: statuses.filter((s) => s.health === "missing").map((s) => s.label),
  };
}

function buildOpportunities(
  schemes: SchemeOfWork[],
  lessons: LessonPlan[],
  appPathways: PathwayId[],
  yearGroupId: YearGroupId
): PlanningInsightAction[] {
  const opportunities: PlanningInsightAction[] = [];

  for (const scheme of schemes) {
    if (deriveSchemeStatus(scheme) !== "in_progress") continue;
    const summary = buildSchemeProgressSummary(scheme);
    const remaining = summary.remainingLessons;
    if (remaining > 0 && remaining <= 3) {
      opportunities.push({
        id: `opp-scheme-end-${scheme.id}`,
        message: `Your ${schemeDisplayTitle(scheme)} scheme ends in ${remaining} lesson${remaining === 1 ? "" : "s"}.`,
        detail: "Consider planning the next unit.",
        actionLabel: "Create Scheme",
        actionHref: buildSchemesLink({
          appPathways,
          yearGroupId,
          topicLabel: scheme.topicId,
        }),
      });
    }
  }

  const uncovered = TEACHER_AREAS.filter(
    (area) => !areaHasPlanning(area.id, lessons, schemes)
  );
  if (uncovered.length > 0 && opportunities.length < 3) {
    const area = uncovered[0];
    opportunities.push({
      id: `opp-uncovered-${area.id}`,
      message: `${area.label} is not yet in your plans.`,
      detail: "Add a lesson or scheme to cover this area.",
      actionLabel: "Create Lesson",
      actionHref: buildLessonBuilderLink({
        appPathways,
        yearGroupId,
        topicLabel: area.topicId,
      }),
    });
  }

  return opportunities.slice(0, 3);
}

export function buildPlanningInsightsView(
  report: CurriculumIntelligenceReport,
  lessons: LessonPlan[],
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[],
  appPathways: PathwayId[],
  yearGroupId: YearGroupId
): PlanningInsightsView {
  const allStatuses = buildAllAreaStatuses(report, lessons, schemes);

  return {
    suggestedSteps: buildSuggestedSteps(allStatuses, schemes, appPathways, yearGroupId),
    balance: buildBalance(allStatuses),
    opportunities: buildOpportunities(schemes, lessons, appPathways, yearGroupId),
  };
}
