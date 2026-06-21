"use client";

import { ApplySuggestionButton } from "@/components/pe-knowledge/ApplySuggestionButton";
import type { KnowledgeQualityInsight } from "@/src/lib/peKnowledge/coaching";

interface LessonQualityInsightProps {
  insights: KnowledgeQualityInsight[];
  compact?: boolean;
  onApplyFix?: (insight: KnowledgeQualityInsight) => boolean | void;
}

export function LessonQualityInsight({
  insights,
  compact = false,
  onApplyFix,
}: LessonQualityInsightProps) {
  if (insights.length === 0) {
    return compact ? null : (
      <p className="text-xs text-emerald-700">
        PE specialist review: no major planning gaps flagged from the knowledge base.
      </p>
    );
  }

  if (compact) {
    return (
      <span className="text-xs text-amber-800">
        {insights.length} specialist insight{insights.length === 1 ? "" : "s"} to review
      </span>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        PE specialist insights
      </p>
      <ul className="space-y-2">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className="rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-amber-900">{insight.area}</p>
                <p className="mt-0.5 text-slate-700">{insight.message}</p>
                {insight.prompt && (
                  <p className="mt-1 text-slate-600">
                    <span className="font-medium">Try: </span>
                    {insight.prompt}
                  </p>
                )}
              </div>
              {insight.fix && onApplyFix && (
                <ApplySuggestionButton
                  label={insight.fix.actionLabel}
                  onApply={() => onApplyFix(insight)}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
