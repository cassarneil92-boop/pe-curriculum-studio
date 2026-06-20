"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldGroup, Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import {
  SUGGESTED_PROMPT_CHIPS,
  type AssistantResponse,
} from "@/lib/assistant";
import { queryCurriculumAssistant } from "@/src/lib/intelligence/assistant/curriculum-assistant";

function ContextCard({ response }: { response: AssistantResponse }) {
  const ctx = response.detectedContext;
  if (!ctx) return null;

  return (
    <Card className="border-teal-100/80 bg-teal-50/30">
      <CardHeader title="Detected context" description="Parsed from your question using curriculum rules." />
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Intent</dt>
          <dd className="font-medium text-slate-800">{ctx.intent}</dd>
        </div>
        {ctx.yearGroup && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Year group</dt>
            <dd className="font-medium text-slate-800">{ctx.yearGroup}</dd>
          </div>
        )}
        {ctx.pathways && ctx.pathways.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Pathway</dt>
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
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Topic</dt>
            <dd className="font-medium text-slate-800">{ctx.topic}</dd>
          </div>
        )}
        {ctx.lessonCount && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Lessons</dt>
            <dd className="font-medium text-slate-800">{ctx.lessonCount}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
}

function MatchesCard({ response }: { response: AssistantResponse }) {
  if (!response.matches?.length) return null;

  return (
    <Card>
      <CardHeader
        title="Curriculum matches"
        description="Official outcomes from your imported curriculum data."
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

function SequenceCard({ response }: { response: AssistantResponse }) {
  if (!response.planningSequence?.length) return null;

  return (
    <Card>
      <CardHeader
        title="Suggested planning sequence"
        description={
          response.suggestedTitle
            ? `Draft preview for "${response.suggestedTitle}" (${response.suggestedLessonCount ?? response.planningSequence.length} lessons)`
            : "Advisory lesson structure — adapt to your class needs."
        }
      />
      <ol className="space-y-3">
        {response.planningSequence.map((step) => (
          <li
            key={step.lessonNumber}
            className="rounded-xl border border-slate-100 px-4 py-3 text-sm"
          >
            <p className="font-semibold text-slate-900">
              Lesson {step.lessonNumber}: {step.focus}
            </p>
            <p className="mt-1 text-slate-600">Activity: {step.activity}</p>
            {step.waltExample && (
              <p className="mt-1 text-xs text-slate-500">WALT example: {step.waltExample}</p>
            )}
          </li>
        ))}
      </ol>
      {response.waltExamples && response.waltExamples.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            WALT examples
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {response.waltExamples.slice(0, 3).map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      )}
      {response.successCriteria && response.successCriteria.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Success criteria (WILF)
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {response.successCriteria.map((c) => (
              <li key={c}>• {c}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function PartialMatchCard({ response }: { response: AssistantResponse }) {
  if (!response.partialMatch) return null;

  return (
    <Card className="border-amber-100 bg-amber-50/30">
      <CardHeader title="Related areas" description="Try one of these refined prompts." />
      <div className="space-y-4 text-sm">
        {response.relatedTopics && response.relatedTopics.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Closest topics
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {response.relatedTopics.map((t) => (
                <Badge key={t} tone="amber">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {response.relatedPathways && response.relatedPathways.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your pathways
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {response.relatedPathways.map((p) => (
                <Badge key={p} tone="slate">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function CurriculumAssistantPage() {
  const { data } = useApp();
  const { context } = useTeacherContext();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<AssistantResponse | null>(null);

  const activeScheme = data.schemes[0];

  function handleAsk(example?: string) {
    const q = example ?? prompt;
    if (!q.trim()) return;
    const result = queryCurriculumAssistant(q, {
      teacherContext: context,
      lessons: data.lessons,
      schemes: data.schemes,
      calendar: data.calendar,
      activeScheme,
    });
    setResponse(result);
    if (example) setPrompt(example);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        eyebrow="Planning tools"
        title="Planning Assistant"
        description="Ask in everyday language — year groups, pathways, sports and schemes are interpreted from official curriculum data."
      />

      <p className="rounded-[20px] border border-blue-100/80 bg-blue-50/50 px-4 py-3 text-sm leading-relaxed text-blue-900">
        Rule-based curriculum intelligence only. Official learning outcomes always come from your
        curriculum database — the assistant never invents syllabus wording.
      </p>

      <Card>
        <FieldGroup label="What would you like to plan?">
          <div className="flex gap-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "Create a SOW for my Form 5 ALP students on Basketball"'
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            />
            <Button onClick={() => handleAsk()}>Ask</Button>
          </div>
        </FieldGroup>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTED_PROMPT_CHIPS.map((ex) => (
            <Button key={ex} variant="ghost" className="text-xs" onClick={() => handleAsk(ex)}>
              {ex}
            </Button>
          ))}
        </div>
      </Card>

      {response && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Response" />
            <p className="text-sm leading-relaxed text-slate-800">{response.answer}</p>
          </Card>

          <ContextCard response={response} />
          <PartialMatchCard response={response} />
          <MatchesCard response={response} />
          <SequenceCard response={response} />

          {response.actions && response.actions.length > 0 && (
            <Card>
              <CardHeader title="Next steps" />
              <div className="flex flex-wrap gap-2">
                {response.actions.map((action) => (
                  <Link key={action.href + action.label} href={action.href}>
                    <Button variant={action.variant === "primary" ? "primary" : "secondary"}>
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {response.suggestions.length > 0 && (
            <Card>
              <CardHeader title="Suggested follow-ups" />
              <ul className="space-y-2">
                {response.suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="text-left text-sm text-teal-700 hover:text-teal-900"
                      onClick={() => handleAsk(s)}
                    >
                      → {s}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
