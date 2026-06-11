import { Badge } from "@/components/ui/Badge";
import {
  getLessonLibraryStatus,
  lessonLibraryStatusLabel,
  type LessonLibraryStatus,
} from "@/lib/lesson-plans/status";
import type { LessonPlan } from "@/lib/types";

const TONES: Record<LessonLibraryStatus, "slate" | "teal" | "green"> = {
  draft: "slate",
  planned: "teal",
  delivered: "green",
};

export function LessonLibraryStatusBadge({ lesson }: { lesson: LessonPlan }) {
  const status = getLessonLibraryStatus(lesson);
  return <Badge tone={TONES[status]}>{lessonLibraryStatusLabel(status)}</Badge>;
}
