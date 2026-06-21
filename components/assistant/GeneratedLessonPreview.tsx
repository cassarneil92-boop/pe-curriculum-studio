"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import type { AssistantResponse } from "@/lib/assistant";
import { getPlanningSkillDisplayName, getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import { getYearGroupLabel } from "@/lib/year-groups";

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

  return (
    <Card className="border-teal-100/80">
      <CardHeader
        title="Generated plan preview"
        description="Editable lesson draft — official outcomes are from your curriculum database."
      />
      <dl className="space-y-4">
        <PreviewRow label="Lesson title">{preview.title}</PreviewRow>
        <PreviewRow label="Year group">{getYearGroupLabel(source.yearGroupId)}</PreviewRow>
        <PreviewRow label="Topic">{topicLabel}</PreviewRow>
        <PreviewRow label="Skill focus">{skillLabel}</PreviewRow>

        {response.matches && response.matches.length > 0 && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Curriculum outcomes
            </dt>
            <dd className="mt-2 space-y-2">
              {response.matches.slice(0, 6).map((match) => (
                <div
                  key={match.code}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm"
                >
                  <p className="font-semibold text-teal-800">{match.code}</p>
                  <p className="mt-0.5 text-slate-700">{match.description}</p>
                </div>
              ))}
            </dd>
          </div>
        )}

        <PreviewRow label="Learning intention">{preview.walt}</PreviewRow>
        <PreviewRow label="WALT">{preview.walt}</PreviewRow>
        <PreviewRow label="WILF / success criteria">{preview.wilf}</PreviewRow>
        <PreviewRow label="Activities">{preview.activities}</PreviewRow>
        <PreviewRow label="Resources">
          {preview.resources.length > 0 ? preview.resources.join(" · ") : undefined}
        </PreviewRow>
        <PreviewRow label="Assessment check">
          Use exit questioning or quick skill check during the main activity.
        </PreviewRow>
        <PreviewRow label="Safety note">
          Check space, equipment and pupil readiness before starting.
        </PreviewRow>
        <PreviewRow label="Reflection / closure">{preview.coolDown}</PreviewRow>

        {preview.pedagogicalApproach && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Suggested approach
            </dt>
            <dd className="mt-1">
              <Badge tone="teal">{preview.pedagogicalApproach}</Badge>
            </dd>
          </div>
        )}
      </dl>
    </Card>
  );
}
