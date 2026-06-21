"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import type { AssistantResponse } from "@/lib/assistant";

interface AssistantCurriculumAlignmentProps {
  response: AssistantResponse;
}

function ContextDetails({ response }: { response: AssistantResponse }) {
  const ctx = response.detectedContext;
  if (!ctx) return null;

  return (
    <Card className="border-slate-100 bg-slate-50/40">
      <CardHeader title="Parsed from your request" />
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-slate-500">Intent</dt>
          <dd className="font-medium text-slate-800">{ctx.intent}</dd>
        </div>
        {ctx.yearGroup && (
          <div>
            <dt className="text-xs font-medium text-slate-500">Year group</dt>
            <dd className="font-medium text-slate-800">{ctx.yearGroup}</dd>
          </div>
        )}
        {ctx.pathways && ctx.pathways.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-slate-500">Pathway</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {ctx.pathways.map((p) => (
                <Badge key={p} tone="teal">
                  {p}
                </Badge>
              ))}
            </dd>
          </div>
        )}
        {ctx.topic && (
          <div>
            <dt className="text-xs font-medium text-slate-500">Topic</dt>
            <dd className="font-medium text-slate-800">{ctx.topic}</dd>
          </div>
        )}
        {ctx.lessonCount && (
          <div>
            <dt className="text-xs font-medium text-slate-500">Lessons</dt>
            <dd className="font-medium text-slate-800">{ctx.lessonCount}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
}

function MatchesList({ response }: { response: AssistantResponse }) {
  if (!response.matches?.length) return null;

  return (
    <Card>
      <CardHeader
        title="Curriculum outcomes"
        description="Official outcomes linked to this draft."
      />
      <ul className="space-y-3">
        {response.matches.map((match) => (
          <li
            key={match.code}
            className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm"
          >
            <p className="font-semibold text-teal-800">{match.code}</p>
            <p className="mt-1 text-slate-700">{match.description}</p>
            {match.topicLabel && (
              <p className="mt-1 text-xs text-slate-500">{match.topicLabel}</p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function AssistantCurriculumAlignment({ response }: AssistantCurriculumAlignmentProps) {
  const hasMatches = Boolean(response.matches?.length);
  const hasContext = Boolean(response.detectedContext);
  if (!hasMatches && !hasContext) return null;

  return (
    <details className="rounded-[20px] border border-slate-200 bg-white">
      <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
        ▶ Show Curriculum Alignment
        <span className="ml-2 text-xs font-normal text-slate-500">
          Outcomes, pathways, and parsed request details
        </span>
      </summary>
      <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-3">
        {hasContext && <ContextDetails response={response} />}
        {hasMatches && <MatchesList response={response} />}
      </div>
    </details>
  );
}
