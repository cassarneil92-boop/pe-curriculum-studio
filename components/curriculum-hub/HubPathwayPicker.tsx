"use client";

import { PATHWAYS } from "@/lib/constants";
import { isAppPathwayVisible, type TeacherContextSnapshot } from "@/lib/teacher-context";
import type { PathwayId } from "@/lib/types";

interface HubPathwayPickerProps {
  selected: PathwayId[];
  context: TeacherContextSnapshot;
  onChange: (pathways: PathwayId[]) => void;
}

export function HubPathwayPicker({ selected, context, onChange }: HubPathwayPickerProps) {
  const selectablePathways = context.exploreAllEnabled
    ? PATHWAYS
    : PATHWAYS.filter((pathway) => isAppPathwayVisible(pathway.id, context));

  const togglePathway = (pathwayId: PathwayId) => {
    onChange(
      selected.includes(pathwayId)
        ? selected.filter((id) => id !== pathwayId)
        : [...selected, pathwayId]
    );
  };

  const selectAllVisible = () => {
    onChange(selectablePathways.map((pathway) => pathway.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">Curriculum pathways</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAllVisible}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-teal-300 hover:text-teal-700"
          >
            Select all visible
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectablePathways.map((pathway) => {
          const isSelected = selected.includes(pathway.id);
          const outsideContext =
            context.exploreAllEnabled &&
            context.teacher.pathways.length > 0 &&
            !context.teacher.pathways.includes(pathway.id);

          return (
            <button
              key={pathway.id}
              type="button"
              onClick={() => togglePathway(pathway.id)}
              aria-pressed={isSelected}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                isSelected
                  ? "border-teal-500 bg-teal-50 ring-1 ring-teal-200"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span
                className={`block text-sm ${isSelected ? "font-medium text-teal-900" : "text-slate-800"}`}
              >
                {pathway.label}
              </span>
              {outsideContext && (
                <span className="mt-1 block text-xs text-amber-700">
                  Outside your current teaching context
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-slate-500">
          {selected.length} pathway{selected.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}
