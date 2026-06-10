import { getPathwayLabel } from "@/lib/constants";
import type { PathwayId } from "@/lib/types";
import { appPathwayToCurriculum } from "@/lib/scheme-builder/pathway-map";
import type { LearningOutcome } from "../types";
import { getMatchingAppPathwaysForOutcome } from "./matching";

/**
 * Compact, deduplicated pathway badges for planning UI.
 * When General PE + Sport Values both map to secondary-pe, shows one combined label.
 */
export function getPlanningOutcomePathwayBadges(
  outcome: LearningOutcome,
  selectedAppPathways: PathwayId[]
): string[] {
  const matching = getMatchingAppPathwaysForOutcome(outcome, selectedAppPathways);
  if (matching.length === 0) return [];
  if (matching.length === 1) return [getPathwayLabel(matching[0])];

  const byCurriculum = new Map<string, PathwayId[]>();
  for (const appPathway of matching) {
    const curriculumId = appPathwayToCurriculum(appPathway) ?? appPathway;
    const list = byCurriculum.get(curriculumId) ?? [];
    list.push(appPathway);
    byCurriculum.set(curriculumId, list);
  }

  const badges: string[] = [];
  for (const apps of byCurriculum.values()) {
    const labels = [...new Set(apps.map((id) => getPathwayLabel(id)))];
    badges.push(labels.join(" + "));
  }

  return [...new Set(badges)];
}
