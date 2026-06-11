import type { LessonPlan } from "@/lib/types";

export type LessonLibraryStatus = "draft" | "planned" | "delivered";

export function getLessonLibraryStatus(lesson: LessonPlan): LessonLibraryStatus {
  if (lesson.deliveryStatus === "delivered") return "delivered";

  const hasContent =
    Boolean(lesson.title?.trim()) &&
    (lesson.selectedLearningOutcomeIds.length > 0 ||
      Boolean(lesson.walt?.trim()) ||
      Boolean(lesson.activities?.trim()));

  if (!hasContent) return "draft";
  return "planned";
}

export function lessonLibraryStatusLabel(status: LessonLibraryStatus): string {
  switch (status) {
    case "delivered":
      return "Delivered";
    case "planned":
      return "Planned";
    default:
      return "Draft";
  }
}
