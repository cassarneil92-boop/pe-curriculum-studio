"use client";

import { PedagogySuggestionList } from "@/components/pe-knowledge/PedagogySuggestionList";
import type { PEKnowledgeCardApplyTarget } from "@/components/pe-knowledge/PEKnowledgeCard";
import type { PEKnowledgeCardViewModel } from "@/src/lib/peKnowledge/coaching";

interface OptionalTeachingRefinementsProps {
  suggestions: PEKnowledgeCardViewModel[];
  onApply?: (target: PEKnowledgeCardApplyTarget, text: string) => boolean | void;
}

export function OptionalTeachingRefinements({
  suggestions,
  onApply,
}: OptionalTeachingRefinementsProps) {
  if (suggestions.length === 0) return null;

  return (
    <details className="group rounded-[20px] border border-slate-200 bg-white">
      <summary className="cursor-pointer list-none px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <p className="text-sm font-semibold text-slate-900">Optional teaching refinements</p>
        <p className="mt-0.5 text-xs text-slate-500">
          These are optional ideas you can use after saving the lesson or scheme.
        </p>
      </summary>
      <div className="border-t border-slate-100 px-5 pb-5 pt-2">
        <PedagogySuggestionList
          suggestions={suggestions}
          showApplyActions={Boolean(onApply)}
          onApply={onApply}
          embedded
        />
      </div>
    </details>
  );
}
