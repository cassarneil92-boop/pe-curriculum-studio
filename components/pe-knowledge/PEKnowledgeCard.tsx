"use client";

import type { PEKnowledgeCardViewModel } from "@/src/lib/peKnowledge/coaching";

interface PEKnowledgeCardProps {
  card: PEKnowledgeCardViewModel;
  defaultOpen?: boolean;
}

export function PEKnowledgeCard({ card, defaultOpen = false }: PEKnowledgeCardProps) {
  return (
    <details
      className="group rounded-xl border border-slate-100 bg-white/90"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none px-3 py-2.5 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">{card.entry.title}</p>
            <p className="mt-0.5 text-xs text-slate-600">{card.reason}</p>
          </div>
          <span className="shrink-0 text-[10px] text-slate-400 group-open:hidden">Show</span>
          <span className="hidden shrink-0 text-[10px] text-slate-400 group-open:inline">Hide</span>
        </div>
      </summary>
      <div className="space-y-2 border-t border-slate-50 px-3 pb-3 pt-2 text-xs text-slate-700">
        {card.planningPrompts.length > 0 && (
          <div>
            <p className="font-semibold text-slate-500">Planning prompts</p>
            <ul className="mt-1 space-y-0.5">
              {card.planningPrompts.map((prompt) => (
                <li key={prompt}>• {prompt}</li>
              ))}
            </ul>
          </div>
        )}
        <p>
          <span className="font-semibold text-slate-500">Assessment: </span>
          {card.assessmentPrompt}
        </p>
        <p>
          <span className="font-semibold text-slate-500">Differentiation: </span>
          {card.differentiationPrompt}
        </p>
      </div>
    </details>
  );
}
