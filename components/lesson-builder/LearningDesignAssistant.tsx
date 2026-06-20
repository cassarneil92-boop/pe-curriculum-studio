"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlanningCoachCard } from "@/components/lesson-builder/PlanningCoachCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  appendAllToFields,
  appendToField,
  buildLearningDesignContextKey,
  buildLearningDesignSuggestions,
  flattenSuggestions,
  LEARNING_DESIGN_FIELD_LABELS,
  type DesignSuggestion,
  type LearningDesignField,
  type LearningDesignSuggestionSet,
} from "@/lib/lesson-builder/learning-design-suggestions";
import { PLANNING_COACH } from "@/lib/lesson-builder/planning-coach-labels";
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
  addAllLabel,
  items,
  insertedIds,
  onInsert,
  onAddAll,
}: {
  title: string;
  addAllLabel: string;
  items: DesignSuggestion[];
  insertedIds: Set<string>;
  onInsert: (suggestion: DesignSuggestion) => void;
  onAddAll: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <Button type="button" variant="ghost" className="h-7 shrink-0 px-2 text-[10px]" onClick={onAddAll}>
          {addAllLabel}
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <PlanningCoachCard
            key={item.id}
            badge={item.badge}
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
  const [generatedFromKey, setGeneratedFromKey] = useState("");

  const hasOutcomes = selectedOutcomeIds.length > 0;
  const contextKey = useMemo(
    () =>
      buildLearningDesignContextKey({
        selectedOutcomeIds,
        topicId,
        skillId,
      }),
    [selectedOutcomeIds, topicId, skillId]
  );

  const contextChanged = Boolean(suggestions && generatedFromKey && generatedFromKey !== contextKey);

  const regenerate = useCallback(() => {
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
    setGeneratedFromKey(contextKey);
  }, [hasOutcomes, selectedOutcomeIds, topicId, skillId, contextKey]);

  useEffect(() => {
    if (!hasOutcomes) {
      setSuggestions(null);
      setInsertedIds(new Set());
      setUserCleared(false);
      setGeneratedFromKey("");
      return;
    }
    if (!userCleared && generatedFromKey !== contextKey) {
      setSuggestions(
        buildLearningDesignSuggestions({
          selectedOutcomeIds,
          topicId,
          skillId,
        })
      );
      setInsertedIds(new Set());
      setGeneratedFromKey(contextKey);
    }
  }, [hasOutcomes, contextKey, userCleared, generatedFromKey, selectedOutcomeIds, topicId, skillId]);

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

  const handleAddSection = (items: DesignSuggestion[]) => {
    if (items.length === 0) return;
    const merged = appendAllToFields(fieldValues, items);
    onFieldsChange(merged);
    setInsertedIds((prev) => {
      const next = new Set(prev);
      for (const item of items) next.add(item.id);
      return next;
    });
  };

  const handleApplyAll = () => {
    if (!suggestions) return;
    const merged = appendAllToFields(fieldValues, flatSuggestions);
    onFieldsChange(merged);
    setInsertedIds(new Set(flatSuggestions.map((s) => s.id)));
  };

  const handleDismiss = () => {
    setSuggestions(null);
    setInsertedIds(new Set());
    setUserCleared(true);
    setGeneratedFromKey("");
  };

  if (!hasOutcomes) {
    return (
      <Card className="text-center">
        <CardHeader title={PLANNING_COACH.learningDesignTitle} />
        <p className="text-sm text-slate-600">{PLANNING_COACH.emptyOutcomes}</p>
      </Card>
    );
  }

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="border-b border-slate-100 bg-teal-50/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
          {PLANNING_COACH.learningDesignTitle}
        </p>
        <p className="mt-1 text-sm text-slate-700">{PLANNING_COACH.guidanceHint}</p>
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
        {contextChanged && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50/80 px-2 py-1.5 text-xs text-amber-900">
            {PLANNING_COACH.contextChanged}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3">
        <Button type="button" variant="secondary" className="text-xs" onClick={regenerate}>
          {PLANNING_COACH.refreshGuidance}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="text-xs"
          onClick={handleApplyAll}
          disabled={flatSuggestions.length === 0}
        >
          {PLANNING_COACH.applyAllGuidance}
        </Button>
        <Button type="button" variant="ghost" className="text-xs" onClick={handleDismiss}>
          {PLANNING_COACH.dismissGuidance}
        </Button>
      </div>

      <div className="max-h-[min(62vh,640px)] space-y-4 overflow-y-auto p-4">
        {!suggestions ? (
          <p className="text-sm text-slate-500">{PLANNING_COACH.awaitingGuidance}</p>
        ) : (
          <>
            <SuggestionSection
              title={LEARNING_DESIGN_FIELD_LABELS.learningIntention}
              addAllLabel={PLANNING_COACH.addAllLearningIntentions}
              items={suggestions.learningIntentions}
              insertedIds={insertedIds}
              onInsert={handleInsert}
              onAddAll={() => handleAddSection(suggestions.learningIntentions)}
            />
            <SuggestionSection
              title={LEARNING_DESIGN_FIELD_LABELS.walt}
              addAllLabel={PLANNING_COACH.addAllWalt}
              items={suggestions.walt}
              insertedIds={insertedIds}
              onInsert={handleInsert}
              onAddAll={() => handleAddSection(suggestions.walt)}
            />
            <SuggestionSection
              title={LEARNING_DESIGN_FIELD_LABELS.successCriteria}
              addAllLabel={PLANNING_COACH.addAllWilf}
              items={suggestions.successCriteria}
              insertedIds={insertedIds}
              onInsert={handleInsert}
              onAddAll={() => handleAddSection(suggestions.successCriteria)}
            />
            <SuggestionSection
              title={LEARNING_DESIGN_FIELD_LABELS.safetyConsiderations}
              addAllLabel={PLANNING_COACH.addAllSafety}
              items={suggestions.safety}
              insertedIds={insertedIds}
              onInsert={handleInsert}
              onAddAll={() => handleAddSection(suggestions.safety)}
            />
            <SuggestionSection
              title={LEARNING_DESIGN_FIELD_LABELS.assessmentNotes}
              addAllLabel={PLANNING_COACH.addAllAssessment}
              items={suggestions.assessment}
              insertedIds={insertedIds}
              onInsert={handleInsert}
              onAddAll={() => handleAddSection(suggestions.assessment)}
            />
          </>
        )}
      </div>
    </Card>
  );
}
