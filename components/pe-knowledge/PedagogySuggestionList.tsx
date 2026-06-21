"use client";

import { PEKnowledgeCard, type PEKnowledgeCardApplyTarget } from "@/components/pe-knowledge/PEKnowledgeCard";
import { Card, CardHeader } from "@/components/ui/Card";
import type { PEKnowledgeCardViewModel } from "@/src/lib/peKnowledge/coaching";

interface PedagogySuggestionListProps {
  title?: string;
  description?: string;
  suggestions: PEKnowledgeCardViewModel[];
  emptyMessage?: string;
  onApply?: (target: PEKnowledgeCardApplyTarget, text: string) => boolean | void;
}

export function PedagogySuggestionList({
  title = "PE Specialist Suggestions",
  description = "Evidence-informed guidance matched to your planning context.",
  suggestions,
  emptyMessage = "Add year group, topic, or lesson details to unlock specialist suggestions.",
  onApply,
}: PedagogySuggestionListProps) {
  if (suggestions.length === 0) {
    return (
      <Card className="border-slate-100 bg-slate-50/40">
        <CardHeader title={title} description={emptyMessage} />
      </Card>
    );
  }

  return (
    <Card className="border-teal-100/70 bg-teal-50/20">
      <CardHeader title={title} description={description} />
      <div className="space-y-2">
        {suggestions.map((card, index) => (
          <PEKnowledgeCard
            key={card.entry.id}
            card={card}
            defaultOpen={index === 0}
            onApply={onApply}
          />
        ))}
      </div>
      <p className="mt-3 text-[10px] text-slate-500">
        Apply suggestions to your lesson draft — advisory guidance from the internal PE knowledge base.
      </p>
    </Card>
  );
}
