"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PATHWAYS } from "@/lib/constants";
import { buildAssistantSchemeDraft, type AssistantResponse } from "@/lib/assistant";
import { getPlanningSkillDisplayName, getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import { getYearGroupLabel } from "@/lib/year-groups";
import { resolveSchemeLearningOutcomes } from "@/lib/scheme-builder/helpers";

interface GeneratedSchemePreviewProps {
  response: AssistantResponse;
}

export function GeneratedSchemePreview({ response }: GeneratedSchemePreviewProps) {
  const draftResult = useMemo(() => {
    if (!response.schemeDraftSource || !response.planningSequence?.length) return null;
    return buildAssistantSchemeDraft(response.schemeDraftSource, response);
  }, [response]);

  if (!draftResult) return null;

  const { draft } = draftResult;
  const topicLabel = getPlanningTopicDisplayName(draft.topicId);
  const pathwayLabels = (draft.selectedPathways ?? []).map(
    (id) => PATHWAYS.find((p) => p.id === id)?.label ?? id
  );
  const allOutcomeIds = [...new Set(draft.lessons.flatMap((l) => l.learningOutcomeIds))];
  const outcomes = resolveSchemeLearningOutcomes(allOutcomeIds);

  return (
    <Card className="border-teal-100/80">
      <CardHeader
        title="Generated scheme draft"
        description="All fields pre-fill when you open Scheme Builder."
      />
      <dl className="mb-5 grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scheme title</dt>
          <dd className="mt-1 font-medium text-slate-900">{draft.title || "Untitled scheme"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lessons</dt>
          <dd className="mt-1 text-slate-800">{draft.lessons.length}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Year group</dt>
          <dd className="mt-1 text-slate-800">{getYearGroupLabel(draft.yearGroup)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topic</dt>
          <dd className="mt-1 text-slate-800">{topicLabel}</dd>
        </div>
        {pathwayLabels.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pathway</dt>
            <dd className="mt-1 text-slate-800">{pathwayLabels.join(" · ")}</dd>
          </div>
        )}
      </dl>

      {outcomes.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Intended outcomes</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {outcomes.slice(0, 12).map((o) => (
              <Badge key={o.id} tone="teal">
                {o.code}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Lesson sequence</p>
      <ul className="space-y-3">
        {draft.lessons.map((lesson, index) => {
          const step = response.planningSequence?.[index];
          return (
            <li
              key={lesson.lessonNumber}
              className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm"
            >
              <p className="font-medium text-slate-900">
                Lesson {lesson.lessonNumber}: {step?.focus ?? `Lesson ${lesson.lessonNumber}`}
              </p>
              {lesson.walt && <p className="mt-1 text-slate-700">WALT: {lesson.walt}</p>}
              {lesson.resources.length > 0 && (
                <p className="mt-1 text-slate-600">Resources: {lesson.resources.join(", ")}</p>
              )}
              {lesson.activities && (
                <p className="mt-1 whitespace-pre-wrap text-slate-600">
                  {lesson.activities.length > 200
                    ? `${lesson.activities.slice(0, 200)}…`
                    : lesson.activities}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-sm text-slate-600">
        Assessment opportunities are built into each lesson&apos;s WILF and main activity structure.
      </p>
    </Card>
  );
}
