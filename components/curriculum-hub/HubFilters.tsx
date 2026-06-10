"use client";

import Link from "next/link";
import { HubPathwayPicker } from "@/components/curriculum-hub/HubPathwayPicker";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FieldGroup, Input, Select } from "@/components/ui/Input";
import type { HubFilterState } from "@/lib/curriculum-hub/engine";
import { createDefaultHubFilters } from "@/lib/curriculum-hub/pathway-defaults";
import {
  getAvailableYearGroupIdsForPathways,
  pickYearGroupForPathwaysFilter,
  type TeacherContextSnapshot,
} from "@/lib/teacher-context";
import type { PathwayId } from "@/lib/types";
import { getYearGroupLabel, type YearGroupId } from "@/lib/year-groups";

interface HubFiltersProps {
  filters: HubFilterState;
  context: TeacherContextSnapshot;
  showExploreBadge: boolean;
  onPathwaysChange: (pathways: PathwayId[]) => void;
  onYearChange: (year: YearGroupId) => void;
  onSearchChange: (search: string) => void;
}

export function HubFilters({
  filters,
  context,
  showExploreBadge,
  onPathwaysChange,
  onYearChange,
  onSearchChange,
}: HubFiltersProps) {
  const yearOptions = getAvailableYearGroupIdsForPathways(filters.appPathways).filter(
    (id) =>
      context.exploreAllEnabled ||
      context.visibleYearGroupIds.length === 0 ||
      context.visibleYearGroupIds.includes(id)
  );

  return (
    <Card className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <p className="text-sm font-medium text-slate-700">Teaching context</p>
        <div className="flex flex-wrap items-center gap-2">
          {context.exploreAllEnabled ? (
            <Badge tone="teal">Explore All active</Badge>
          ) : showExploreBadge ? (
            <Badge tone="amber">Intelligent Mode</Badge>
          ) : null}
          {!context.exploreAllEnabled && showExploreBadge && (
            <Link
              href="/settings"
              className="text-xs font-medium text-teal-700 hover:text-teal-800"
            >
              Enable Explore All →
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-5">
        <HubPathwayPicker
          selected={filters.appPathways}
          context={context}
          onChange={onPathwaysChange}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Year group">
            <Select
              value={filters.yearGroupId}
              onChange={(e) => onYearChange(e.target.value as YearGroupId)}
              disabled={filters.appPathways.length === 0}
            >
              <option value="">Select year group</option>
              {yearOptions.map((yearId) => (
                <option key={yearId} value={yearId}>
                  {getYearGroupLabel(yearId)}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup label="Search">
            <Input
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search topics, skills or outcomes…"
              disabled={filters.appPathways.length === 0 || !filters.yearGroupId}
            />
          </FieldGroup>
        </div>
      </div>
    </Card>
  );
}

export { createDefaultHubFilters };

export function reconcileHubYearGroup(
  pathways: PathwayId[],
  currentYear: YearGroupId | "",
  context: TeacherContextSnapshot
): YearGroupId | "" {
  if (pathways.length === 0) return "";
  return pickYearGroupForPathwaysFilter(
    pathways,
    currentYear || context.teacher.yearGroups[0] || "",
    context.visibleYearGroupIds,
    context.exploreAllEnabled
  );
}
