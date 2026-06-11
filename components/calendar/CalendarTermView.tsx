"use client";

import { Card } from "@/components/ui/Card";
import {
  buildDraftSchemeBlocks,
  buildTermUnitBlocks,
  blockSpansWeek,
} from "@/lib/calendar/pacing";
import {
  formatMonthYear,
  formatShortDate,
  termRangeFromSettings,
  toIso,
  weeksBetween,
} from "@/lib/calendar/dates";
import type { AcademicCalendarSettings, CalendarEntry, SchemeOfWork } from "@/lib/types";

interface CalendarTermViewProps {
  schemes: SchemeOfWork[];
  calendar: CalendarEntry[];
  academicCalendar?: AcademicCalendarSettings | null;
  onSelectBlock: (schemeId: string) => void;
  onScheduleDraft?: (schemeId: string) => void;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarTermView({
  schemes,
  calendar,
  academicCalendar,
  onSelectBlock,
  onScheduleDraft,
}: CalendarTermViewProps) {
  const { start, end } = termRangeFromSettings(academicCalendar);
  const weeks = weeksBetween(start, end);
  const blocks = buildTermUnitBlocks(schemes, calendar);
  const drafts = buildDraftSchemeBlocks(schemes, calendar);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {blocks.map((block) => (
          <button
            key={block.id}
            type="button"
            onClick={() => onSelectBlock(block.schemeId)}
            className={`rounded-xl border px-3 py-2 text-left text-sm shadow-sm transition hover:shadow-md ${block.theme.border} ${block.theme.bg}`}
          >
            <p className={`font-semibold ${block.theme.text}`}>{block.title}</p>
            <p className="mt-0.5 text-xs text-slate-600">
              {formatShortDate(new Date(block.startDate))} –{" "}
              {formatShortDate(new Date(block.endDate))}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-700">
              {block.deliveredLessons}/{block.totalLessons} delivered
            </p>
          </button>
        ))}
      </div>

      {drafts.length > 0 && (
        <Card className="border-dashed border-amber-200 bg-amber-50/30">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Draft schemes to place
          </p>
          <p className="mb-3 text-xs text-slate-600">
            These units are not on the calendar yet. Use Schedule scheme to place them across
            the term.
          </p>
          <div className="flex flex-wrap gap-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className={`rounded-xl border border-dashed px-3 py-2 text-sm ${draft.theme.border} bg-white/80`}
              >
                <p className={`font-semibold ${draft.theme.text}`}>{draft.title}</p>
                <p className="mt-1 text-xs text-amber-800">Not scheduled yet</p>
                <p className="mt-1 text-xs text-slate-600">
                  {draft.lessonsStillToTeach} lessons still to teach · {draft.totalLessons}{" "}
                  total
                </p>
                {onScheduleDraft && (
                  <button
                    type="button"
                    onClick={() => onScheduleDraft(draft.schemeId)}
                    className="mt-2 text-xs font-medium text-teal-700 hover:underline"
                  >
                    Schedule scheme →
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card padding={false} className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">Term pacing</p>
          <p className="text-xs text-slate-500">
            {formatMonthYear(start)} – {formatMonthYear(end)}
          </p>
        </div>

        {blocks.length === 0 && drafts.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500">
            Create a scheme, then use Schedule scheme to see coloured unit blocks across the
            term.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-slate-200 bg-white text-xs font-semibold uppercase tracking-wide text-slate-500">
                <div className="px-2 py-2" />
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label} className="border-l border-slate-100 px-2 py-2 text-center">
                    {label}
                  </div>
                ))}
              </div>

              {weeks.map((weekStart) => {
                const weekIso = toIso(weekStart);
                const weekBlocks = blocks
                  .map((block) => ({ block, span: blockSpansWeek(block, weekIso) }))
                  .filter((row) => row.span !== null) as {
                  block: (typeof blocks)[0];
                  span: { startCol: number; span: number };
                }[];

                return (
                  <div
                    key={weekIso}
                    className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-slate-100"
                  >
                    <div className="px-2 py-3 text-xs text-slate-500">
                      {formatShortDate(weekStart)}
                    </div>
                    <div className="relative col-span-7 grid min-h-[56px] grid-cols-7">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="border-l border-slate-100 bg-white/80" />
                      ))}
                      {weekBlocks.map(({ block, span }) => (
                        <button
                          key={`${weekIso}-${block.id}`}
                          type="button"
                          onClick={() => onSelectBlock(block.schemeId)}
                          style={{
                            gridColumn: `${span.startCol} / span ${span.span}`,
                          }}
                          className={`relative z-10 m-1 flex items-center rounded-lg px-2 py-1.5 text-left text-xs font-medium text-white shadow-sm ${block.theme.bar}`}
                        >
                          <span className="truncate">{block.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
