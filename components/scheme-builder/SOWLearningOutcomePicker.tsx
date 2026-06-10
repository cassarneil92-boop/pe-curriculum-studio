"use client";

import { Badge } from "@/components/ui/Badge";
import {
  getPlanningOutcomePathwayBadges,
  getPlanningTopicDisplayName,
} from "@/src/lib/curriculum/planning";
import type { PathwayId } from "@/lib/types";
import type { LearningOutcome } from "@/src/lib/curriculum";

interface SOWLearningOutcomePickerProps {
  outcomes: LearningOutcome[];
  selectedIds: string[];
  selectedPathways?: PathwayId[];
  onChange: (ids: string[]) => void;
  emptyMessage?: string;
}

export function SOWLearningOutcomePicker({
  outcomes,
  selectedIds,
  selectedPathways = [],
  onChange,
  emptyMessage = "Select pathway, year group, topic and skill to see curriculum suggestions.",
}: SOWLearningOutcomePickerProps) {
  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((existing) => existing !== id)
        : [...selectedIds, id]
    );
  };

  if (outcomes.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2">
      {outcomes.map((outcome) => {
        const checked = selectedIds.includes(outcome.id);
        const topicName = getPlanningTopicDisplayName(outcome.topicIds[0] ?? "");
        const badges = getPlanningOutcomePathwayBadges(outcome, selectedPathways);

        return (
          <li
            key={outcome.id}
            className={`rounded-xl border px-3 py-2.5 transition-colors ${
              checked ? "border-teal-200 bg-teal-50/50" : "border-slate-200 bg-white"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(outcome.id)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-teal-700">{outcome.code}</span>
                  <Badge tone="slate">{topicName}</Badge>
                  {badges.map((label) => (
                    <Badge key={label} tone="blue">
                      {label}
                    </Badge>
                  ))}
                </span>
                <span className="mt-1 block text-sm text-slate-700">{outcome.description}</span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
