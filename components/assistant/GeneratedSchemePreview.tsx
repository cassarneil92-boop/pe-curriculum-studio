"use client";

import { useMemo } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
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
  const skillLabel = draft.skillId ? getPlanningSkillDisplayName(draft.skillId) : "Per lesson";

  return (
    <Card className="border-teal-100/80">
      <CardHeader
        title="Generated plan preview"
        description="Editable scheme draft — official outcomes are from your curriculum database."
      />
      <dl className="mb-5 grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scheme title</dt>
          <dd className="mt-1 font-medium text-slate-900">{draft.title || "Untitled scheme"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Year group</dt>
          <dd className="mt-1 text-slate-800">{getYearGroupLabel(draft.yearGroup)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topic</dt>
          <dd className="mt-1 text-slate-800">{topicLabel}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lessons</dt>
          <dd className="mt-1 text-slate-800">{draft.lessons.length}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Default skill</dt>
          <dd className="mt-1 text-slate-800">{skillLabel}</dd>
        </div>
      </dl>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-2 pr-3 font-medium">#</th>
              <th className="pb-2 pr-3 font-medium">Focus</th>
              <th className="pb-2 pr-3 font-medium">Outcomes</th>
              <th className="pb-2 pr-3 font-medium">WALT</th>
              <th className="pb-2 pr-3 font-medium">WILF</th>
              <th className="pb-2 pr-3 font-medium">Activity</th>
              <th className="pb-2 font-medium">Resources</th>
            </tr>
          </thead>
          <tbody>
            {draft.lessons.map((lesson, index) => {
              const step = response.planningSequence?.[index];
              const outcomes = resolveSchemeLearningOutcomes(lesson.learningOutcomeIds);
              return (
                <tr key={lesson.lessonNumber} className="border-b border-slate-100 align-top last:border-0">
                  <td className="py-3 pr-3 tabular-nums text-slate-600">{lesson.lessonNumber}</td>
                  <td className="py-3 pr-3 font-medium text-slate-900">
                    {step?.focus ?? `Lesson ${lesson.lessonNumber}`}
                  </td>
                  <td className="py-3 pr-3 text-xs text-slate-700">
                    {outcomes.length > 0
                      ? outcomes.map((o) => o.code).join(", ")
                      : "—"}
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{lesson.walt || step?.waltExample || "—"}</td>
                  <td className="py-3 pr-3 whitespace-pre-wrap text-slate-700">{lesson.wilf || "—"}</td>
                  <td className="py-3 pr-3 whitespace-pre-wrap text-slate-700">
                    {lesson.activities || step?.activity || "—"}
                  </td>
                  <td className="py-3 text-slate-700">
                    {lesson.resources.length > 0 ? lesson.resources.join(", ") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
