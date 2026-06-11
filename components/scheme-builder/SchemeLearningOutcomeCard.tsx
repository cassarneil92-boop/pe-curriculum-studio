import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import { getPathwayById } from "@/src/lib/curriculum/registry";
import type { LearningOutcome } from "@/src/lib/curriculum/types";

interface SchemeLearningOutcomeCardProps {
  outcome: LearningOutcome;
  onRemove?: () => void;
}

export function SchemeLearningOutcomeCard({
  outcome,
  onRemove,
}: SchemeLearningOutcomeCardProps) {
  const topic = outcome.topicIds[0]
    ? getPlanningTopicDisplayName(outcome.topicIds[0])
    : "";
  const pathway = outcome.pathwayId ? getPathwayById(outcome.pathwayId)?.label ?? "" : "";
  const meta = [pathway, topic].filter(Boolean).join(" · ");

  return (
    <div className="w-full rounded-xl border border-teal-200 bg-teal-50/60 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-slate-800">
            <span className="font-semibold text-teal-900">{outcome.code}</span>
            <span className="text-slate-400"> – </span>
            {outcome.description}
          </p>
          {meta && <p className="mt-1.5 text-xs text-slate-500">{meta}</p>}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-md px-1.5 py-0.5 text-lg font-bold leading-none text-teal-700/70 hover:bg-teal-100 hover:text-teal-900"
            aria-label={`Remove ${outcome.code}`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
