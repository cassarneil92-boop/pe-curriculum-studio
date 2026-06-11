"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldGroup, Input } from "@/components/ui/Input";
import {
  buildPlanningTermOverview,
  type PlanningTermOverview,
} from "@/lib/planning/terms";
import type { PlanningTerm, SchemeOfWork } from "@/lib/types";

interface CalendarPlanningTermsViewProps {
  terms: PlanningTerm[];
  schemes: SchemeOfWork[];
  onUpdateTerm: (id: string, patch: Partial<PlanningTerm>) => void;
  onAddTerm: () => void;
  onRemoveTerm: (id: string) => void;
  onMoveScheme: (schemeId: string, termName: string) => void;
  onOpenScheme: (schemeId: string) => void;
}

export function CalendarPlanningTermsView({
  terms,
  schemes,
  onUpdateTerm,
  onAddTerm,
  onRemoveTerm,
  onMoveScheme,
  onOpenScheme,
}: CalendarPlanningTermsViewProps) {
  const overviews = terms.map((term) => buildPlanningTermOverview(term, schemes));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Term planning framework</p>
          <p className="text-xs text-slate-500">
            Organise schemes by term. Week and Month views handle actual lesson dates.
          </p>
        </div>
        <Button variant="secondary" className="text-xs" onClick={onAddTerm}>
          Add term
        </Button>
      </div>

      {overviews.map((overview) => (
        <TermContainer
          key={overview.term.id}
          overview={overview}
          allTerms={terms}
          canRemove={terms.length > 1}
          onUpdateTerm={onUpdateTerm}
          onRemoveTerm={onRemoveTerm}
          onMoveScheme={onMoveScheme}
          onOpenScheme={onOpenScheme}
        />
      ))}
    </div>
  );
}

function TermContainer({
  overview,
  allTerms,
  canRemove,
  onUpdateTerm,
  onRemoveTerm,
  onMoveScheme,
  onOpenScheme,
}: {
  overview: PlanningTermOverview;
  allTerms: PlanningTerm[];
  canRemove: boolean;
  onUpdateTerm: (id: string, patch: Partial<PlanningTerm>) => void;
  onRemoveTerm: (id: string) => void;
  onMoveScheme: (schemeId: string, termName: string) => void;
  onOpenScheme: (schemeId: string) => void;
}) {
  const { term } = overview;

  return (
    <Card className="border-teal-100/60">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <FieldGroup label="Term name">
            <Input
              value={term.name}
              onChange={(e) => onUpdateTerm(term.id, { name: e.target.value })}
            />
          </FieldGroup>
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldGroup label="Start date">
              <Input
                type="date"
                value={term.startDate}
                onChange={(e) => onUpdateTerm(term.id, { startDate: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="End date">
              <Input
                type="date"
                value={term.endDate}
                onChange={(e) => onUpdateTerm(term.id, { endDate: e.target.value })}
              />
            </FieldGroup>
          </div>
        </div>
        {canRemove && (
          <Button
            variant="ghost"
            className="text-xs text-rose-600"
            onClick={() => onRemoveTerm(term.id)}
          >
            Remove term
          </Button>
        )}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Topics
          </p>
          {overview.topics.length === 0 ? (
            <p className="mt-1 text-sm text-slate-400">No topics yet</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {overview.topics.map((topic) => (
                <Badge key={topic} tone="teal">
                  {topic}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="text-sm text-slate-600">
          <p>
            <span className="font-semibold text-slate-800">Lessons planned:</span>{" "}
            {overview.totalLessonsPlanned}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-slate-800">Outcomes planned:</span>{" "}
            {overview.totalOutcomesPlanned}
          </p>
        </div>
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
            {overview.schemes.map(({ scheme, lessonsPlanned, outcomesPlanned, lessonsDelivered }) => (
              <div
                key={scheme.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <button
                  type="button"
                  onClick={() => onOpenScheme(scheme.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="font-medium text-slate-900">{scheme.title || "Untitled scheme"}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {lessonsDelivered}/{lessonsPlanned} lessons taught · {outcomesPlanned} outcomes
                    planned
                  </p>
                </button>
                <select
                  value={scheme.term}
                  onChange={(e) => onMoveScheme(scheme.id, e.target.value)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  aria-label={`Move ${scheme.title} to another term`}
                >
                  {allTerms.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
