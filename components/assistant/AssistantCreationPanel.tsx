"use client";

import { AssistantLessonDraftActions } from "@/components/assistant/AssistantLessonDraftActions";
import { AssistantSchemeDraftActions } from "@/components/assistant/AssistantSchemeDraftActions";
import { AssistantCurriculumAlignment } from "@/components/assistant/AssistantCurriculumAlignment";
import { GeneratedLessonPreview } from "@/components/assistant/GeneratedLessonPreview";
import { GeneratedSchemePreview } from "@/components/assistant/GeneratedSchemePreview";
import { Badge } from "@/components/ui/Badge";
import type { AssistantResponse } from "@/lib/assistant";
import {
  getAssistantOutputMode,
  isLessonCreationResponse,
} from "@/lib/assistant/creation-detection";

interface AssistantCreationPanelProps {
  response: AssistantResponse;
}

export function AssistantCreationPanel({ response }: AssistantCreationPanelProps) {
  const mode = getAssistantOutputMode(response);
  const isLesson = isLessonCreationResponse(response);

  if (mode !== "lesson-draft" && mode !== "scheme-draft") return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="teal">{isLesson ? "Lesson draft" : "Scheme draft"}</Badge>
        <span className="text-sm text-slate-600">Ready to open in the builder — no copy and paste needed.</span>
      </div>

      {isLesson ? <GeneratedLessonPreview response={response} /> : <GeneratedSchemePreview response={response} />}

      {isLesson ? (
        <AssistantLessonDraftActions response={response} />
      ) : (
        <AssistantSchemeDraftActions response={response} />
      )}

      <p className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm leading-relaxed text-slate-700">
        {response.answer.replace(/\*\*/g, "")}
      </p>

      <AssistantCurriculumAlignment response={response} />
    </div>
  );
}
