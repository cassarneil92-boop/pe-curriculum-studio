"use client";

import { AssistantLessonDraftActions } from "@/components/assistant/AssistantLessonDraftActions";
import { AssistantSchemeDraftActions } from "@/components/assistant/AssistantSchemeDraftActions";
import { GeneratedLessonPreview } from "@/components/assistant/GeneratedLessonPreview";
import { GeneratedSchemePreview } from "@/components/assistant/GeneratedSchemePreview";
import { Card } from "@/components/ui/Card";
import type { AssistantResponse } from "@/lib/assistant";
import {
  isLessonCreationResponse,
  isSchemeCreationResponse,
} from "@/lib/assistant/creation-detection";

interface AssistantCreationPanelProps {
  response: AssistantResponse;
}

export function AssistantCreationPanel({ response }: AssistantCreationPanelProps) {
  const isLesson = isLessonCreationResponse(response);
  const isScheme = isSchemeCreationResponse(response);

  if (!isLesson && !isScheme) return null;

  return (
    <div className="space-y-4">
      <Card className="border-teal-200/80 bg-teal-50/30">
        <p className="text-sm font-medium text-teal-950">
          {isLesson ? "Here is an editable lesson draft." : "Here is an editable scheme draft."}
        </p>
        <p className="mt-1 text-sm text-teal-900/80">{response.answer.replace(/\*\*/g, "")}</p>
      </Card>

      {isLesson ? <GeneratedLessonPreview response={response} /> : <GeneratedSchemePreview response={response} />}

      {isLesson ? (
        <AssistantLessonDraftActions response={response} />
      ) : (
        <AssistantSchemeDraftActions response={response} />
      )}
    </div>
  );
}
