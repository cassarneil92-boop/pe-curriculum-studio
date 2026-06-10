import { DEFAULT_YEAR_GROUP_ID } from "@/lib/constants";
import type { HubFilterState } from "@/lib/curriculum-hub/engine";
import {
  pickYearGroupForPathwaysFilter,
  type TeacherContextSnapshot,
} from "@/lib/teacher-context";
import type { PathwayId } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";

export function getDefaultHubPathways(context: TeacherContextSnapshot): PathwayId[] {
  if (context.teacher.pathways.length > 0) {
    return [...context.teacher.pathways];
  }
  if (!context.exploreAllEnabled) {
    return [...context.visibleAppPathways];
  }
  return [];
}

export function createDefaultHubFilters(context: TeacherContextSnapshot): HubFilterState {
  const appPathways = getDefaultHubPathways(context);
  const teacherYear = context.teacher.yearGroups[0] ?? DEFAULT_YEAR_GROUP_ID;
  const yearGroupId: YearGroupId | "" = appPathways.length
    ? pickYearGroupForPathwaysFilter(
        appPathways,
        teacherYear,
        context.visibleYearGroupIds,
        context.exploreAllEnabled
      )
    : "";

  return { appPathways, yearGroupId, search: "" };
}
