"use client";

import { DeliveryStatusBadge } from "@/components/progress/DeliveryStatusBadge";
import { encodeCalendarDrag, CALENDAR_DRAG_MIME } from "@/lib/calendar/helpers";
import { getLessonTopicName } from "@/lib/lesson-plans/helpers";
import { schemeDisplayTitle } from "@/lib/scheme-builder/helpers";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { CalendarEntry, LessonPlan, SchemeOfWork } from "@/lib/types";

interface LessonsToSchedulePanelProps {
  lessons: LessonPlan[];
  schemes: SchemeOfWork[];
  calendar: CalendarEntry[];
  scheduledLessonIds: Set<string>;
  scheduledSchemeLessons: Set<string>;
}

function DraggableScheduleCard({
  title,
  meta,
  status,
  payload,
}: {
  title: string;
  meta: string;
  status?: CalendarEntry["deliveryStatus"];
  payload: string;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(CALENDAR_DRAG_MIME, payload);
        e.dataTransfer.effectAllowed = "copyMove";
      }}
      className="cursor-grab rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        {status && <DeliveryStatusBadge status={status} />}
      </div>
      <p className="mt-1 text-xs text-slate-500">{meta}</p>
    </div>
  );
}

export function LessonsToSchedulePanel({
  lessons,
  schemes,
  calendar,
  scheduledLessonIds,
  scheduledSchemeLessons,
}: LessonsToSchedulePanelProps) {
  const unscheduledLessons = lessons.filter((l) => !scheduledLessonIds.has(l.id));
  const schemeItems = schemes.flatMap((scheme) =>
    scheme.lessons
      .filter((lesson) => !scheduledSchemeLessons.has(`${scheme.id}:${lesson.lessonNumber}`))
      .map((lesson) => ({ scheme, lesson }))
  );
  const customPool = calendar.filter(
    (e) => !e.startDate?.trim() && !e.linkedLessonId && !e.linkedSchemeId
  );

  const empty =
    unscheduledLessons.length === 0 &&
    schemeItems.length === 0 &&
    customPool.length === 0;

  if (empty) {
    return (
      <p className="text-sm text-slate-500">
        Create lesson plans or schemes, then drag them onto the calendar. Use Schedule scheme
        to place a full unit across weeks.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {unscheduledLessons.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Saved lesson plans
          </p>
          <div className="space-y-2">
            {unscheduledLessons.map((lesson) => (
              <DraggableScheduleCard
                key={lesson.id}
                title={lesson.title || "Untitled lesson"}
                meta={`${getLessonTopicName(lesson)} · ${getYearGroupLabel(lesson.yearGroup)}`}
                status={lesson.deliveryStatus}
                payload={encodeCalendarDrag({ type: "lesson", lessonId: lesson.id })}
              />
            ))}
          </div>
        </section>
      )}

      {schemeItems.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Scheme lessons
          </p>
          <div className="space-y-2">
            {schemeItems.map(({ scheme, lesson }) => (
              <DraggableScheduleCard
                key={`${scheme.id}-${lesson.lessonNumber}`}
                title={lesson.walt.split("\n")[0] || `Lesson ${lesson.lessonNumber}`}
                meta={`${schemeDisplayTitle(scheme)} · L${lesson.lessonNumber} · ${getYearGroupLabel(scheme.yearGroup)}`}
                status={lesson.deliveryStatus}
                payload={encodeCalendarDrag({
                  type: "scheme-lesson",
                  schemeId: scheme.id,
                  lessonNumber: lesson.lessonNumber,
                })}
              />
            ))}
          </div>
        </section>
      )}

      {customPool.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Custom entries
          </p>
          <div className="space-y-2">
            {customPool.map((entry) => (
              <DraggableScheduleCard
                key={entry.id}
                title={entry.title}
                meta={`${entry.sport || "Custom"} · ${getYearGroupLabel(entry.yearGroup)}`}
                status={entry.deliveryStatus}
                payload={encodeCalendarDrag({ type: "custom-entry", entryId: entry.id })}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
