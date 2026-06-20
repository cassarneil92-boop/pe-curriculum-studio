import type { CalendarEntry, LessonPlan, SchemeOfWork } from "@/lib/types";
import type { TeacherContextSnapshot } from "@/lib/teacher-context";
import {
  buildAssistantResponse,
  parseAssistantQuery,
  type AssistantResponse,
} from "@/lib/assistant";

export type { AssistantResponse } from "@/lib/assistant";

/** @deprecated Use AssistantResponse from @/lib/assistant */
export interface LegacyAssistantResponse extends AssistantResponse {}

export function queryCurriculumAssistant(
  prompt: string,
  context: {
    teacherContext: TeacherContextSnapshot;
    lessons: LessonPlan[];
    schemes: SchemeOfWork[];
    calendar?: CalendarEntry[];
    activeScheme?: SchemeOfWork;
  }
): AssistantResponse {
  const parsed = parseAssistantQuery(prompt);
  return buildAssistantResponse(parsed, context);
}
