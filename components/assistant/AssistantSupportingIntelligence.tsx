"use client";

import type { AssistantResponse } from "@/lib/assistant";
import type { PEKnowledgeCardApplyTarget } from "@/components/pe-knowledge/PEKnowledgeCard";
import { Card } from "@/components/ui/Card";
import type { PEKnowledgeCardViewModel } from "@/src/lib/peKnowledge/coaching";
import { OptionalTeachingRefinements } from "@/components/assistant/OptionalTeachingRefinements";

interface AssistantSupportingIntelligenceProps {
  response: AssistantResponse;
  specialistSuggestions: PEKnowledgeCardViewModel[];
  onFollowUp: (prompt: string) => void;
  matchesSlot?: React.ReactNode;
  contextSlot?: React.ReactNode;
}

export function AssistantSupportingIntelligence({
  response,
  specialistSuggestions,
  onFollowUp,
  matchesSlot,
  contextSlot,
}: AssistantSupportingIntelligenceProps) {
  return (
    <div className="space-y-4 border-t border-slate-200/80 pt-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Supporting intelligence
      </h2>

      {matchesSlot}
      {contextSlot}

      <OptionalTeachingRefinements suggestions={specialistSuggestions} />

      {response.pedagogyRecommendations && response.pedagogyRecommendations.length > 0 && (
        <details className="rounded-[20px] border border-slate-200 bg-white">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-900 marker:content-none">
            Pedagogy notes
          </summary>
          <div className="border-t border-slate-100 px-5 pb-5">
            <ul className="space-y-2 pt-3">
              {response.pedagogyRecommendations.map((rec) => (
                <li
                  key={rec.id}
                  className="rounded-xl border border-teal-100 bg-teal-50/20 px-4 py-3 text-sm"
                >
                  <p className="font-semibold text-teal-900">{rec.name}</p>
                  <p className="mt-1 text-slate-600">{rec.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}

      {response.suggestions.length > 0 && (
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-900">Suggested follow-ups</p>
          <ul className="space-y-2">
            {response.suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="text-left text-sm text-teal-700 hover:text-teal-900"
                  onClick={() => onFollowUp(s)}
                >
                  → {s}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
