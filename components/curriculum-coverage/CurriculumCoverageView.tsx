"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CoverageTeacherView } from "@/components/curriculum-coverage/CoverageTeacherView";
import { useApp } from "@/components/providers/AppProvider";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldGroup, Input, Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  CatalogueStatusBadge,
  PathwayYearHeatmap,
} from "@/components/curriculum-coverage/CatalogueHeatmap";
import {
  buildCoverageFilterOptions,
  buildCoverageReport,
  buildCurriculumCoverageDashboard,
  computeCoverageSummary,
  filterCoverageOutcomes,
  formatOutcomeSkills,
  formatOutcomeSource,
  formatOutcomeTopic,
  formatOutcomeValues,
  formatOutcomeYearGroups,
  isMissingSkills,
  isMissingTopic,
  isMissingValues,
  isMissingYearGroup,
  type CoverageFilters,
  type CoverageMissingTab,
  IMPORTED_LEARNING_OUTCOMES,
} from "@/src/lib/curriculum/coverage";
import { countImportedOutcomeVisibility } from "@/lib/teacher-context";
import { buildCoverageTeacherReport } from "@/lib/progress/coverage-teacher-view";
import {
  buildTeachingProgressReports,
  buildTopicCoverageRows,
} from "@/lib/progress/teaching-progress-ui";

const EMPTY_FILTERS: CoverageFilters = {
  pathwayId: "",
  yearGroup: "",
  topic: "",
  skill: "",
  sourceDocument: "",
  search: "",
};

const MISSING_TABS: { id: CoverageMissingTab; label: string }[] = [
  { id: "all", label: "All outcomes" },
  { id: "missing-year-group", label: "Missing year group" },
  { id: "missing-topic", label: "Missing topic" },
  { id: "missing-skills", label: "Missing skills" },
  { id: "missing-values", label: "Missing values" },
];

