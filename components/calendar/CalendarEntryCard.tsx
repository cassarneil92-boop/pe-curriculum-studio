"use client";

import { DeliveryStatusBadge } from "@/components/progress/DeliveryStatusBadge";
import { getTopicTheme } from "@/lib/design/topic-theme";
import { encodeCalendarDrag, CALENDAR_DRAG_MIME } from "@/lib/calendar/helpers";
import type { CalendarEntry } from "@/lib/types";

interface CalendarEntryCardProps {
  entry: CalendarEntry;
  active?: boolean;
  onSelect: () => void;
  draggable?: boolean;
}

export function CalendarEntryCard({
  entry,
  active = false,
  onSelect,
  draggable = true,
}: CalendarEntryCardProps) {
  const theme = getTopicTheme(entry.sport || entry.title);

  return (
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
      className={`w-full rounded-xl border p-3 text-left transition-all ${theme.border} ${theme.bg} ${
        active ? "ring-2 ring-teal-500/40" : "hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{entry.title}</p>
        {entry.deliveryStatus === "delivered" && (
          <span className="text-green-600" title="Delivered">
            ✓
          </span>
        )}
        {entry.deliveryStatus === "skipped" && (
          <span className="text-amber-600" title="Skipped">
            ⊘
          </span>
        )}
        {entry.deliveryStatus === "moved" && (
          <span className="text-slate-500" title="Moved">
            ↪
          </span>
        )}
      </div>
      {(entry.startTime || entry.endTime) && (
        <p className="mt-1 text-xs text-slate-500">
          {entry.startTime}
          {entry.endTime ? ` – ${entry.endTime}` : ""}
        </p>
      )}
      {entry.sport && <p className={`mt-1 text-xs ${theme.text}`}>{entry.sport}</p>}
      <div className="mt-2">
        <DeliveryStatusBadge status={entry.deliveryStatus} />
      </div>
    </button>
  );
}
