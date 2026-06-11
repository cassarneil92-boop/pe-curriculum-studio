"use client";

import { DeliveryQuickActions } from "@/components/progress/DeliveryQuickActions";
import type { LessonDeliveryStatus, SOWLesson } from "@/lib/types";

interface SchemeLessonDeliveryControlsProps {
  lesson: SOWLesson;
  onDeliveryChange: (status: LessonDeliveryStatus) => void;
}

export function SchemeLessonDeliveryControls({
  lesson,
  onDeliveryChange,
}: SchemeLessonDeliveryControlsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
      <p className="mb-2 text-sm font-semibold text-slate-800">Lesson progress</p>
      <DeliveryQuickActions
        compact
        status={lesson.deliveryStatus}
        deliveredDate={lesson.deliveredDate}
        onMarkDelivered={() => onDeliveryChange("delivered")}
        onMarkSkipped={() => onDeliveryChange("skipped")}
        onMarkPlanned={() => onDeliveryChange("planned")}
      />
    </div>
  );
}
