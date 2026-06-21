"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { CoverageTeacherReport } from "@/lib/progress/coverage-teacher-view";

interface CoverageTeacherViewProps {
  report: CoverageTeacherReport;
  onOpenAdvanced: () => void;
}

function AreaCard({
  card,
}: {
  card: CoverageTeacherReport["attentionAreas"][number];
}) {
  const borderClass =
    card.status === "strong"
      ? "border-emerald-100 bg-emerald-50/30"
      : "border-amber-100 bg-amber-50/30";

  return (
    <div className={`rounded-xl border px-4 py-3 ${borderClass}`}>
      <p className="font-medium text-slate-900">{card.title}</p>
      <p className="mt-1 text-sm text-slate-600">{card.reason}</p>
      <Link href={card.actionHref} className="mt-3 inline-block">
        <Button variant="secondary" className="text-xs">
          {card.action}
        </Button>
      </Link>
    </div>
  );
}

export function CoverageTeacherView({ report, onOpenAdvanced }: CoverageTeacherViewProps) {
  const { health } = report;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Overall curriculum health"
          description="What is in the catalogue and how your teaching maps to it."
        />
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HealthStat label="Visible outcomes" value={health.visibleOutcomes} />
          <HealthStat label="Planned outcomes" value={health.plannedOutcomes} />
          <HealthStat label="Taught outcomes" value={health.taughtOutcomes} tone="green" />
          <HealthStat label="Remaining outcomes" value={health.remainingOutcomes} tone="amber" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">{health.statusLabel}</p>
            <p className="text-sm text-slate-500">Delivery against visible catalogue</p>
          </div>
          <ProgressBar value={health.percentage} max={100} label="Coverage" variant="teal" />
        </div>
      </Card>

      {report.attentionAreas.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Areas needing attention</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {report.attentionAreas.map((card) => (
              <AreaCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      )}

      {report.strongAreas.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Strong areas</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {report.strongAreas.map((card) => (
              <AreaCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      )}

      {report.termFocus.length > 0 && (
        <Card>
          <CardHeader title="This term focus" description="Topic progress at a glance." />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Area</th>
                  <th className="pb-2 pr-4 font-medium">Planned</th>
                  <th className="pb-2 pr-4 font-medium">Taught</th>
                  <th className="pb-2 pr-4 font-medium">Remaining</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.termFocus.map((row) => (
                  <tr key={row.area} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-slate-800">{row.area}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-slate-700">{row.planned}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-emerald-700">{row.taught}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-amber-700">{row.remaining}</td>
                    <td className="py-2.5 text-slate-600">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {report.recommendations.length > 0 && (
        <Card className="border-teal-100 bg-teal-50/20">
          <CardHeader title="Smart recommendations" />
          <ul className="space-y-2">
            {report.recommendations.map((rec) => (
              <li key={rec.id} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-teal-600">→</span>
                {rec.message}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex justify-center pt-2">
        <Button variant="secondary" onClick={onOpenAdvanced}>
          Open Advanced Curriculum Audit
        </Button>
      </div>
    </div>
  );
}

function HealthStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "green" | "amber";
}) {
  const valueClass =
    tone === "green" ? "text-emerald-700" : tone === "amber" ? "text-amber-700" : "text-slate-800";

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}
