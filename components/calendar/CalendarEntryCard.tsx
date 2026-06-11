"use client";

import { DeliveryQuickActions } from "@/components/progress/DeliveryQuickActions";
import { getTopicTheme } from "@/lib/design/topic-theme";
import { encodeCalendarDrag, CALENDAR_DRAG_MIME } from "@/lib/calendar/helpers";
import type { CalendarEntry, LessonDeliveryStatus } from "@/lib/types";

interface CalendarEntryCardProps {
  entry: CalendarEntry;
  active?: boolean;
  onSelect: () => void;
  onDeliveryChange?: (status: LessonDeliveryStatus) => void;
  draggable?: boolean;
  showQuickActions?: boolean;
}

export function CalendarEntryCard({
  entry,
  active = false,
  onSelect,
  onDeliveryChange,
  draggable = true,
  showQuickActions = false,
}: CalendarEntryCardProps) {
  const theme = getTopicTheme(entry.sport || entry.title);

  return (
    <div
      className={`w-full rounded-xl border p-3 transition-all ${theme.border} ${theme.bg} ${
        active ? "ring-2 ring-teal-500/40" : "hover:shadow-sm"
      }`}
    >
      <button
        type="button"
        draggable={draggable}
        onDragStart={(e) => {
          e.dataTransfer.setData(
            CALENDAR_DRAG_MIME,
            encodeCalendarDrag({ type: "calendar-entry", entryId: entry.id })
          );
          e.dataTransfer.effectAllowed = "move";
        }}
        onClick={onSelect}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">{entry.title}</p>
          {entry.deliveryStatus === "delivered" && (
            <span className="text-green-600" title="Delivered">
              ✓
            </span>
          )}
        </div>
        {entry.sport && <p className={`mt-1 text-xs ${theme.text}`}>{entry.sport}</p>}
      </button>

      {showQuickActions && onDeliveryChange && (
        <div
          className="mt-2 border-t border-white/60 pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <DeliveryQuickActions
            compact
            status={entry.deliveryStatus}
            showMoved
            onMarkDelivered={() => onDeliveryChange("delivered")}
            onMarkSkipped={() => onDeliveryChange("skipped")}
            onMarkMoved={() => onDeliveryChange("moved")}
          />
        </div>
      )}
    </div>
  );
}
