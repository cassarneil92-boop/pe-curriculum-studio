"use client";

import { Button } from "@/components/ui/Button";
import { DeliveryStatusBadge } from "@/components/progress/DeliveryStatusBadge";
import {
  markSchemeLessonDelivered,
  markSchemeLessonPlanned,
  markSchemeLessonSkipped,
} from "@/lib/progress/delivery";
import type { SOWLesson } from "@/lib/types";

interface SchemeLessonDeliveryControlsProps {
  lesson: SOWLesson;
  onChange: (lesson: SOWLesson) => void;
}

export function SchemeLessonDeliveryControls({
  lesson,
  onChange,
}: SchemeLessonDeliveryControlsProps) {
  const current = lesson.deliveryStatus ?? "planned";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">Lesson progress</p>
        <DeliveryStatusBadge status={current} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant={current === "planned" ? "primary" : "secondary"}
          className="text-xs"
          onClick={() => onChange(markSchemeLessonPlanned(lesson))}
        >
          Planned
        </Button>
        <Button
          variant={current === "delivered" ? "primary" : "secondary"}
          className="text-xs"
          onClick={() => onChange(markSchemeLessonDelivered(lesson))}
        >
          Delivered
        </Button>
        <Button
          variant={current === "skipped" ? "primary" : "secondary"}
          className="text-xs"
          onClick={() => onChange(markSchemeLessonSkipped(lesson))}
        >
          Skipped
        </Button>
      </div>
    </div>
  );
}
