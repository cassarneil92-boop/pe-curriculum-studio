"use client";

import { Select } from "@/components/ui/Input";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import {
  getAvailableYearGroupIdsForPathwayFilter,
  getAvailableYearGroupIdsForPathways,
  getYearGroupSectionsForPathways,
  isAppYearGroupVisible,
} from "@/lib/teacher-context";
import type { PathwayId } from "@/lib/types";
import type { SelectHTMLAttributes } from "react";

interface YearGroupSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  pathwayId?: string;
  pathwayIds?: PathwayId[];
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function YearGroupSelect({
  pathwayId,
  pathwayIds,
  allowEmpty = false,
  emptyLabel = "Select year group",
  ...props
}: YearGroupSelectProps) {
  const { context } = useTeacherContext();
  const teacherPathways =
    context.teacher.pathways.length > 0
      ? context.teacher.pathways
      : context.visibleAppPathways;

  const sections = getYearGroupSectionsForPathways(teacherPathways);
  const pathwayAllowed = pathwayIds?.length
    ? new Set(getAvailableYearGroupIdsForPathways(pathwayIds))
    : pathwayId
      ? new Set(getAvailableYearGroupIdsForPathwayFilter(pathwayId))
      : null;

  const options = sections.flatMap((group) =>
    group.options.filter((option) => {
      if (pathwayAllowed && !pathwayAllowed.has(option.id)) return false;
      if (!context.exploreAllEnabled && !isAppYearGroupVisible(option.id, context)) {
        return false;
      }
      return true;
    })
  );

  return (
    <Select {...props}>
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
