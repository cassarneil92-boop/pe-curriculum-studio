"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatShortDate, parseIso } from "@/lib/calendar/dates";
import {
  buildPlanningTermOverview,
  type PlanningTermOverview,
} from "@/lib/planning/terms";
import type { PlanningTerm, SchemeOfWork } from "@/lib/types";

interface CalendarPlanningTermsViewProps {
  terms: PlanningTerm[];
  schemes: SchemeOfWork[];
  onOpenScheme: (schemeId: string) => void;
}

export function CalendarPlanningTermsView({
  terms,
  schemes,
  onOpenScheme,
}: CalendarPlanningTermsViewProps) {
  const overviews = terms.map((term) => buildPlanningTermOverview(term, schemes));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-800">Term planning board</p>
        <p className="text-xs text-slate-500">
          Overview of schemes by term — not a calendar. Edit term dates in Settings.
        </p>
      </div>

      {overviews.map((overview) => (
        <TermBoard key={overview.term.id} overview={overview} onOpenScheme={onOpenScheme} />
      ))}
    </div>
  );
}

function TermBoard({
  overview,
  onOpenScheme,
}: {
  overview: PlanningTermOverview;
  onOpenScheme: (schemeId: string) => void;
}) {
  const { term } = overview;
  const start = term.startDate ? formatShortDate(parseIso(term.startDate)) : "—";
  const end = term.endDate ? formatShortDate(parseIso(term.endDate)) : "—";

  return (
    <Card className="border-teal-100/60">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{term.name}</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {start} – {end}
          </p>
        </div>
        <div className="text-right text-sm text-slate-600">
          <p>
            <span className="font-semibold text-slate-800">{overview.totalLessonsPlanned}</span>{" "}
            planned lessons
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Topics
        </p>
        {overview.topics.length === 0 ? (
          <p className="text-sm text-slate-400">No topics yet</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {overview.topics.map((topic) => (
              <Badge key={topic} tone="teal">
                {topic}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Schemes
        </p>
        {overview.schemes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
            No schemes in this term yet
          </p>
        ) : (
          <div className="space-y-2">
            {overview.schemes.map(
              ({ scheme, lessonsPlanned, lessonsDelivered, outcomesPlanned }) => {
                const percent =
                  lessonsPlanned > 0
                    ? Math.round((lessonsDelivered / lessonsPlanned) * 100)
                    : 0;
                return (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => onOpenScheme(scheme.id)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-teal-200 hover:bg-teal-50/30"
                  >
                    <p className="font-medium text-slate-900">
                      {scheme.title || "Untitled scheme"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {lessonsPlanned} planned lessons · {outcomesPlanned} outcomes
                    </p>
                    <ProgressBar
                      className="mt-2"
                      value={lessonsDelivered}
                      max={lessonsPlanned || 1}
                      fractionLabel={`${lessonsDelivered} / ${lessonsPlanned} delivered`}
                      showPercent={false}
                      variant={percent >= 80 ? "green" : "teal"}
                    />
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