export function CurriculumCoverageView() {
  const { data } = useApp();
  const { context } = useTeacherContext();
  const [filters, setFilters] = useState<CoverageFilters>(EMPTY_FILTERS);
  const [activeTab, setActiveTab] = useState<CoverageMissingTab>("all");

  const summary = useMemo(() => computeCoverageSummary(), []);
  const dashboard = useMemo(() => buildCurriculumCoverageDashboard(), []);
  const teachingReports = useMemo(
    () => buildTeachingProgressReports(data.lessons, data.schemes, data.calendar),
    [data.lessons, data.schemes, data.calendar]
  );
  const topicRows = useMemo(
    () => buildTopicCoverageRows(teachingReports.taught, teachingReports.planned),
    [teachingReports]
  );
  const teacherReport = useMemo(
    () => buildCoverageTeacherReport(dashboard, teachingReports.taught, topicRows),
    [dashboard, teachingReports, topicRows]
  );
  const visibility = useMemo(
    () => countImportedOutcomeVisibility(IMPORTED_LEARNING_OUTCOMES, context),
    [context]
  );
  const filterOptions = useMemo(() => buildCoverageFilterOptions(), []);

  const results = useMemo(
    () => filterCoverageOutcomes(filters, activeTab),
    [filters, activeTab]
  );

  function updateFilter<K extends keyof CoverageFilters>(key: K, value: CoverageFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  function exportReport() {
    const report = buildCoverageReport(filters, activeTab);
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `curriculum-coverage-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="Coverage Dashboard"
        description="What needs attention in your curriculum — and what to plan next."
        action={
          <Link href="/curriculum-intelligence">
            <Button variant="secondary">Planning Insights →</Button>
          </Link>
        }
      />

      <CoverageTeacherView report={teacherReport} />

      <details className="mt-8 rounded-[20px] border border-slate-200 bg-white">
        <summary className="cursor-pointer list-none px-6 py-4 text-sm font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
          ▶ Advanced Curriculum Audit
          <span className="ml-2 text-xs font-normal text-slate-500">
            Pathway tables, topic grids, and detailed coverage diagnostics
          </span>
        </summary>
        <div className="border-t border-slate-100 px-6 py-4">
          <div className="mb-4 flex justify-end">
            <Button variant="secondary" onClick={exportReport}>
              Export audit JSON
            </Button>
          </div>
          <AdvancedAuditContent
            dashboard={dashboard}
            summary={summary}
            visibility={visibility}
            filterOptions={filterOptions}
            filters={filters}
            activeTab={activeTab}
            results={results}
            context={context}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            onTabChange={setActiveTab}
          />
        </div>
      </details>
    </div>
  );
}

function AdvancedAuditContent({
  dashboard,
  summary,
  visibility,
  filterOptions,
  filters,
  activeTab,
  results,
  context,
  onFilterChange,
  onClearFilters,
  onTabChange,
}: {
  dashboard: ReturnType<typeof buildCurriculumCoverageDashboard>;
  summary: ReturnType<typeof computeCoverageSummary>;
  visibility: ReturnType<typeof countImportedOutcomeVisibility>;
  filterOptions: ReturnType<typeof buildCoverageFilterOptions>;
  filters: CoverageFilters;
  activeTab: CoverageMissingTab;
  results: ReturnType<typeof filterCoverageOutcomes>;
  context: ReturnType<typeof useTeacherContext>["context"];
  onFilterChange: <K extends keyof CoverageFilters>(key: K, value: CoverageFilters[K]) => void;
  onClearFilters: () => void;
  onTabChange: (tab: CoverageMissingTab) => void;
}) {
  return (
    <>
      <section className="mb-8 space-y-6">
        <Card>
          <CardHeader
            title="Curriculum layers"
            description="Three views of the same curriculum — raw imports, the planning catalogue teachers use, and strict knowledge-base alignment."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <LayerCard
              label="Raw import"
              value={dashboard.layerTotals.rawImport}
              detail="Records extracted from source documents"
            />
            <LayerCard
              label="Planning catalogue"
              value={dashboard.layerTotals.planningCatalogue}
              detail="Unique outcomes available for planning"
              highlight
            />
            <LayerCard
              label="KB strict alignment"
              value={dashboard.layerTotals.kbStrictAlignment}
              detail="Hand-authored outcomes for alignment testing"
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Pathway coverage"
            description="How well each curriculum pathway is populated in the catalogue."
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Pathway</th>
                  <th className="pb-2 pr-4 font-medium">Raw</th>
                  <th className="pb-2 pr-4 font-medium">Planning</th>
                  <th className="pb-2 pr-4 font-medium">KB</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.pathwayCoverage.map((row) => (
                  <tr key={row.pathwayId} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-800">{row.label}</p>
                      {row.note && <p className="mt-0.5 text-xs text-slate-500">{row.note}</p>}
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-slate-700">{row.rawCount}</td>
                    <td className="py-3 pr-4 tabular-nums text-slate-700">{row.planningCount}</td>
                    <td className="py-3 pr-4 tabular-nums text-slate-700">{row.kbCount}</td>
                    <td className="py-3">
                      <CatalogueStatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Year group coverage" description="Outcomes tagged to each year group in the planning catalogue." />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {dashboard.yearGroupCoverage.map((row) => (
                <div
                  key={row.yearGroup}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2"
                >
                  <p className="text-xs font-medium text-slate-600">{row.label}</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800">
                    {row.planningCount}
                  </p>
                  <div className="mt-1">
                    <CatalogueStatusBadge status={row.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Pathway × year heatmap"
              description="Imported outcome counts by pathway and year group. Darker cells mean more outcomes."
            />
            <PathwayYearHeatmap cells={dashboard.pathwayYearHeatmap} />
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Topic coverage"
            description="All imported curriculum topics and how many planning outcomes reference each."
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {dashboard.topicCoverage.map((row) => (
              <div
                key={row.topicId}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
              >
                <p className="truncate font-medium text-slate-800">{row.label}</p>
                <p className="mt-0.5 tabular-nums text-slate-600">{row.planningCount} outcomes</p>
                <div className="mt-1">
                  <CatalogueStatusBadge status={row.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Sport-specific coverage"
            description="Individual sports and activities — including thin sports and those that rely on fallback topics."
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Sport / activity</th>
                  <th className="pb-2 pr-4 font-medium">Outcomes</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.sportCoverage.map((row) => (
                  <tr key={row.topicId} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-slate-800">{row.label}</p>
                      {row.fallbackChain && row.fallbackChain.length > 0 && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Uses fallback: {row.fallbackChain.join(" → ")}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-slate-700">{row.planningCount}</td>
                    <td className="py-2.5">
                      <CatalogueStatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Metadata gaps"
              description="Imported records missing year groups, skills, or values tags."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryCard
                label="Missing year group"
                value={dashboard.metadataGaps.missingYearGroups}
                tone="amber"
              />
              <SummaryCard
                label="Missing skills"
                value={dashboard.metadataGaps.missingSkills}
                tone="amber"
              />
              <SummaryCard
                label="Missing values"
                value={dashboard.metadataGaps.missingValues}
                tone="amber"
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Based on {dashboard.metadataGaps.totalOutcomes} raw imported records. Use the filters
              below to review individual outcomes.
            </p>
          </Card>

          <Card>
            <CardHeader
              title="Catalogue gaps"
              description="Known gaps that need ministry review or further import work."
            />
            <ul className="space-y-3">
              {dashboard.catalogueGaps.map((gap) => (
                <li key={gap.id} className="rounded-lg border border-slate-200 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-800">{gap.title}</p>
                    <CatalogueStatusBadge status={gap.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{gap.detail}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Primary PE progression"
            description={`Structured catalogue for Years 1–6 — ${dashboard.primaryPE.totalOutcomes} outcomes (${dashboard.primaryPE.embeddedOutcomes} embedded fundamentals + ${dashboard.primaryPE.kbOutcomes} KB samples).`}
          />
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <CatalogueStatusBadge
              status={
                dashboard.primaryPE.overallStatus === "strong"
                  ? "strong"
                  : dashboard.primaryPE.overallStatus === "thin"
                    ? "thin"
                    : "needs-review"
              }
            />
            <span className="text-sm text-slate-600">
              Progression framework across FMS, movement competence, games foundations, health, and
              physical literacy.
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Progression strands
              </h4>
              <ul className="space-y-2">
                {dashboard.primaryPE.progressionCompleteness.map((row) => (
                  <li
                    key={row.strand}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-800">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-slate-600">{row.outcomeCount}</span>
                      <CatalogueStatusBadge status={row.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Learning domains
              </h4>
              <ul className="space-y-2">
                {dashboard.primaryPE.learningDomainCoverage.map((row) => (
                  <li
                    key={row.domain}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-800">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-slate-600">{row.outcomeCount}</span>
                      <CatalogueStatusBadge status={row.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Physical literacy
              </h4>
              <ul className="space-y-2">
                {dashboard.primaryPE.physicalLiteracyCoverage.map((row) => (
                  <li
                    key={row.attribute}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-800">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-slate-600">{row.outcomeCount}</span>
                      <CatalogueStatusBadge status={row.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {dashboard.primaryPE.yearCoverage.map((row) => (
              <div
                key={row.yearLabel}
                className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-center text-xs"
              >
                <p className="font-medium text-slate-700">{row.yearLabel}</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800">
                  {row.outcomeCount}
                </p>
                <div className="mt-1 flex justify-center">
                  <CatalogueStatusBadge status={row.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Fitness Curriculum coverage"
            description={`Structured catalogue for Years 7–11 — ${dashboard.fitnessPE.totalOutcomes} outcomes (${dashboard.fitnessPE.embeddedOutcomes} embedded syllabus + ${dashboard.fitnessPE.kbOutcomes} KB samples).`}
          />
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <CatalogueStatusBadge
              status={
                dashboard.fitnessPE.overallStatus === "strong"
                  ? "strong"
                  : dashboard.fitnessPE.overallStatus === "thin"
                    ? "thin"
                    : "needs-review"
              }
            />
            <span className="text-sm text-slate-600">
              Health and skill related fitness, training principles, methods, testing, and lifestyle.
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fitness categories
              </h4>
              <ul className="space-y-2">
                {dashboard.fitnessPE.categoryCoverage.map((row) => (
                  <li
                    key={row.category}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-800">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-slate-600">{row.outcomeCount}</span>
                      <CatalogueStatusBadge status={row.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Learning domains
              </h4>
              <ul className="space-y-2">
                {dashboard.fitnessPE.learningDomainCoverage.map((row) => (
                  <li
                    key={row.domain}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-800">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-slate-600">{row.outcomeCount}</span>
                      <CatalogueStatusBadge status={row.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Physical literacy
              </h4>
              <ul className="space-y-2">
                {dashboard.fitnessPE.physicalLiteracyCoverage.map((row) => (
                  <li
                    key={row.attribute}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-800">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-slate-600">{row.outcomeCount}</span>
                      <CatalogueStatusBadge status={row.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {dashboard.fitnessPE.yearCoverage.map((row) => (
              <div
                key={row.yearLabel}
                className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-center text-xs"
              >
                <p className="font-medium text-slate-700">{row.yearLabel}</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800">
                  {row.outcomeCount}
                </p>
                <div className="mt-1 flex justify-center">
                  <CatalogueStatusBadge status={row.status} />
                </div>
              </div>
            ))}
          </div>

          {dashboard.fitnessPE.gapAnalysis.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fitness gap analysis
              </h4>
              <ul className="space-y-2">
                {dashboard.fitnessPE.gapAnalysis.map((gap) => (
                  <li key={gap.id} className="rounded-lg border border-slate-200 px-3 py-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-800">{gap.title}</span>
                      <CatalogueStatusBadge
                        status={
                          gap.status === "needs-review"
                            ? "needs-review"
                            : gap.status === "missing"
                              ? "missing"
                              : "thin"
                        }
                      />
                    </div>
                    <p className="mt-1 text-slate-600">{gap.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </section>

      <section className="mb-8">
        <Card>
          <CardHeader
            title="SEC PE Option coverage"
            description={`Examination and curriculum intelligence — ${dashboard.secPE.totalOutcomes} outcomes (${dashboard.secPE.importedOutcomes} imported syllabus + ${dashboard.secPE.kbOutcomes} KB samples).`}
          />
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <CatalogueStatusBadge
              status={
                dashboard.secPE.overallStatus === "strong"
                  ? "strong"
                  : dashboard.secPE.overallStatus === "thin"
                    ? "thin"
                    : "needs-review"
              }
            />
            <span className="text-sm text-slate-600">Theory, practical, and revision readiness</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Topic coverage
              </h4>
              <table className="w-full text-sm">
                <tbody>
                  {dashboard.secPE.categoryCoverage.map((row) => (
                    <tr key={row.category} className="border-b border-slate-100">
                      <td className="py-2 pr-4 text-slate-700">{row.label}</td>
                      <td className="py-2 pr-4 tabular-nums text-slate-800">{row.outcomeCount}</td>
                      <td className="py-2">
                        <CatalogueStatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assessment coverage
              </h4>
              <table className="w-full text-sm">
                <tbody>
                  {dashboard.secPE.assessmentCoverage.map((row) => (
                    <tr key={row.relevance} className="border-b border-slate-100">
                      <td className="py-2 pr-4 text-slate-700">{row.label}</td>
                      <td className="py-2 pr-4 tabular-nums text-slate-800">{row.outcomeCount}</td>
                      <td className="py-2">
                        <CatalogueStatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Learning domains
              </h4>
              <table className="w-full text-sm">
                <tbody>
                  {dashboard.secPE.learningDomainCoverage.map((row) => (
                    <tr key={row.domain} className="border-b border-slate-100">
                      <td className="py-2 pr-4 text-slate-700">{row.label}</td>
                      <td className="py-2 pr-4 tabular-nums text-slate-800">{row.outcomeCount}</td>
                      <td className="py-2">
                        <CatalogueStatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Revision readiness
              </h4>
              <table className="w-full text-sm">
                <tbody>
                  {dashboard.secPE.revisionReadiness.map((row) => (
                    <tr key={row.category} className="border-b border-slate-100">
                      <td className="py-2 pr-4 text-slate-700">{row.label}</td>
                      <td className="py-2 pr-4 text-xs text-slate-600">
                        {row.coveredCount} covered · {row.plannedCount} planned · {row.notPlannedCount} not planned
                      </td>
                      <td className="py-2">
                        <CatalogueStatusBadge
                          status={
                            row.readiness === "ready"
                              ? "strong"
                              : row.readiness === "partial"
                                ? "thin"
                                : "missing"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {dashboard.secPE.gapAnalysis.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                SEC gap analysis
              </h4>
              <ul className="space-y-2">
                {dashboard.secPE.gapAnalysis.map((gap) => (
                  <li key={gap.id} className="rounded-lg border border-slate-200 px-3 py-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-800">{gap.title}</span>
                      <CatalogueStatusBadge
                        status={
                          gap.status === "needs-review"
                            ? "needs-review"
                            : gap.status === "missing"
                              ? "missing"
                              : "thin"
                        }
                      />
                    </div>
                    <p className="mt-1 text-slate-600">{gap.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </section>

      <section className="mb-8">
        <Card>
          <CardHeader
            title="Sport intelligence coverage"
            description={`Structured sport knowledge — ${dashboard.sportPE.totalSportOutcomes} outcomes across ${dashboard.sportPE.sportsTracked} activity areas.`}
          />
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <CatalogueStatusBadge
              status={
                dashboard.sportPE.overallStatus === "strong"
                  ? "strong"
                  : dashboard.sportPE.overallStatus === "thin"
                    ? "thin"
                    : "needs-review"
              }
            />
            <span className="text-sm text-slate-600">Skill depth, progression completeness, pedagogy mapping</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sport depth
              </h4>
              <table className="w-full text-sm">
                <tbody>
                  {dashboard.sportPE.sportDepth.map((row) => (
                    <tr key={row.sportId} className="border-b border-slate-100">
                      <td className="py-2 pr-4 text-slate-700">{row.label}</td>
                      <td className="py-2 pr-4 tabular-nums text-slate-800">{row.outcomeCount}</td>
                      <td className="py-2 pr-4 text-xs text-slate-600">
                        {row.skillsCovered}/{row.skillCount} skills · {row.progressionCompleteness}%
                      </td>
                      <td className="py-2">
                        <CatalogueStatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Skill coverage (sample)
              </h4>
              <table className="w-full text-sm">
                <tbody>
                  {dashboard.sportPE.skillCoverage
                    .filter((r) => r.status !== "strong")
                    .slice(0, 10)
                    .map((row) => (
                      <tr key={`${row.sportId}-${row.skillId}`} className="border-b border-slate-100">
                        <td className="py-2 pr-4 text-slate-700">
                          {row.sportLabel} — {row.skillLabel}
                        </td>
                        <td className="py-2 pr-4 tabular-nums text-slate-800">{row.outcomeCount}</td>
                        <td className="py-2">
                          <CatalogueStatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {dashboard.sportPE.gapAnalysis.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sport gap analysis
              </h4>
              <ul className="space-y-2">
                {dashboard.sportPE.gapAnalysis.map((gap) => (
                  <li key={gap.id} className="rounded-lg border border-slate-200 px-3 py-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-800">{gap.title}</span>
                      <CatalogueStatusBadge
                        status={
                          gap.status === "needs-review"
                            ? "needs-review"
                            : gap.status === "missing"
                              ? "missing"
                              : "thin"
                        }
                      />
                    </div>
                    <p className="mt-1 text-slate-600">{gap.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </section>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Outcome verification</h2>

      <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Imported curriculum data still needs human verification before being trusted for official
        planning.
      </p>

      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Visible outcomes" value={visibility.visible} tone="teal" />
        <SummaryCard label="Hidden outcomes" value={visibility.hidden} tone="amber" />
        <SummaryCard label="Total outcomes" value={visibility.total} />
      </section>

      <p className="mb-6 text-sm text-slate-500">
        Visibility for <span className="font-medium text-slate-700">{context.roleLabel}</span>
        {context.exploreAllEnabled ? " · Explore All enabled" : " · Intelligent Mode"}
      </p>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <SummaryCard label="Imported total" value={summary.totalOutcomes} tone="teal" />
        <SummaryCard label="Pathways covered" value={summary.pathwaysCovered} />
        <SummaryCard label="Year groups covered" value={summary.yearGroupsCovered} />
        <SummaryCard label="Topics covered" value={summary.topicsCovered} />
        <SummaryCard label="Missing year group" value={summary.missingYearGroup} tone="amber" />
        <SummaryCard label="Missing skill tags" value={summary.missingSkillTags} tone="amber" />
        <SummaryCard label="Missing values" value={summary.missingValues} tone="amber" />
      </section>

      <Card className="mb-6">
        <CardHeader title="Filters" description="Narrow the verification view. Outcomes with gaps remain visible." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FieldGroup label="Pathway">
            <Select
              value={filters.pathwayId}
              onChange={(e) => onFilterChange("pathwayId", e.target.value)}
            >
              <option value="">All pathways</option>
              {filterOptions.pathways.map((pathway) => (
                <option key={pathway.id} value={pathway.id}>
                  {pathway.label}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup label="Year group">
            <Select
              value={filters.yearGroup}
              onChange={(e) => onFilterChange("yearGroup", e.target.value)}
            >
              <option value="">All year groups</option>
              {filterOptions.yearGroups.map((yearGroup) => (
                <option key={yearGroup} value={yearGroup}>
                  {yearGroup}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup label="Topic">
            <Select value={filters.topic} onChange={(e) => onFilterChange("topic", e.target.value)}>
              <option value="">All topics</option>
              {filterOptions.topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup label="Skill">
            <Select value={filters.skill} onChange={(e) => onFilterChange("skill", e.target.value)}>
              <option value="">All skills</option>
              {filterOptions.skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup label="Source document">
            <Select
              value={filters.sourceDocument}
              onChange={(e) => onFilterChange("sourceDocument", e.target.value)}
            >
              <option value="">All sources</option>
              {filterOptions.sourceDocuments.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup label="Search text">
            <Input
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              placeholder="Code, description, topic, skill, source…"
            />
          </FieldGroup>
        </div>

        <div className="mt-4">
          <Button variant="ghost" onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {MISSING_TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "primary" : "secondary"}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Results"
          description={`Showing ${results.length} outcome${results.length === 1 ? "" : "s"}. Nothing is hidden because of missing metadata.`}
        />

        {results.length === 0 ? (
          <p className="text-sm text-slate-500">No outcomes match the current filters.</p>
        ) : (
          <div className="space-y-3">
            {results.map((outcome) => (
              <OutcomeCard key={outcome.id} outcome={outcome} />
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

function LayerCard({
  label,
  value,
  detail,
  highlight = false,
}: {
  label: string;
  value: number;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        highlight ? "border-teal-200 bg-teal-50/40" : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${highlight ? "text-teal-800" : "text-slate-800"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "teal" | "amber" | "slate";
}) {
  const toneClass =
    tone === "teal"
      ? "text-teal-700"
      : tone === "amber"
        ? "text-amber-800"
        : "text-slate-800";

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </Card>
  );
}

function OutcomeCard({
  outcome,
}: {
  outcome: ReturnType<typeof filterCoverageOutcomes>[number];
}) {
  const missingFlags = [
    isMissingYearGroup(outcome) && "No year group",
    isMissingTopic(outcome) && "No topic",
    isMissingSkills(outcome) && "No skills",
    isMissingValues(outcome) && "No values",
  ].filter(Boolean) as string[];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-teal-700">{outcome.code}</span>
            <span className="text-xs text-slate-400">{outcome.id}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">{outcome.description}</p>
        </div>
        {missingFlags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {missingFlags.map((flag) => (
              <Badge key={flag} tone="amber">
                {flag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Pathway" value={outcome.pathwayLabel || outcome.pathwayId} />
        <Detail label="Year group" value={formatOutcomeYearGroups(outcome)} warn={isMissingYearGroup(outcome)} />
        <Detail label="Topic" value={formatOutcomeTopic(outcome)} warn={isMissingTopic(outcome)} />
        <Detail label="Skill tags" value={formatOutcomeSkills(outcome)} warn={isMissingSkills(outcome)} />
        <Detail label="Value tags" value={formatOutcomeValues(outcome)} warn={isMissingValues(outcome)} />
        <Detail label="Source document" value={formatOutcomeSource(outcome)} className="sm:col-span-2 lg:col-span-3" />
      </dl>
    </article>
  );
}

function Detail({
  label,
  value,
  warn = false,
  className = "",
}: {
  label: string;
  value: string;
  warn?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-0.5 ${warn ? "text-amber-800" : "text-slate-700"}`}>{value}</dd>
    </div>
  );
}
