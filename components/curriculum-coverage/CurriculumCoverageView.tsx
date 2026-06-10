"use client";

import { useMemo, useState } from "react";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldGroup, Input, Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  buildCoverageFilterOptions,
  buildCoverageReport,
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
  const { context } = useTeacherContext();
  const [filters, setFilters] = useState<CoverageFilters>(EMPTY_FILTERS);
  const [activeTab, setActiveTab] = useState<CoverageMissingTab>("all");

  const summary = useMemo(() => computeCoverageSummary(), []);
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
        title="Curriculum Coverage"
        description="Verify imported learning outcomes are visible and searchable across pathways, years, topics and skills."
        action={
          <Button variant="secondary" onClick={exportReport}>
            Export audit JSON
          </Button>
        }
      />

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
              onChange={(e) => updateFilter("pathwayId", e.target.value)}
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
              onChange={(e) => updateFilter("yearGroup", e.target.value)}
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
            <Select value={filters.topic} onChange={(e) => updateFilter("topic", e.target.value)}>
              <option value="">All topics</option>
              {filterOptions.topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup label="Skill">
            <Select value={filters.skill} onChange={(e) => updateFilter("skill", e.target.value)}>
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
              onChange={(e) => updateFilter("sourceDocument", e.target.value)}
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
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Code, description, topic, skill, source…"
            />
          </FieldGroup>
        </div>

        <div className="mt-4">
          <Button variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {MISSING_TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "primary" : "secondary"}
            onClick={() => setActiveTab(tab.id)}
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
