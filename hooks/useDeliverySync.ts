"use client";

import { useCallback } from "react";
import { useApp } from "@/components/providers/AppProvider";
import {
  syncFromCalendarEntry,
  syncFromLessonPlan,
  syncFromSchemeLesson,
} from "@/lib/progress/delivery-sync";
import type {
  CalendarEntry,
  LessonDeliveryStatus,
  LessonPlan,
  SchemeOfWork,
} from "@/lib/types";

export function useDeliverySync() {
  const { data, batchApplyDeliveryUpdates } = useApp();

  const apply = useCallback(
    (
      result: ReturnType<typeof syncFromCalendarEntry>,
      extraCalendarUpdates?: Array<{ id: string; patch: Partial<CalendarEntry> }>
    ) => {
      batchApplyDeliveryUpdates({
        lessonUpdates: result.lessonUpdates,
        schemeUpdates: result.schemeUpdates,
        calendarUpdates: extraCalendarUpdates
          ? [...result.calendarUpdates, ...extraCalendarUpdates]
          : result.calendarUpdates,
      });
    },
    [batchApplyDeliveryUpdates]
  );

  const setCalendarDelivery = useCallback(
    (entry: CalendarEntry, status: LessonDeliveryStatus) => {
      const result = syncFromCalendarEntry(entry, status, data.lessons, data.schemes);
      apply(result, [{ id: entry.id, patch: { deliveryStatus: status } }]);
    },
    [apply, data.lessons, data.schemes]
  );

  const setLessonDelivery = useCallback(
    (lesson: LessonPlan, status: LessonDeliveryStatus) => {
      const result = syncFromLessonPlan(lesson, status, data.calendar);
      apply(result);
    },
    [apply, data.calendar]
  );

  const setSchemeLessonDelivery = useCallback(
    (
      scheme: SchemeOfWork,
      lessonNumber: number,
      status: LessonDeliveryStatus,
      deliveredDate?: string
    ) => {
      const result = syncFromSchemeLesson(
        scheme,
        lessonNumber,
        status,
        data.calendar,
        deliveredDate
      );
      apply(result);
    },
    [apply, data.calendar]
  );

  return {
    setCalendarDelivery,
    setLessonDelivery,
    setSchemeLessonDelivery,
  };
}
