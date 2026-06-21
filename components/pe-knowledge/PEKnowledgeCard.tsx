"use client";

import { ApplySuggestionButton } from "@/components/pe-knowledge/ApplySuggestionButton";
import type { PEKnowledgeCardViewModel } from "@/src/lib/peKnowledge/coaching";

export type PEKnowledgeCardApplyTarget =
  | "lessonAim"
  | "successCriteria"
  | "assessment"
  | "differentiation"
  | "teacherNotes";

interface PEKnowledgeCardProps {
  card: PEKnowledgeCardViewModel;
  defaultOpen?: boolean;
  showApplyActions?: boolean;
  onApply?: (target: PEKnowledgeCardApplyTarget, text: string) => boolean | void;
}

export function PEKnowledgeCard({
  card,
  defaultOpen = false,
  showApplyActions = false,
  onApply,
}: PEKnowledgeCardProps) {
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
          <span className="shrink-0 text-[10px] text-slate-400">Details</span>
        </div>
      </summary>
      <div className="space-y-2 border-t border-slate-50 px-3 pb-3 pt-2 text-xs text-slate-700">
        {card.planningPrompts.length > 0 && (
          <div>
            <p className="font-semibold text-slate-500">Planning prompts</p>
            <ul className="mt-1 space-y-1">
              {card.planningPrompts.map((prompt) => (
                <li key={prompt} className="flex items-start justify-between gap-2">
                  <span className="min-w-0 flex-1">• {prompt}</span>
                  {showApplyActions && onApply && (
                    <ApplySuggestionButton
                      label="Use in draft"
                      onApply={() => onApply("lessonAim", prompt)}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1">
            <span className="font-semibold text-slate-500">Assessment: </span>
            {card.assessmentPrompt}
          </p>
          {showApplyActions && onApply && (
            <ApplySuggestionButton
              label="Use in draft"
              onApply={() => onApply("assessment", card.assessmentPrompt)}
            />
          )}
        </div>
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1">
            <span className="font-semibold text-slate-500">Differentiation: </span>
            {card.differentiationPrompt}
          </p>
          {showApplyActions && onApply && (
            <ApplySuggestionButton
              label="Use in draft"
              onApply={() => onApply("differentiation", card.differentiationPrompt)}
            />
          )}
        </div>
        {card.entry.practicalApplications[0] && (
          <div className="flex items-start justify-between gap-2 border-t border-slate-50 pt-2">
            <p className="min-w-0 flex-1 text-slate-600">{card.entry.practicalApplications[0]}</p>
            {showApplyActions && onApply && (
              <ApplySuggestionButton
                label="Use in draft"
                onApply={() => onApply("teacherNotes", card.entry.practicalApplications[0])}
              />
            )}
          </div>
        )}
      </div>
    </details>
  );
}
