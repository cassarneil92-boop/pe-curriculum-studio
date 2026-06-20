"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SOWPlanningCard } from "@/components/scheme-builder/SOWPlanningCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  appendAllToFields,
  appendToField,
  buildLearningDesignSuggestions,
  flattenSuggestions,
  LEARNING_DESIGN_FIELD_LABELS,
  type DesignSuggestion,
  type LearningDesignField,
  type LearningDesignSuggestionSet,
} from "@/lib/lesson-builder/learning-design-suggestions";
import { getPathwayLabel } from "@/lib/constants";
import type { PathwayId } from "@/lib/types";

type CardTone = "teal" | "blue" | "purple" | "amber" | "green";

const FIELD_TONES: Record<LearningDesignField, CardTone> = {
  learningIntention: "teal",
  walt: "blue",
  successCriteria: "purple",
  safetyConsiderations: "amber",
  assessmentNotes: "green",
};

interface FieldValues {
  learningIntention: string;
  walt: string;
  successCriteria: string;
  safetyConsiderations: string;
  assessmentNotes: string;
}

interface LearningDesignAssistantProps {
  selectedOutcomeIds: string[];
  topicId: string;
  skillId: string;
  topicName: string;
  skillName: string;
  yearGroupLabel: string;
  appPathways: PathwayId[];
  fieldValues: FieldValues;
  onFieldsChange: (patch: Partial<FieldValues>) => void;
}

function SuggestionSection({
  title,
  items,
  insertedIds,
  onInsert,
}: {
  title: string;
  items: DesignSuggestion[];
  insertedIds: Set<string>;
  onInsert: (suggestion: DesignSuggestion) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <SOWPlanningCard
            key={item.id}
            tone={FIELD_TONES[item.field]}
            title={item.text}
            footer={item.sourceLabel}
            used={insertedIds.has(item.id)}
            onClick={() => onInsert(item)}
          />
        ))}
      </div>
    </div>
  );
}

export function LearningDesignAssistant({
  selectedOutcomeIds,
  topicId,
  skillId,
  topicName,
  skillName,
  yearGroupLabel,
  appPathways,
  fieldValues,
  onFieldsChange,
}: LearningDesignAssistantProps) {
  const [suggestions, setSuggestions] = useState<LearningDesignSuggestionSet | null>(null);
  const [insertedIds, setInsertedIds] = useState<Set<string>>(() => new Set());
  const [userCleared, setUserCleared] = useState(false);

  const hasOutcomes = selectedOutcomeIds.length > 0;
  const outcomeKey = useMemo(
    () => [...selectedOutcomeIds].sort().join("\0"),
    [selectedOutcomeIds]
  );

  const generate = useCallback(() => {
    if (!hasOutcomes) {
      setSuggestions(null);
      return;
    }
    setSuggestions(
      buildLearningDesignSuggestions({
        selectedOutcomeIds,
        topicId,
        skillId,
      })
    );
    setInsertedIds(new Set());
    setUserCleared(false);
  }, [hasOutcomes, selectedOutcomeIds, topicId, skillId]);

  useEffect(() => {
    setUserCleared(false);
  }, [outcomeKey]);

  useEffect(() => {
    if (!hasOutcomes) {
      setSuggestions(null);
      setInsertedIds(new Set());
      setUserCleared(false);
      return;
    }
    if (!userCleared) {
      setSuggestions(
        buildLearningDesignSuggestions({
          selectedOutcomeIds,
          topicId,
          skillId,
        })
      );
      setInsertedIds(new Set());
    }
  }, [hasOutcomes, outcomeKey, topicId, skillId, userCleared, selectedOutcomeIds]);

  const flatSuggestions = useMemo(
    () => (suggestions ? flattenSuggestions(suggestions) : []),
    [suggestions]
  );

  const handleInsert = (suggestion: DesignSuggestion) => {
    onFieldsChange({
      [suggestion.field]: appendToField(fieldValues[suggestion.field], suggestion.text),
    });
    setInsertedIds((prev) => new Set(prev).add(suggestion.id));
  };

  const handleInsertAll = () => {
    if (!suggestions) return;
    const merged = appendAllToFields(fieldValues, flatSuggestions);
    onFieldsChange(merged);
    setInsertedIds(new Set(flatSuggestions.map((s) => s.id)));
  };

  const handleClearSuggestions = () => {
    setSuggestions(null);
    setInsertedIds(new Set());
    setUserCleared(true);
  };

  if (!hasOutcomes) {
    return (
      <Card className="text-center">
        <CardHeader title="Planning assistant" />
        <p className="text-sm text-slate-600">
          Select curriculum outcomes first to unlock learning design suggestions.
        </p>
      </Card>
    );
  }

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="border-b border-slate-100 bg-teal-50/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
          Planning assistant
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Click a card to insert — wording is adapted from your selected outcomes, not official
          syllabus text.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-500">
          {topicName && <span>{topicName}</span>}
          {skillName && <span>· {skillName}</span>}
          {yearGroupLabel && <span>· {yearGroupLabel}</span>}
        </div>
        {appPathways.length > 0 && (
          <p className="mt-1 text-[11px] text-slate-500">
            {appPathways.map((p) => getPathwayLabel(p)).join(" · ")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3">
        <Button type="button" variant="secondary" className="text-xs" onClick={generate}>
          Generate from outcomes
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="text-xs"
          onClick={handleInsertAll}
          disabled={flatSuggestions.length === 0}
        >
          Insert all
        </Button>
        <Button type="button" variant="ghost" className="text-xs" onClick={handleClearSuggestions}>
          Clear suggestions
        </Button>
      </div>

      <div className="max-h-[min(62vh,640px)] space-y-4 overflow-y-auto p-4">
        {!suggestions ? (
          <p className="text-sm text-slate-500">
            Click &quot;Generate from outcomes&quot; to build suggestion cards.
          </p>
        ) : (
          <>
            <SuggestionSection
              title={LEARNING_DESIGN_FIELD_LABELS.learningIntention}
              items={suggestions.learningIntentions}
              insertedIds={insertedIds}
              onInsert={handleInsert}
            />
            <SuggestionSection
              title={LEARNING_DESIGN_FIELD_LABELS.walt}
              items={suggestions.walt}
              insertedIds={insertedIds}
              onInsert={handleInsert}
            />
            <SuggestionSection
              title={LEARNING_DESIGN_FIELD_LABELS.successCriteria}
              items={suggestions.successCriteria}
              insertedIds={insertedIds}
              onInsert={handleInsert}
            />
            <SuggestionSection
              title={LEARNING_DESIGN_FIELD_LABELS.safetyConsiderations}
              items={suggestions.safety}
              insertedIds={insertedIds}
              onInsert={handleInsert}
            />
            <SuggestionSection
              title={LEARNING_DESIGN_FIELD_LABELS.assessmentNotes}
              items={suggestions.assessment}
              insertedIds={insertedIds}
              onInsert={handleInsert}
            />
          </>
        )}
      </div>
    </Card>
  );
}
