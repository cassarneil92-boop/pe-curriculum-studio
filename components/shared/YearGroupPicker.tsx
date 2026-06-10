"use client";

import { YEAR_GROUP_SECTIONS } from "@/lib/year-groups";
import type { YearGroupId } from "@/lib/year-groups";

interface YearGroupPickerProps {
  selected: YearGroupId[];
  onToggle: (id: YearGroupId) => void;
}

export function YearGroupPicker({ selected, onToggle }: YearGroupPickerProps) {
  return (
    <div className="space-y-5">
      {YEAR_GROUP_SECTIONS.map((group) => (
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
