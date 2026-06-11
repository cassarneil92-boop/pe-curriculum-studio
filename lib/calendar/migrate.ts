import type { CalendarEntry } from "@/lib/types";
import { DEFAULT_DELIVERY_STATUS } from "@/lib/progress/delivery";

export function migrateCalendarEntry(entry: CalendarEntry): CalendarEntry {
  return {
    ...entry,
    deliveryStatus: entry.deliveryStatus ?? DEFAULT_DELIVERY_STATUS,
    classGroup: entry.classGroup ?? "",
    topicId: entry.topicId ?? "",
    startTime: entry.startTime ?? "",
    endTime: entry.endTime ?? "",
    reflection: entry.reflection ?? "",
  };
}
