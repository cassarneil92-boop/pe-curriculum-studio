"use client";

import { Badge } from "@/components/ui/Badge";
import { getPlanningOutcomePathwayBadges, getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import type { PathwayId } from "@/lib/types";
import type { LearningOutcome } from "@/src/lib/curriculum";

interface PlanningOutcomeSectionsProps {
  strict: LearningOutcome[];
  additional: LearningOutcome[];
  selectedIds: string[];
  selectedPathways?: PathwayId[];
  onToggle: (id: string) => void;
  helperText?: string;
  showMultiPathwayNote?: boolean;
}

function OutcomeList({
  outcomes,
  selectedIds,
  selectedPathways,
  onToggle,
}: {
  outcomes: LearningOutcome[];
  selectedIds: string[];
  selectedPathways: PathwayId[];
  onToggle: (id: string) => void;
}) {
  if (outcomes.length === 0) return null;

  return (
    <ul className="space-y-3">
      {outcomes.map((outcome) => {
        const checked = selectedIds.includes(outcome.id);
        const topicName = getPlanningTopicDisplayName(outcome.topicIds[0] ?? "");
        const badges = getPlanningOutcomePathwayBadges(outcome, selectedPathways);

        return (
          <li
            key={outcome.id}
            className={`rounded-xl border px-4 py-3 transition-colors ${
              checked ? "border-teal-200 bg-teal-50/50" : "border-slate-200 bg-white"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(outcome.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
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

export function PlanningOutcomeSections({
  strict,
  additional,
  selectedIds,
  selectedPathways = [],
  onToggle,
  helperText = "Suggested outcomes are not automatically selected. Choose the ones that match your lesson.",
  showMultiPathwayNote = false,
}: PlanningOutcomeSectionsProps) {
  const hasStrict = strict.length > 0;
  const hasAdditional = additional.length > 0;

  if (!hasStrict && !hasAdditional) {
    return (
      <p className="text-sm text-slate-500">
        No matching learning outcomes found. Try another skill or broaden your pathway selection.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">{helperText}</p>

      {showMultiPathwayNote && (
        <p className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
          Multiple pathways selected. Strict matches use the primary pathway for now. Additional
          outcomes are shown from all selected pathways.
        </p>
      )}

      {hasStrict && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Strict Curriculum Matches</h3>
          <p className="mb-3 text-xs text-slate-500">
            Highest-confidence matches from the curated knowledge base alignment engine.
          </p>
          <OutcomeList
            outcomes={strict}
            selectedIds={selectedIds}
            selectedPathways={selectedPathways}
            onToggle={onToggle}
          />
        </section>
      )}

      {hasAdditional && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Additional Relevant Outcomes</h3>
          <p className="mb-3 text-xs text-slate-500">
            {hasStrict
              ? "Imported and metadata-enhanced outcomes that also match your topic and skill."
              : "No strict curated match found, but these relevant imported curriculum outcomes match your selected topic and skill."}
          </p>
          <OutcomeList
            outcomes={additional}
            selectedIds={selectedIds}
            selectedPathways={selectedPathways}
            onToggle={onToggle}
          />
        </section>
      )}
    </div>
  );
}
