"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlanningCoachCard } from "@/components/lesson-builder/PlanningCoachCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  buildEndingContextKey,
  buildLessonEndingSuggestions,
  endingSuggestionToComponent,
  getEndingCategoryLabel,
  groupEndingSuggestions,
  type EndingSuggestion,
  type EndingSuggestionCategory,
} from "@/lib/lesson-builder/lesson-ending-suggestions";
import { PLANNING_COACH } from "@/lib/lesson-builder/planning-coach-labels";
import type { LessonEndingComponent } from "@/lib/types";

interface LessonEndingAssistantProps {
  topicId: string;
  topicName: string;
  skillId: string;
  skillName: string;
  selectedOutcomeIds: string[];
  existingEndingCount: number;
  onAddEnding: (ending: LessonEndingComponent) => void;
  onAddEndings: (endings: LessonEndingComponent[]) => void;
}

const CATEGORY_ORDER: EndingSuggestionCategory[] = [
  "reflection",
  "exit-ticket",
  "self-assessment",
  "peer-assessment",
  "cool-down",
];

export function LessonEndingAssistant({
  topicId,
  topicName,
  skillId,
  skillName,
  selectedOutcomeIds,
  existingEndingCount,
  onAddEnding,
  onAddEndings,
}: LessonEndingAssistantProps) {
  const [suggestions, setSuggestions] = useState<EndingSuggestion[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(() => new Set());
  const [generatedFromKey, setGeneratedFromKey] = useState("");

  const contextKey = useMemo(
    () =>
      buildEndingContextKey({
        topicId,
        skillId,
        selectedOutcomeIds,
      }),
    [topicId, skillId, selectedOutcomeIds]
  );

  const refresh = useCallback(() => {
    const next = buildLessonEndingSuggestions({
      topicName,
      skillName,
      selectedOutcomeIds,
    });
    setSuggestions(next);
    setAddedIds(new Set());
    setGeneratedFromKey(contextKey);
  }, [topicName, skillName, selectedOutcomeIds, contextKey]);

  useEffect(() => {
    if (generatedFromKey !== contextKey) {
      refresh();
    }
  }, [contextKey, generatedFromKey, refresh]);

  const grouped = useMemo(() => groupEndingSuggestions(suggestions), [suggestions]);

  const handleAddOne = (suggestion: EndingSuggestion, orderOffset: number) => {
    onAddEnding(endingSuggestionToComponent(suggestion, existingEndingCount + orderOffset));
    setAddedIds((prev) => new Set(prev).add(suggestion.id));
  };

  const handleApplyAll = () => {
    const endings = suggestions.map((suggestion, index) =>
      endingSuggestionToComponent(suggestion, existingEndingCount + index)
    );
    onAddEndings(endings);
    setAddedIds(new Set(suggestions.map((s) => s.id)));
  };

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="border-b border-slate-100 bg-violet-50/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-900">
          {PLANNING_COACH.endingTitle}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Curriculum guidance for closing {topicName || "your lesson"}
          {skillName ? ` · ${skillName}` : ""}.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3">
        <Button type="button" variant="secondary" className="text-xs" onClick={refresh}>
          {PLANNING_COACH.refreshEndings}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="text-xs"
          onClick={handleApplyAll}
          disabled={suggestions.length === 0}
        >
          {PLANNING_COACH.applyAllEndings}
        </Button>
      </div>

      <div className="max-h-[min(50vh,520px)] space-y-4 overflow-y-auto p-4">
        {CATEGORY_ORDER.map((category) => {
          const items = grouped[category];
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {getEndingCategoryLabel(category)}
              </p>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <PlanningCoachCard
                    key={item.id}
                    badge={item.badge}
                    tone="purple"
                    title={item.text}
                    footer={item.title}
                    used={addedIds.has(item.id)}
                    onClick={() => handleAddOne(item, index)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
