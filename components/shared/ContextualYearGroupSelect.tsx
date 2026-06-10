"use client";

import { Select } from "@/components/ui/Input";
import {
  getAvailableYearGroupIdsForPathways,
  getYearGroupSectionsForPathways,
} from "@/lib/teacher-context";
import type { PathwayId, TeacherProfile } from "@/lib/types";
import type { SelectHTMLAttributes } from "react";

interface ContextualYearGroupSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  teacher: TeacherProfile;
  pathwayId?: PathwayId;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function ContextualYearGroupSelect({
  teacher,
  pathwayId,
  allowEmpty = false,
  emptyLabel = "All years",
  ...props
}: ContextualYearGroupSelectProps) {
  const contextPathways =
    teacher.pathways.length > 0 ? teacher.pathways : ([] as PathwayId[]);
  const sections = getYearGroupSectionsForPathways(contextPathways);
  const allowedIds = pathwayId
    ? new Set(getAvailableYearGroupIdsForPathways([pathwayId]))
    : null;

  return (
    <Select {...props}>
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {sections.map((group) => {
        const options = allowedIds
          ? group.options.filter((option) => allowedIds.has(option.id))
          : group.options;

        if (options.length === 0) return null;

        return (
          <optgroup key={group.section} label={group.section}>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </optgroup>
        );
      })}
    </Select>
  );
}
