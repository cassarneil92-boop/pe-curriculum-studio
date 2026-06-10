import type { PathwayId as AppPathwayId } from "@/lib/types";
import type { PathwayId as CurriculumPathwayId } from "@/src/lib/curriculum";

const APP_TO_CURRICULUM: Partial<Record<AppPathwayId, CurriculumPathwayId>> = {
  "early-years-pe": "early-years-pe",
  "primary-pe": "primary-pe",
  "general-pe": "secondary-pe",
  "sport-values": "secondary-pe",
  "pe-option-sec": "pe-option-sec",
  "alp-pe": "alp-pe",
  "alp-sports-vocational": "alp-sports-vocational",
  "fitness-curriculum": "fitness-curriculum",
};

export function appPathwayToCurriculum(
  pathway: AppPathwayId
): CurriculumPathwayId | null {
  return APP_TO_CURRICULUM[pathway] ?? null;
}

/** Map curriculum pathway ids to app pathways for shared planning filters. */
export function curriculumPathwayToAppPathways(
  pathway: CurriculumPathwayId
): AppPathwayId[] {
  const matches: AppPathwayId[] = [];
  for (const [appPathway, curriculumPathway] of Object.entries(APP_TO_CURRICULUM)) {
    if (curriculumPathway === pathway) {
      matches.push(appPathway as AppPathwayId);
    }
  }
  return matches.length > 0 ? matches : [];
}
