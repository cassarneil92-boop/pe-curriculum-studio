"use client";

import {
  getYearGroupSectionsForPathways,
  pruneYearGroupsForPathways,
} from "@/lib/teacher-context";
import type { TeacherProfile } from "@/lib/types";
import type { YearGroupId } from "@/lib/year-groups";
import { useEffect } from "react";

interface ContextualYearGroupPickerProps {
  teacher: TeacherProfile;
  selected: YearGroupId[];
  onToggle: (id: YearGroupId) => void;
  onPrune?: (yearGroups: YearGroupId[]) => void;
}

export function ContextualYearGroupPicker({
  teacher,
  selected,
  onToggle,
  onPrune,
}: ContextualYearGroupPickerProps) {
  const sections = getYearGroupSectionsForPathways(teacher.pathways);

  useEffect(() => {
    if (!onPrune) return;
    const pruned = pruneYearGroupsForPathways(teacher.pathways, selected);
    if (pruned.length !== selected.length) {
      onPrune(pruned);
    }
  }, [teacher.pathways, selected, onPrune]);

  if (teacher.pathways.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Select at least one subject pathway to see available year groups.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {sections.map((group) => (
        <div key={group.section}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            {group.section}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onToggle(option.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selected.includes(option.id)
                    ? "border-teal-300 bg-teal-50 text-teal-800"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
