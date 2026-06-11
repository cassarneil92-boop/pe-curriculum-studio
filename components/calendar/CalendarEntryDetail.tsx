"use client";

import Link from "next/link";
import { DeliveryStatusBadge } from "@/components/progress/DeliveryStatusBadge";
import { TopicIcon } from "@/components/design/TopicIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { getPathwayLabel, getPlanningLevelLabel } from "@/lib/constants";
import { getYearGroupLabel } from "@/lib/year-groups";
import type { CalendarEntry, LessonDeliveryStatus } from "@/lib/types";

interface CalendarEntryDetailProps {
  entry: CalendarEntry;
  onUpdate: (patch: Partial<CalendarEntry>) => void;
  onDelete: () => void;
}

export function CalendarEntryDetail({ entry, onUpdate, onDelete }: CalendarEntryDetailProps) {
  const setStatus = (deliveryStatus: LessonDeliveryStatus) => {
    onUpdate({ deliveryStatus });
  };

  return (
    <Card className="sticky top-6">
      <CardHeader title="Lesson detail" />
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <TopicIcon name={entry.sport || entry.title} />
          <div>
            <p className="font-semibold text-slate-900">{entry.title}</p>
            <p className="mt-1 text-sm text-slate-500">
              {entry.startDate}
              {entry.endDate && entry.endDate !== entry.startDate
                ? ` → ${entry.endDate}`
                : ""}
            </p>
          </div>
        </div>

        <DeliveryStatusBadge status={entry.deliveryStatus} />

        <div className="flex flex-wrap gap-2">
          <Badge tone="teal">{getPlanningLevelLabel(entry.level)}</Badge>
          <Badge tone="blue">{getPathwayLabel(entry.pathway)}</Badge>
          <Badge tone="slate">{getYearGroupLabel(entry.yearGroup)}</Badge>
          {entry.sport && <Badge tone="green">{entry.sport}</Badge>}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="text-xs" onClick={() => setStatus("planned")}>
            Planned
          </Button>
          <Button variant="secondary" className="text-xs" onClick={() => setStatus("delivered")}>
            Mark delivered
          </Button>
          <Button variant="secondary" className="text-xs" onClick={() => setStatus("skipped")}>
            Skipped
          </Button>
          <Button variant="secondary" className="text-xs" onClick={() => setStatus("moved")}>
            Moved
          </Button>
        </div>

        {entry.linkedLessonId && (
          <Link
            href={`/lesson-builder?edit=${entry.linkedLessonId}`}
            className="block text-sm font-medium text-teal-700 hover:underline"
          >
            Open linked lesson plan →
          </Link>
        )}

        {entry.linkedSchemeId && (
          <Link
            href={`/schemes?edit=${entry.linkedSchemeId}`}
            className="block text-sm font-medium text-teal-700 hover:underline"
          >
            Open linked scheme
            {entry.linkedSchemeLessonNumber
              ? ` (lesson ${entry.linkedSchemeLessonNumber})`
              : ""}{" "}
            →
          </Link>
        )}

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            Reflection
          </p>
          <Textarea
            value={entry.reflection ?? ""}
            onChange={(e) => onUpdate({ reflection: e.target.value })}
            placeholder="Optional reflection after delivery"
            rows={3}
          />
        </div>

        {entry.notes && (
          <p className="text-sm leading-relaxed text-slate-600">{entry.notes}</p>
        )}

        <Button variant="danger" className="w-full text-sm" onClick={onDelete}>
          Remove entry
        </Button>
      </div>
    </Card>
  );
}
