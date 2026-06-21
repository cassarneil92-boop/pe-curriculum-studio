"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PATHWAYS } from "@/lib/constants";
import type { AssistantResponse } from "@/lib/assistant";
import { getPlanningSkillDisplayName, getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import { getYearGroupLabel } from "@/lib/year-groups";
import { resolveLearningOutcomeById } from "@/src/lib/curriculum/metadata";

interface GeneratedLessonPreviewProps {
  response: AssistantResponse;
}

function PreviewRow({ label, children }: { label: string; children: ReactNode }) {
  if (!children || (typeof children === "string" && !children.trim())) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{children}</dd>
    </div>
  );
}

export function GeneratedLessonPreview({ response }: GeneratedLessonPreviewProps) {
  const preview = response.lessonPreview;
  const source = response.lessonDraftSource;
  if (!preview || !source) return null;

  const topicLabel = getPlanningTopicDisplayName(source.topicId);
  const skillLabel = source.skillId ? getPlanningSkillDisplayName(source.skillId) : "—";
  const pathwayLabels = source.appPathways.map(
    (id) => PATHWAYS.find((p) => p.id === id)?.label ?? id
  );
  const outcomes = source.outcomeIds
    .map((id) => resolveLearningOutcomeById(id))
    .filter(Boolean);

  return (
    <Card className="border-teal-100/80">
      <CardHeader title="Generated lesson draft" description="All fields pre-fill when you open Lesson Builder." />
      <dl className="space-y-4">
        <PreviewRow label="Title">{preview.title}</PreviewRow>
        <PreviewRow label="Year group">{getYearGroupLabel(source.yearGroupId)}</PreviewRow>
        <PreviewRow label="Pathway">{pathwayLabels.join(" · ")}</PreviewRow>
        <PreviewRow label="Topic">{topicLabel}</PreviewRow>
        <PreviewRow label="Skill focus">{skillLabel}</PreviewRow>

        {outcomes.length > 0 && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Learning outcomes
            </dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {outcomes.map((o) => (
                <Badge key={o!.id} tone="teal">
                  {o!.code}
                </Badge>
              ))}
            </dd>
          </div>
        )}

        <PreviewRow label="WALT">{preview.walt}</PreviewRow>
        <PreviewRow label="WILF">{preview.wilf}</PreviewRow>
        <PreviewRow label="Activities">{preview.activities}</PreviewRow>
        <PreviewRow label="Resources">
          {preview.resources.length > 0 ? preview.resources.join(" · ") : undefined}
        </PreviewRow>
        <PreviewRow label="Assessment">{preview.assessmentNotes}</PreviewRow>
        <PreviewRow label="Reflection prompt">{preview.reflectionPrompt}</PreviewRow>
      </dl>
    </Card>
  );
}
