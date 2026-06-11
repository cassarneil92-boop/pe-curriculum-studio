"use client";

import { DeliveryQuickActions } from "@/components/progress/DeliveryQuickActions";
import type { LessonDeliveryStatus, LessonPlan } from "@/lib/types";

interface DeliveryControlsProps {
  status?: LessonDeliveryStatus;
  lesson: LessonPlan;
  onDeliveryChange: (status: LessonDeliveryStatus) => void;
  compact?: boolean;
}

export function LessonDeliveryControls({
  status,
  lesson,
  onDeliveryChange,
  compact = false,
}: DeliveryControlsProps) {
  return (
    <div className={compact ? "" : "mt-2"}>
      <DeliveryQuickActions
        compact
        status={status ?? lesson.deliveryStatus}
        deliveredDate={lesson.deliveredDate}
        onMarkDelivered={() => onDeliveryChange("delivered")}
        onMarkSkipped={() => onDeliveryChange("skipped")}
        onMarkPlanned={() => onDeliveryChange("planned")}
      />
    </div>
  );
}
