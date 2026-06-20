"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlanningCoachCard } from "@/components/lesson-builder/PlanningCoachCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  activitySuggestionToLessonActivity,
  buildActivityContextKey,
  buildActivitySuggestions,
  type ActivitySuggestion,
} from "@/lib/lesson-builder/activity-suggestions";
import { PLANNING_COACH } from "@/lib/lesson-builder/planning-coach-labels";
import { getPathwayLabel } from "@/lib/constants";
import type { LessonActivity, PathwayId } from "@/lib/types";

interface ActivityPlanningAssistantProps {
  topicId: string;
  topicName: string;
  skillId: string;
  skillName: string;
  yearGroupLabel: string;
  roleLabel: string;
  appPathways: PathwayId[];
  selectedOutcomeIds: string[];
  lessonDuration: number;
  existingActivityCount: number;
  onAddActivity: (activity: LessonActivity) => void;
  onAddActivities: (activities: LessonActivity[]) => void;
}

export function ActivityPlanningAssistant({
  topicId,
  topicName,
  skillId,
  skillName,
  yearGroupLabel,
  roleLabel,
  appPathways,
  selectedOutcomeIds,
  lessonDuration,
  existingActivityCount,
  onAddActivity,
  onAddActivities,
}: ActivityPlanningAssistantProps) {
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(() => new Set());
  const [generatedFromKey, setGeneratedFromKey] = useState("");

  const contextKey = useMemo(
    () =>
      buildActivityContextKey({
        topicId,
        skillId,
        selectedOutcomeIds,
        lessonDuration,
        roleLabel,
      }),
    [topicId, skillId, selectedOutcomeIds, lessonDuration, roleLabel]
  );

  const contextChanged = Boolean(suggestions.length > 0 && generatedFromKey && generatedFromKey !== contextKey);

  const refresh = useCallback(() => {
    if (!topicId) {
      setSuggestions([]);
      return;
    }
    const next = buildActivitySuggestions({
      topicId,
      topicName,
      skillId,
      skillName,
      yearGroupLabel,
      roleLabel,
      selectedOutcomeIds,
      lessonDuration,
    });
    setSuggestions(next);
    setAddedIds(new Set());
    setGeneratedFromKey(contextKey);
  }, [
    topicId,
    topicName,
    skillId,
    skillName,
    yearGroupLabel,
    roleLabel,
    selectedOutcomeIds,
    lessonDuration,
    contextKey,
  ]);

  useEffect(() => {
    if (topicId && generatedFromKey !== contextKey) {
      refresh();
    }
  }, [topicId, contextKey, generatedFromKey, refresh]);

  const handleAddOne = (suggestion: ActivitySuggestion, index: number) => {
    onAddActivity(
      activitySuggestionToLessonActivity(suggestion, existingActivityCount + index + 1)
    );
    setAddedIds((prev) => new Set(prev).add(suggestion.id));
  };

  const handleAddBlock = (blockType: ActivitySuggestion["blockType"]) => {
    const match = suggestions.find((s) => s.blockType === blockType);
    if (!match) return;
    handleAddOne(match, 0);
  };

  const handleApplySequence = () => {
    const activities = suggestions.map((suggestion, index) =>
      activitySuggestionToLessonActivity(suggestion, existingActivityCount + index + 1)
    );
    onAddActivities(activities);
    setAddedIds(new Set(suggestions.map((s) => s.id)));
  };

  if (!topicId) {
    return (
      <Card className="text-center">
        <CardHeader title={PLANNING_COACH.activitiesTitle} />
        <p className="text-sm text-slate-600">
          Set a curriculum topic and skill focus to unlock recommended activity blocks.
        </p>
      </Card>
    );
  }

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="border-b border-slate-100 bg-blue-50/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">
          {PLANNING_COACH.activitiesTitle}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Recommended activity sequence for {topicName}
          {skillName ? ` · ${skillName}` : ""} — {yearGroupLabel}
        </p>
        {appPathways.length > 0 && (
          <p className="mt-1 text-[11px] text-slate-500">
            {appPathways.map((p) => getPathwayLabel(p)).join(" · ")} · {roleLabel}
          </p>
        )}
        {contextChanged && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50/80 px-2 py-1.5 text-xs text-amber-900">
            {PLANNING_COACH.contextChanged}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3">
        <Button type="button" variant="secondary" className="text-xs" onClick={refresh}>
          {PLANNING_COACH.refreshActivities}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="text-xs"
          onClick={handleApplySequence}
          disabled={suggestions.length === 0}
        >
          {PLANNING_COACH.applySequence}
        </Button>
      </div>

      <div className="max-h-[min(62vh,640px)] space-y-3 overflow-y-auto p-4">
        {suggestions.map((suggestion, index) => (
          <div key={suggestion.id} className="rounded-xl border border-slate-100 bg-white p-3">
            <PlanningCoachCard
              badge={suggestion.badge}
              tone="blue"
              title={suggestion.name}
              subtitle={suggestion.purpose}
              footer={`${suggestion.durationMinutes} mins · ${suggestion.equipment}`}
              used={addedIds.has(suggestion.id)}
              onClick={() => handleAddOne(suggestion, index)}
            />
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              <p>
                <span className="font-medium text-slate-700">Progression:</span>{" "}
                {suggestion.progression}
              </p>
              <p>
                <span className="font-medium text-slate-700">Differentiation:</span>{" "}
                {suggestion.differentiationEasier} / {suggestion.differentiationHarder}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-7 text-[10px]"
                onClick={() => handleAddOne(suggestion, index)}
              >
                {PLANNING_COACH.addActivity}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-7 text-[10px]"
                onClick={() => handleAddBlock(suggestion.blockType)}
              >
                {PLANNING_COACH.addBlock}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
