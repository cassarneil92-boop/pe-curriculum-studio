"use client";

import { Card } from "@/components/ui/Card";
import { buildTermUnitBlocks, blockSpansWeek, type TermUnitBlock } from "@/lib/calendar/pacing";
import {
  defaultTermRange,
  formatMonthYear,
  formatShortDate,
  toIso,
  weeksBetween,
} from "@/lib/calendar/dates";
import type { CalendarEntry, SchemeOfWork } from "@/lib/types";

interface CalendarTermViewProps {
  schemes: SchemeOfWork[];
  calendar: CalendarEntry[];
  onSelectBlock: (schemeId: string) => void;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarTermView({ schemes, calendar, onSelectBlock }: CalendarTermViewProps) {
  const { start, end } = defaultTermRange();
  const weeks = weeksBetween(start, end);
  const blocks = buildTermUnitBlocks(schemes, calendar);

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
        {blocks.length === 0 && (
          <p className="text-sm text-slate-500">
            Schedule a scheme to see coloured unit blocks across the term.
          </p>
        )}
      </div>

      <Card padding={false} className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">Term pacing</p>
          <p className="text-xs text-slate-500">
            {formatMonthYear(start)} – {formatMonthYear(end)}
          </p>
        </div>

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
                block: TermUnitBlock;
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
                      <div
                        key={i}
                        className="border-l border-slate-100 bg-white/80"
                      />
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
      </Card>
    </div>
  );
}
