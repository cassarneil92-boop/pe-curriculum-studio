import { appPathwayToCurriculum } from "@/lib/scheme-builder/pathway-map";
import type { PathwayId } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { SKILLS, TOPICS } from "@/src/lib/curriculum";

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveCurriculumTopicId(topicLabel: string): string {
  const key = normalise(topicLabel);
  const byId = TOPICS.find((t) => normalise(t.id) === key);
  if (byId) return byId.id;
  const byName = TOPICS.find((t) => normalise(t.name) === key);
  if (byName) return byName.id;
  const partial = TOPICS.find(
    (t) => key.includes(normalise(t.name)) || normalise(t.name).includes(key)
  );
  return partial?.id ?? key.replace(/\s+/g, "-");
}

export function resolveCurriculumSkillId(skillLabel: string): string {
  const key = normalise(skillLabel);
  const byId = SKILLS.find((s) => normalise(s.id) === key);
  if (byId) return byId.id;
  const byName = SKILLS.find((s) => normalise(s.name) === key);
  if (byName) return byName.id;
  return key.replace(/\s+/g, "-");
}

export interface HubPlanningParams {
  appPathways: PathwayId[];
  yearGroupId: YearGroupId;
  topicLabel: string;
  skillLabel?: string;
}

function appendPathwayParams(
  qs: URLSearchParams,
  pathways: PathwayId[],
  useCurriculumIds: boolean
): void {
  if (pathways.length === 0) return;

  if (pathways.length === 1) {
    const pathway = pathways[0];
    qs.set(
      "pathway",
      useCurriculumIds ? (appPathwayToCurriculum(pathway) ?? "secondary-pe") : pathway
    );
    return;
  }

  qs.set("selectedPathways", pathways.join(","));
}

export function buildLessonBuilderLink(params: HubPlanningParams): string {
  const qs = new URLSearchParams({
    yearGroup: params.yearGroupId,
    topic: resolveCurriculumTopicId(params.topicLabel),
  });
  appendPathwayParams(qs, params.appPathways, true);
  if (params.skillLabel) {
    qs.set("skill", resolveCurriculumSkillId(params.skillLabel));
  }
  return `/lesson-builder?${qs.toString()}`;
}

export function buildSchemesLink(params: HubPlanningParams): string {
  const qs = new URLSearchParams({
    create: "1",
    yearGroup: params.yearGroupId,
    topic: resolveCurriculumTopicId(params.topicLabel),
  });
  appendPathwayParams(qs, params.appPathways, false);
  if (params.skillLabel) {
    qs.set("skill", resolveCurriculumSkillId(params.skillLabel));
  }
  return `/schemes?${qs.toString()}`;
}

export function parseHubPathwaysFromQuery(
  pathway: string | null,
  selectedPathways: string | null
): PathwayId[] {
  if (selectedPathways) {
    return selectedPathways.split(",").filter(Boolean) as PathwayId[];
  }
  if (pathway) return [pathway as PathwayId];
  return [];
}

export function buildCalendarLink(params: HubPlanningParams): string {
  const qs = new URLSearchParams({
    create: "1",
    yearGroup: params.yearGroupId,
    topic: resolveCurriculumTopicId(params.topicLabel),
  });
  appendPathwayParams(qs, params.appPathways, false);
  if (params.skillLabel) {
    qs.set("skill", params.skillLabel);
  }
  return `/calendar?${qs.toString()}`;
}

export function buildScheduleTopicLink(params: HubPlanningParams): string {
  const qs = new URLSearchParams({
    schedule: "1",
    yearGroup: params.yearGroupId,
    topic: resolveCurriculumTopicId(params.topicLabel),
  });
  appendPathwayParams(qs, params.appPathways, false);
  if (params.skillLabel) {
    qs.set("skill", params.skillLabel);
  }
  return `/calendar?${qs.toString()}`;
}

export function buildTeachingProgressLink(params: HubPlanningParams): string {
  const qs = new URLSearchParams({
    yearGroup: params.yearGroupId,
    topic: resolveCurriculumTopicId(params.topicLabel),
  });
  appendPathwayParams(qs, params.appPathways, false);
  if (params.skillLabel) {
    qs.set("skill", params.skillLabel);
  }
  return `/curriculum-analytics?${qs.toString()}`;
}
