"use client";

import { useMemo, useState } from "react";
import { AssistantCreationPanel } from "@/components/assistant/AssistantCreationPanel";
import { AssistantSupportingIntelligence } from "@/components/assistant/AssistantSupportingIntelligence";
import { PedagogySourcesList } from "@/components/education/PedagogyInsightCard";
import { useApp } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldGroup, Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import {
  DEFAULT_PROMPT_CHIPS,
  MORE_PROMPT_CHIPS,
  type AssistantResponse,
} from "@/lib/assistant";
import { isCreationAssistantResponse } from "@/lib/assistant/creation-detection";
import { queryCurriculumAssistant } from "@/src/lib/intelligence/assistant/curriculum-assistant";
import { getPlanningAssistantKnowledgeSuggestions } from "@/src/lib/peKnowledge/coaching";
import type { PathwayId } from "@/lib/types";

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

function ContextCard({ response }: { response: AssistantResponse }) {
  const ctx = response.detectedContext;
  if (!ctx) return null;

  return (
    <Card className="border-slate-100 bg-slate-50/40">
      <CardHeader title="Detected context" description="Parsed from your question." />
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
      </div>
    </Card>
  );
}

function GeneralResponseCard({ response }: { response: AssistantResponse }) {
  return (
    <Card>
      <CardHeader title="Response" />
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
        {response.answer.replace(/\*\*/g, "")}
      </p>
      {response.pedagogySources && response.pedagogySources.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <PedagogySourcesList sources={response.pedagogySources} />
        </div>
      )}
    </Card>
  );
}

export default function CurriculumAssistantPage() {
  const { data } = useApp();
  const { context } = useTeacherContext();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [showMoreExamples, setShowMoreExamples] = useState(false);

  const activeScheme = data.schemes[0];

  const specialistSuggestions = useMemo(() => {
    if (!response && !prompt.trim()) return [];
    return getPlanningAssistantKnowledgeSuggestions(prompt, response, {
      yearGroup: context.teacher.yearGroups[0],
      pathway: context.visibleAppPathways[0] as PathwayId | undefined,
    }).slice(0, 5);
  }, [prompt, response, context.teacher.yearGroups, context.visibleAppPathways]);

  const isCreation = response ? isCreationAssistantResponse(response) : false;

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
        description="Ask to create a lesson or scheme — get an editable draft you can save and open in the builder."
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
              placeholder='e.g. "Create a Year 8 football passing lesson"'
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            />
            <Button onClick={() => handleAsk()}>Ask</Button>
          </div>
        </FieldGroup>
        <div className="mt-4 flex flex-wrap gap-2">
          {DEFAULT_PROMPT_CHIPS.map((ex) => (
            <Button key={ex} variant="ghost" className="text-xs" onClick={() => handleAsk(ex)}>
              {ex}
            </Button>
          ))}
          {!showMoreExamples ? (
            <Button
              variant="ghost"
              className="text-xs text-slate-500"
              onClick={() => setShowMoreExamples(true)}
            >
              More examples
            </Button>
          ) : (
            MORE_PROMPT_CHIPS.map((ex) => (
              <Button key={ex} variant="ghost" className="text-xs" onClick={() => handleAsk(ex)}>
                {ex}
              </Button>
            ))
          )}
        </div>
      </Card>

      {response && (
        <div className="space-y-4">
          {isCreation ? (
            <>
              <AssistantCreationPanel response={response} />
              <AssistantSupportingIntelligence
                response={response}
                specialistSuggestions={specialistSuggestions}
                onFollowUp={handleAsk}
                matchesSlot={<MatchesCard response={response} />}
                contextSlot={<ContextCard response={response} />}
              />
            </>
          ) : (
            <>
              <GeneralResponseCard response={response} />
              <PartialMatchCard response={response} />
              <AssistantSupportingIntelligence
                response={response}
                specialistSuggestions={specialistSuggestions}
                onFollowUp={handleAsk}
                matchesSlot={<MatchesCard response={response} />}
                contextSlot={<ContextCard response={response} />}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
