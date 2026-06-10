"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { getPathwayLabel } from "@/lib/constants";
import {
  countImportedOutcomeVisibility,
  countImportedOutcomesByPathway,
  countImportedOutcomesByYearGroup,
  getContextualYearGroupLabel,
  IMPORTED_PATHWAY_LABELS,
} from "@/lib/teacher-context";
import { IMPORTED_LEARNING_OUTCOMES } from "@/src/lib/curriculum/coverage";
import { resolveSchoolDisplayName } from "@/src/lib/schools";

export default function CurriculumVisibilityAuditPage() {
  const { data } = useApp();
  const { context } = useTeacherContext();
  const teacher = data.teacher;

  const visibility = useMemo(
    () => countImportedOutcomeVisibility(IMPORTED_LEARNING_OUTCOMES, context),
    [context]
  );

  const byPathway = useMemo(
    () => countImportedOutcomesByPathway(IMPORTED_LEARNING_OUTCOMES, context),
    [context]
  );

  const byYearGroup = useMemo(
    () => countImportedOutcomesByYearGroup(IMPORTED_LEARNING_OUTCOMES, context),
    [context]
  );

  const schoolName = resolveSchoolDisplayName(teacher.school, teacher.manualSchoolName);

  return (
    <div>
      <PageHeader
        title="Curriculum Visibility Audit"
        description="Read-only verification that imported outcomes remain available while Intelligent Mode hides irrelevant pathways."
      />

      <p className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        No curriculum data is edited on this page. Hidden outcomes are still stored in the imported
        curriculum brain.
      </p>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Visible outcomes" value={visibility.visible} tone="teal" />
        <StatCard label="Hidden outcomes" value={visibility.hidden} tone="amber" />
        <StatCard label="Total outcomes" value={visibility.total} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Teacher context" />
          <dl className="space-y-3 text-sm">
            <Row label="School" value={schoolName || "Not set"} />
            <Row label="Role" value={context.roleLabel} />
            <Row
              label="Visibility mode"
              value={context.exploreAllEnabled ? "Explore All Curriculum" : "Intelligent Mode"}
            />
            <Row
              label="App pathways taught"
              value={
                teacher.pathways.length > 0
                  ? teacher.pathways.map((id) => getPathwayLabel(id)).join(", ")
                  : "None selected"
              }
            />
            <Row
              label="Year groups taught"
              value={
                teacher.yearGroups.length > 0
                  ? teacher.yearGroups
                      .map((id) => getContextualYearGroupLabel(id, teacher.pathways))
                      .join(", ")
                  : "None selected"
              }
            />
          </dl>
        </Card>

        <Card>
          <CardHeader title="Pathway visibility" />
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-teal-600">
                Visible
              </p>
              <div className="flex flex-wrap gap-2">
                {context.visibleImportedPathways.map((id) => (
                  <Badge key={id} tone="teal">
                    {IMPORTED_PATHWAY_LABELS[id]}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Hidden by default
              </p>
              <div className="flex flex-wrap gap-2">
                {context.hiddenImportedPathways.length === 0 ? (
                  <span className="text-sm text-slate-500">None</span>
                ) : (
                  context.hiddenImportedPathways.map((id) => (
                    <Badge key={id} tone="slate">
                      {IMPORTED_PATHWAY_LABELS[id]}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Outcomes by pathway" />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byPathway.map((row) => (
              <li
                key={row.pathwayId}
                className="rounded-lg border border-slate-100 bg-white px-4 py-3"
              >
                <p className="text-sm font-medium text-slate-800">{row.label}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {row.visible} visible · {row.hidden} hidden
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Outcomes by year group" />
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {byYearGroup.map((row) => (
              <li
                key={row.yearGroup}
                className="rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-700">{row.yearGroup}</span>
                <span className="text-slate-500">
                  {" "}
                  · {row.visible} visible · {row.hidden} hidden
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/settings">
          <Button variant="secondary">Curriculum Access settings</Button>
        </Link>
        <Link href="/curriculum-coverage">
          <Button variant="ghost">Coverage Checker</Button>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "teal" | "amber" | "slate";
}) {
  const toneClass =
    tone === "teal" ? "text-teal-700" : tone === "amber" ? "text-amber-800" : "text-slate-800";

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-700">{value}</dd>
    </div>
  );
}
