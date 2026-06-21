import type { AssistantResponse } from "@/lib/assistant/responses";
import {
  isPlanningCreationIntent,
  parseAssistantQuery,
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
  return (
    response.responseMode === "lesson-draft" ||
    Boolean(response.lessonPreview && response.lessonDraftSource)
  );
}

export function isSchemeCreationResponse(response: AssistantResponse): boolean {
  return (
    response.responseMode === "scheme-draft" ||
    Boolean(
      response.schemeDraftSource &&
        response.planningSequence &&
        response.planningSequence.length > 0 &&
        response.responseMode !== "curriculum-query"
    )
  );
}

export function isCreationAssistantResponse(response: AssistantResponse): boolean {
  return isLessonCreationResponse(response) || isSchemeCreationResponse(response);
}

export function isCurriculumQueryResponse(response: AssistantResponse): boolean {
  return response.responseMode === "curriculum-query" || !isCreationAssistantResponse(response);
}

export type AssistantOutputMode = "lesson-draft" | "scheme-draft" | "curriculum-query";

export function getAssistantOutputMode(response: AssistantResponse): AssistantOutputMode {
  if (response.responseMode === "lesson-draft" || isLessonCreationResponse(response)) {
    return "lesson-draft";
  }
  if (response.responseMode === "scheme-draft" || isSchemeCreationResponse(response)) {
    return "scheme-draft";
  }
  return "curriculum-query";
}
