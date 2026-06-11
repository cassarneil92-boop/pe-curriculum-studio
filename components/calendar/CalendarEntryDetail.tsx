"use client";

import Link from "next/link";
import { DeliveryQuickActions } from "@/components/progress/DeliveryQuickActions";
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
  onDeliveryChange: (status: LessonDeliveryStatus) => void;
  onUpdate: (patch: Partial<CalendarEntry>) => void;
  onDelete: () => void;
}

export function CalendarEntryDetail({
  entry,
  onDeliveryChange,
  onUpdate,
  onDelete,
}: CalendarEntryDetailProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader title="Scheduled lesson" />
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <TopicIcon name={entry.sport || entry.title} />
          <div>
            <p className="font-semibold text-slate-900">{entry.title}</p>
            <p className="mt-1 text-sm text-slate-500">
              {entry.startDate || "Not scheduled yet"}
              {entry.endDate && entry.endDate !== entry.startDate
                ? ` → ${entry.endDate}`
                : ""}
            </p>
          </div>
        </div>

        <DeliveryQuickActions
          status={entry.deliveryStatus}
          showMoved
          onMarkDelivered={() => onDeliveryChange("delivered")}
          onMarkSkipped={() => onDeliveryChange("skipped")}
          onMarkMoved={() => onDeliveryChange("moved")}
          onMarkPlanned={() => onDeliveryChange("planned")}
        />

        <div className="flex flex-wrap gap-2">
          <Badge tone="teal">{getPlanningLevelLabel(entry.level)}</Badge>
          <Badge tone="blue">{getPathwayLabel(entry.pathway)}</Badge>
          <Badge tone="slate">{getYearGroupLabel(entry.yearGroup)}</Badge>
          {entry.sport && <Badge tone="green">{entry.sport}</Badge>}
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
            Add reflection
          </p>
          <Textarea
            value={entry.reflection ?? ""}
            onChange={(e) => onUpdate({ reflection: e.target.value })}
            placeholder="What went well? What would you adjust next time?"
            rows={3}
          />
        </div>

        {entry.notes && (
          <p className="text-sm leading-relaxed text-slate-600">{entry.notes}</p>
        )}

        <Button variant="danger" className="w-full text-sm" onClick={onDelete}>
          Remove from calendar
        </Button>
      </div>
    </Card>
  );
}
