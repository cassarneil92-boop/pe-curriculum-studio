"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AssistantSchemeDraftActions } from "@/components/assistant/AssistantSchemeDraftActions";
import { AssistantLessonDraftActions } from "@/components/assistant/AssistantLessonDraftActions";
import { PedagogySuggestionList } from "@/components/pe-knowledge/PedagogySuggestionList";
import { PedagogySourcesList } from "@/components/education/PedagogyInsightCard";
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
import { getPlanningAssistantKnowledgeSuggestions } from "@/src/lib/peKnowledge/coaching";
import type { PathwayId } from "@/lib/types";

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

function LessonPreviewCard({ response }: { response: AssistantResponse }) {
  const preview = response.lessonPreview;
  if (!preview) return null;

  return (
    <Card>
      <CardHeader
        title="Lesson preview"
        description={preview.title}
      />
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">WALT</dt>
          <dd className="mt-1 text-slate-800">{preview.walt}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">WILF</dt>
          <dd className="mt-1 whitespace-pre-wrap text-slate-800">{preview.wilf}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Warm up</dt>
          <dd className="mt-1 text-slate-700">{preview.warmUp}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Main activity</dt>
          <dd className="mt-1 text-slate-700">{preview.mainActivity}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cool down / reflection</dt>
          <dd className="mt-1 text-slate-700">{preview.coolDown}</dd>
        </div>
        {preview.resources.length > 0 && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resources</dt>
            <dd className="mt-1 text-slate-700">{preview.resources.join(" · ")}</dd>
          </div>
        )}
        {preview.pedagogicalApproach && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pedagogical approach</dt>
            <dd className="mt-1 text-teal-800">{preview.pedagogicalApproach}</dd>
          </div>
        )}
      </dl>
      <AssistantLessonDraftActions response={response} />
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
            {step.sportPhase && step.sportPhase !== step.focus && (
              <p className="mt-1 text-xs text-teal-700">Sport phase: {step.sportPhase}</p>
            )}
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
      <AssistantSchemeDraftActions response={response} />
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

  const specialistSuggestions = useMemo(() => {
    if (!response && !prompt.trim()) return [];
    return getPlanningAssistantKnowledgeSuggestions(prompt, response, {
      yearGroup: context.teacher.yearGroups[0],
      pathway: context.visibleAppPathways[0] as PathwayId | undefined,
    }).slice(0, 5);
  }, [prompt, response, context.teacher.yearGroups, context.visibleAppPathways]);

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
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{response.answer}</p>
            {response.pedagogySources && response.pedagogySources.length > 0 && (
              <PedagogySourcesList sources={response.pedagogySources} />
            )}
          </Card>

          {response.pedagogyRecommendations && response.pedagogyRecommendations.length > 0 && (
            <Card className="border-teal-100 bg-teal-50/20">
              <CardHeader
                title="Recommended pedagogical approaches"
                description="Based on your topic, skill and year group from the Educational Knowledge Library."
              />
              <ul className="space-y-2">
                {response.pedagogyRecommendations.map((rec) => (
                  <li
                    key={rec.id}
                    className="rounded-xl border border-teal-100 bg-white/80 px-4 py-3 text-sm"
                  >
                    <p className="font-semibold text-teal-900">{rec.name}</p>
                    <p className="mt-1 text-slate-600">{rec.reason}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <ContextCard response={response} />

          {(specialistSuggestions.length > 0 || response) && (
            <PedagogySuggestionList suggestions={specialistSuggestions} />
          )}

          <PartialMatchCard response={response} />
          <MatchesCard response={response} />
          <LessonPreviewCard response={response} />
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
