"use client";

import { encodeCalendarDrag, CALENDAR_DRAG_MIME } from "@/lib/calendar/helpers";
import { getLessonTopicName } from "@/lib/lesson-plans/helpers";
import { schemeDisplayTitle } from "@/lib/scheme-builder/helpers";
import type { LessonPlan, SchemeOfWork } from "@/lib/types";

interface CalendarUnscheduledPoolProps {
  lessons: LessonPlan[];
  schemes: SchemeOfWork[];
  scheduledLessonIds: Set<string>;
  scheduledSchemeLessons: Set<string>;
}

function DraggableItem({
  label,
  sublabel,
  payload,
}: {
  label: string;
  sublabel?: string;
  payload: string;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(CALENDAR_DRAG_MIME, payload);
        e.dataTransfer.effectAllowed = "copyMove";
      }}
      className="cursor-grab rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm active:cursor-grabbing"
    >
      <p className="font-medium text-slate-800">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}

export function CalendarUnscheduledPool({
  lessons,
  schemes,
  scheduledLessonIds,
  scheduledSchemeLessons,
}: CalendarUnscheduledPoolProps) {
  const unscheduledLessons = lessons.filter((l) => !scheduledLessonIds.has(l.id));
  const schemeItems = schemes.flatMap((scheme) =>
    scheme.lessons
      .filter((lesson) => !scheduledSchemeLessons.has(`${scheme.id}:${lesson.lessonNumber}`))
      .map((lesson) => ({ scheme, lesson }))
  );

  if (unscheduledLessons.length === 0 && schemeItems.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        All saved lessons are on the calendar, or you have not created any yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {unscheduledLessons.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Lesson plans
          </p>
          <div className="space-y-2">
            {unscheduledLessons.slice(0, 8).map((lesson) => (
              <DraggableItem
                key={lesson.id}
                label={lesson.title || "Untitled lesson"}
                sublabel={getLessonTopicName(lesson)}
                payload={encodeCalendarDrag({ type: "lesson", lessonId: lesson.id })}
              />
            ))}
          </div>
        </div>
      )}

      {schemeItems.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Scheme lessons
          </p>
          <div className="space-y-2">
            {schemeItems.slice(0, 10).map(({ scheme, lesson }) => (
              <DraggableItem
                key={`${scheme.id}-${lesson.lessonNumber}`}
                label={`${schemeDisplayTitle(scheme)} — L${lesson.lessonNumber}`}
                sublabel={lesson.walt.split("\n")[0] || "Drag to schedule"}
                payload={encodeCalendarDrag({
                  type: "scheme-lesson",
                  schemeId: scheme.id,
                  lessonNumber: lesson.lessonNumber,
                })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
