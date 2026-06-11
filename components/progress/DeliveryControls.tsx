"use client";

import { Button } from "@/components/ui/Button";
import {
  markLessonDelivered,
  markLessonPlanned,
  markLessonSkipped,
} from "@/lib/progress/delivery";
import type { LessonDeliveryStatus, LessonPlan } from "@/lib/types";

interface DeliveryControlsProps {
  status?: LessonDeliveryStatus;
  onChange: (patch: Partial<LessonPlan>) => void;
  lesson: LessonPlan;
  compact?: boolean;
}

export function LessonDeliveryControls({
  status,
  onChange,
  lesson,
  compact = false,
}: DeliveryControlsProps) {
  const current = status ?? "planned";

  const apply = (next: LessonPlan) => {
    onChange({
      deliveryStatus: next.deliveryStatus,
      deliveredDate: next.deliveredDate,
      taughtOutcomeIds: next.taughtOutcomeIds,
    });
  };

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-2"}`}>
      <Button
        variant={current === "planned" ? "primary" : "secondary"}
        className="text-xs"
        onClick={() => apply(markLessonPlanned(lesson))}
      >
        Planned
      </Button>
      <Button
        variant={current === "delivered" ? "primary" : "secondary"}
        className="text-xs"
        onClick={() => apply(markLessonDelivered(lesson))}
      >
        Delivered
      </Button>
      <Button
        variant={current === "skipped" ? "primary" : "secondary"}
        className="text-xs"
        onClick={() => apply(markLessonSkipped(lesson))}
      >
        Skipped
      </Button>
    </div>
  );
}
