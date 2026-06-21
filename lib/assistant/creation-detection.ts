import type { AssistantResponse } from "@/lib/assistant/responses";
import {
  isPlanningCreationIntent,
  parseAssistantQuery,
  type AssistantIntent,
} from "@/lib/assistant/query-parser";

const CREATION_TRIGGERS =
  /\b(create|build|generate|plan|make|design|prepare|lesson|scheme|sow|unit)\b/i;

export function isCreationRequestQuery(raw: string): boolean {
  const parsed = parseAssistantQuery(raw);
  if (parsed.intent === "find-outcomes") return false;
  if (isPlanningCreationIntent(parsed.intent)) return true;
  return CREATION_TRIGGERS.test(raw) && parsed.intent !== "unknown";
}

export function isLessonCreationResponse(response: AssistantResponse): boolean {
  return Boolean(response.lessonPreview && response.lessonDraftSource);
}

export function isSchemeCreationResponse(response: AssistantResponse): boolean {
  return Boolean(
    response.schemeDraftSource &&
      response.planningSequence &&
      response.planningSequence.length > 0
  );
}

export function isCreationAssistantResponse(response: AssistantResponse): boolean {
  return isLessonCreationResponse(response) || isSchemeCreationResponse(response);
}

export function creationIntentLabel(intent: AssistantIntent): "lesson" | "scheme" | null {
  if (intent === "create-lesson") return "lesson";
  if (intent === "create-scheme") return "scheme";
  return null;
}
