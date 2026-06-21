"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { CoverageTeacherReport } from "@/lib/progress/coverage-teacher-view";

interface CoverageTeacherViewProps {
  report: CoverageTeacherReport;
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

export function CoverageTeacherView({ report }: CoverageTeacherViewProps) {
  const { health } = report;

  return (
    <div className="space-y-6">
      <Card className="border-teal-100/80 bg-gradient-to-br from-teal-50/30 to-white">
        <CardHeader
          title="Curriculum health"
          description="What needs attention in your curriculum coverage."
        />
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HealthStat label="Visible curriculum outcomes" value={health.visibleOutcomes} />
          <HealthStat label="Planned outcomes" value={health.plannedOutcomes} tone="blue" />
          <HealthStat label="Delivered outcomes" value={health.deliveredOutcomes} tone="green" />
          <HealthStat label="Coverage" value={`${health.coveragePercent}%`} tone="teal" />
        </div>
        <ProgressBar
          value={health.coveragePercent}
          max={100}
          label="Overall coverage"
          variant="teal"
        />
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

      {report.recommendations.length > 0 && (
        <Card className="border-teal-100 bg-teal-50/20">
          <CardHeader title="Recommended next actions" />
          <ul className="space-y-3">
            {report.recommendations.map((rec) => (
              <li
                key={rec.id}
                className="flex flex-col gap-2 rounded-lg bg-white/80 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm text-slate-800">{rec.message}</span>
                <Link href={rec.actionHref} className="shrink-0">
                  <Button variant="secondary" className="text-xs">
                    {rec.actionLabel}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function HealthStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "blue" | "green" | "teal";
}) {
  const valueClass =
    tone === "green"
      ? "text-emerald-700"
      : tone === "blue"
        ? "text-blue-700"
        : tone === "teal"
          ? "text-teal-700"
          : "text-slate-800";

  return (
    <div className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}
