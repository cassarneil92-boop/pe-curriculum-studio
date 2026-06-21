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
  showApplyActions?: boolean;
  embedded?: boolean;
}

export function PedagogySuggestionList({
  title = "Optional teaching refinements",
  description = "Advisory ideas from the PE knowledge base.",
  suggestions,
  emptyMessage = "Add year group, topic, or lesson details to unlock refinements.",
  onApply,
  showApplyActions = false,
  embedded = false,
}: PedagogySuggestionListProps) {
  if (suggestions.length === 0) {
    if (embedded) return null;
    return (
      <Card className="border-slate-100 bg-slate-50/40">
        <CardHeader title={title} description={emptyMessage} />
      </Card>
    );
  }

  const body = (
    <div className="space-y-2">
      {suggestions.map((card) => (
        <PEKnowledgeCard
          key={card.entry.id}
          card={card}
          showApplyActions={showApplyActions}
          onApply={showApplyActions ? onApply : undefined}
        />
      ))}
    </div>
  );

  if (embedded) {
    return body;
  }

  return (
    <Card className="border-teal-100/70 bg-teal-50/20">
      <CardHeader title={title} description={description} />
      {body}
    </Card>
  );
}
