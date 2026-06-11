"use client";

import { Button } from "@/components/ui/Button";
import { DeliveryStatusBadge } from "@/components/progress/DeliveryStatusBadge";
import type { LessonDeliveryStatus } from "@/lib/types";

interface DeliveryQuickActionsProps {
  status?: LessonDeliveryStatus;
  deliveredDate?: string;
  onMarkDelivered: () => void;
  onMarkSkipped: () => void;
  onMarkMoved?: () => void;
  onMarkPlanned?: () => void;
  compact?: boolean;
  showMoved?: boolean;
}

export function DeliveryQuickActions({
  status,
  deliveredDate,
  onMarkDelivered,
  onMarkSkipped,
  onMarkMoved,
  onMarkPlanned,
  compact = false,
  showMoved = false,
}: DeliveryQuickActionsProps) {
  const current = status ?? "planned";

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex flex-wrap items-center gap-2">
        <DeliveryStatusBadge status={current} />
        {deliveredDate && current === "delivered" && (
          <span className="text-xs text-slate-500">Delivered {deliveredDate}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {onMarkPlanned && current !== "planned" && (
          <Button variant="secondary" className="text-xs" onClick={onMarkPlanned}>
            Mark planned
          </Button>
        )}
        <Button
          variant={current === "delivered" ? "primary" : "secondary"}
          className="text-xs"
          onClick={onMarkDelivered}
        >
          Mark delivered
        </Button>
        <Button
          variant={current === "skipped" ? "primary" : "secondary"}
          className="text-xs"
          onClick={onMarkSkipped}
        >
          Mark skipped
        </Button>
        {showMoved && onMarkMoved && (
          <Button
            variant={current === "moved" ? "primary" : "secondary"}
            className="text-xs"
            onClick={onMarkMoved}
          >
            Move lesson
          </Button>
        )}
      </div>
    </div>
  );
}
