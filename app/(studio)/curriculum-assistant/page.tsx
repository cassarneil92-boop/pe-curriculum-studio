"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AssistantCreationPanel } from "@/components/assistant/AssistantCreationPanel";
import { AssistantCurriculumAlignment } from "@/components/assistant/AssistantCurriculumAlignment";
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

function PartialMatchCard({ response }: { response: AssistantResponse }) {
  if (!response.partialMatch) return null;

  return (
    <Card className="border-amber-100 bg-amber-50/30">
      <CardHeader title="Related areas" description="Try one of these refined prompts." />
      {response.relatedTopics && response.relatedTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {response.relatedTopics.map((t) => (
            <Badge key={t} tone="amber">
              {t}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}

function CurriculumQueryPanel({ response }: { response: AssistantResponse }) {
  return (
    <div className="space-y-4">
      <Badge tone="blue">Curriculum query</Badge>
      <Card>
        <CardHeader title="Answer" />
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {response.answer.replace(/\*\*/g, "")}
        </p>
        {response.pedagogySources && response.pedagogySources.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <PedagogySourcesList sources={response.pedagogySources} />
          </div>
        )}
      </Card>
      {response.actions && response.actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {response.actions.map((action) => (
            <Link key={action.href + action.label} href={action.href}>
              <Button variant={action.variant === "primary" ? "primary" : "secondary"}>
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
      <AssistantCurriculumAlignment response={response} />
    </div>
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
    if (!response || !prompt.trim()) return [];
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
        description="Create a lesson or scheme draft and open it directly in the builder."
      />

      <Card>
        <FieldGroup label="What would you like to plan?">
          <div className="flex gap-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "Create a Year 8 football passing lesson"'
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            />
            <Button onClick={() => handleAsk()}>Generate</Button>
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
            <AssistantCreationPanel response={response} />
          ) : (
            <CurriculumQueryPanel response={response} />
          )}
          <PartialMatchCard response={response} />
          {!isCreation && (
            <AssistantSupportingIntelligence
              response={response}
              specialistSuggestions={specialistSuggestions}
              onFollowUp={handleAsk}
            />
          )}
        </div>
      )}
    </div>
  );
}
