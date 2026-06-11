"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldGroup, Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { queryCurriculumAssistant } from "@/src/lib/intelligence/assistant/curriculum-assistant";

const EXAMPLE_PROMPTS = [
  "OR9.11",
  "Suggest TGfU activities for invasion games",
  "Show missing outcomes in this scheme",
  "Volleyball Year 9 outcomes",
  "What is my curriculum coverage?",
];

export default function CurriculumAssistantPage() {
  const { data } = useApp();
  const { context } = useTeacherContext();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<ReturnType<typeof queryCurriculumAssistant> | null>(
    null
  );

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
    <div>
      <PageHeader
        title="Curriculum Assistant"
        description="Curriculum-aware guidance using official Maltese PE data. Advisory only — never auto-modifies your plans."
      />

      <p className="mb-6 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-900">
        This assistant queries your curriculum database first. It does not invent learning outcomes
        or change official wording. External AI can be added later — architecture is ready.
      </p>

      <Card className="mb-6">
        <FieldGroup label="Ask about the curriculum">
          <div className="flex gap-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "Create a Year 9 Volleyball lesson aligned to OR9.11"'
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            />
            <Button onClick={() => handleAsk()}>Ask</Button>
          </div>
        </FieldGroup>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((ex) => (
            <Button key={ex} variant="ghost" className="text-xs" onClick={() => handleAsk(ex)}>
              {ex}
            </Button>
          ))}
        </div>
      </Card>

      {response && (
        <Card>
          <CardHeader title="Response" />
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-800">
            {response.answer.split("**").map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i}>{part}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
          {(response.relatedOutcomeCodes.length > 0 || response.relatedTopicIds.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {response.relatedOutcomeCodes.map((code) => (
                <Badge key={code} tone="teal">
                  {code}
                </Badge>
              ))}
              {response.relatedTopicIds.map((topic) => (
                <Badge key={topic} tone="slate">
                  {topic}
                </Badge>
              ))}
            </div>
          )}
          {response.suggestions.length > 0 && (
            <ul className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-sm text-slate-600">
              {response.suggestions.map((s) => (
                <li key={s}>→ {s}</li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
