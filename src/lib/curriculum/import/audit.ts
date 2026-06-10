import fs from "node:fs/promises";
import path from "node:path";
import { KNOWN_PATHWAYS } from "./config";
import type {
  ImportedLearningOutcomeRecord,
  ImportedPathwayRecord,
  ImportedSkillRecord,
  ImportedTopicRecord,
  ImportedValueRecord,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "src", "lib", "curriculum", "data");
const REPORT_JSON = path.join(DATA_DIR, "audit-report.json");
const REPORT_MD = path.join(process.cwd(), "curriculum-audit.md");

const WEAK_COVERAGE_THRESHOLD = 25;
const GENERIC_TOPIC_IDS = new Set(["general", "alp-curriculum", "im-syllabus"]);

export interface AuditIssue {
  id: string;
  code: string;
  pathwayId: string;
  pathwayLabel: string;
  reason: string;
  sourceFile: string;
}

export interface DuplicateGroup {
  key: string;
  matchType: "code" | "description";
  count: number;
  outcomeIds: string[];
  codes: string[];
  pathwayIds: string[];
}

export interface WeakPathwayCoverage {
  pathwayId: string;
  pathwayLabel: string;
  outcomeCount: number;
  reason: string;
  recommendations: string[];
}

export interface CurriculumAuditReport {
  auditedAt: string;
  dataDirectory: string;
  importManifest: {
    importedAt: string | null;
    sourceFileCount: number;
    ignoredFileCount: number;
  };
  summary: {
    totalOutcomes: number;
    totalTopics: number;
    totalSkills: number;
    totalValueRecords: number;
    pathwayCount: number;
  };
  counts: {
    byPathway: { id: string; label: string; count: number }[];
    byYearGroup: { yearGroup: string; count: number }[];
    byTopic: { topicId: string; topic: string; count: number }[];
    bySkill: { skillId: string; skill: string; count: number }[];
    byValueTheme: { theme: string; outcomeCount: number; valueRecordCount: number }[];
  };
  issues: {
    duplicateOutcomes: DuplicateGroup[];
    missingYearGroups: AuditIssue[];
    missingTopics: AuditIssue[];
    missingSkills: AuditIssue[];
    missingValues: AuditIssue[];
    weakPathwayCoverage: WeakPathwayCoverage[];
    absentPathways: { pathwayId: string; label: string; reason: string }[];
  };
}

async function readJson<T>(fileName: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_DIR, fileName), "utf8");
  return JSON.parse(raw) as T;
}

function normaliseDescription(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function countByKey<T>(
  items: T[],
  keyFn: (item: T) => string | string[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const keys = keyFn(item);
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const key of keyList) {
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

function findDuplicateCodes(
  outcomes: ImportedLearningOutcomeRecord[]
): DuplicateGroup[] {
  const byCode = new Map<string, ImportedLearningOutcomeRecord[]>();
  for (const outcome of outcomes) {
    const list = byCode.get(outcome.code) ?? [];
    list.push(outcome);
    byCode.set(outcome.code, list);
  }

  return [...byCode.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([code, group]) => ({
      key: code,
      matchType: "code" as const,
      count: group.length,
      outcomeIds: group.map((o) => o.id),
      codes: [code],
      pathwayIds: [...new Set(group.map((o) => o.pathwayId))],
    }))
    .sort((a, b) => b.count - a.count);
}

function findDuplicateDescriptions(
  outcomes: ImportedLearningOutcomeRecord[]
): DuplicateGroup[] {
  const byDescription = new Map<string, ImportedLearningOutcomeRecord[]>();
  for (const outcome of outcomes) {
    const key = normaliseDescription(outcome.description);
    if (key.length < 24) continue;
    const list = byDescription.get(key) ?? [];
    list.push(outcome);
    byDescription.set(key, list);
  }

  return [...byDescription.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([description, group]) => ({
      key: description.slice(0, 120),
      matchType: "description" as const,
      count: group.length,
      outcomeIds: group.map((o) => o.id),
      codes: group.map((o) => o.code),
      pathwayIds: [...new Set(group.map((o) => o.pathwayId))],
    }))
    .sort((a, b) => b.count - a.count);
}

function toAuditIssue(
  outcome: ImportedLearningOutcomeRecord,
  reason: string
): AuditIssue {
  return {
    id: outcome.id,
    code: outcome.code,
    pathwayId: outcome.pathwayId,
    pathwayLabel: outcome.pathwayLabel,
    reason,
    sourceFile: outcome.sourceFile,
  };
}

function isTopicMissing(outcome: ImportedLearningOutcomeRecord): boolean {
  if (!outcome.topic?.trim() || !outcome.topicId?.trim()) return true;
  if (GENERIC_TOPIC_IDS.has(outcome.topicId)) return true;
  return false;
}

function assessWeakPathways(
  pathways: ImportedPathwayRecord[],
  outcomes: ImportedLearningOutcomeRecord[]
): {
  weak: WeakPathwayCoverage[];
  absent: { pathwayId: string; label: string; reason: string }[];
} {
  const weak: WeakPathwayCoverage[] = [];
  const presentIds = new Set(pathways.map((p) => p.id));

  for (const pathway of pathways) {
    const reasons: string[] = [];
    const recommendations: string[] = [];

    if (pathway.learningOutcomeCount < WEAK_COVERAGE_THRESHOLD) {
      reasons.push(
        `Only ${pathway.learningOutcomeCount} outcomes (threshold: ${WEAK_COVERAGE_THRESHOLD}).`
      );
    }

    const pathwayOutcomes = outcomes.filter((o) => o.pathwayId === pathway.id);
    const withoutYears = pathwayOutcomes.filter((o) => o.yearGroups.length === 0).length;
    const withoutSkills = pathwayOutcomes.filter((o) => o.skillIds.length === 0).length;
    const withoutValues = pathwayOutcomes.filter((o) => o.values.length === 0).length;

    if (withoutYears === pathwayOutcomes.length && pathwayOutcomes.length > 0) {
      reasons.push(`All ${pathwayOutcomes.length} outcomes lack year groups.`);
      recommendations.push("Map year groups from source documents or import-sources.json defaults.");
    } else if (withoutYears / Math.max(pathwayOutcomes.length, 1) > 0.8) {
      reasons.push(`${withoutYears} of ${pathwayOutcomes.length} outcomes lack year groups.`);
      recommendations.push("Assign default year groups in import-sources.json for this pathway.");
    }

    if (pathway.id === "pe-option-sec" && pathway.learningOutcomeCount <= 10) {
      reasons.push("SEC syllabus deduplication may be collapsing multi-year LO variants.");
      recommendations.push("Verify SEC32 PDF extraction retains all 10 subject-focus outcomes per cycle.");
    }

    if (pathway.id === "fitness-curriculum") {
      reasons.push("Fitness source PDFs failed import — no outcomes loaded.");
      recommendations.push("Add parseable fitness framework PDF or extract F7–F11 codes from PE syllabus only.");
    }

    if (reasons.length > 0) {
      weak.push({
        pathwayId: pathway.id,
        pathwayLabel: pathway.label,
        outcomeCount: pathway.learningOutcomeCount,
        reason: reasons.join(" "),
        recommendations: [...new Set(recommendations)],
      });
    }
  }

  const absent = Object.entries(KNOWN_PATHWAYS)
    .filter(([id]) => !presentIds.has(id))
    .map(([pathwayId, meta]) => ({
      pathwayId,
      label: meta.label,
      reason:
        pathwayId === "middle-school-pe"
          ? "IM 36 sources intentionally excluded (scope up to Form 5)."
          : pathwayId === "fitness-curriculum"
            ? "Fitness PDFs present but produced zero extractable outcomes."
            : pathwayId === "primary-pe"
              ? "Primary outcomes may be embedded in Secondary PE syllabus (F2–F6 codes) without a dedicated pathway split."
              : "No imported outcomes tagged to this pathway.",
    }));

  return { weak, absent };
}

export function runCurriculumAudit(
  outcomes: ImportedLearningOutcomeRecord[],
  topics: ImportedTopicRecord[],
  skills: ImportedSkillRecord[],
  valueRecords: ImportedValueRecord[],
  pathways: ImportedPathwayRecord[],
  manifest: { importedAt?: string; sourceFiles?: string[]; ignoredFiles?: string[] } | null
): CurriculumAuditReport {
  const pathwayCounts = countByKey(outcomes, (o) => o.pathwayId);
  const yearGroupCounts = countByKey(outcomes, (o) => o.yearGroups);
  const topicCounts = countByKey(outcomes, (o) => o.topicId);
  const skillCounts = countByKey(outcomes, (o) => o.skillIds);

  const valueThemeOutcomeCounts = new Map<string, number>();
  for (const outcome of outcomes) {
    const themes = new Set(outcome.values.map((v) => v.theme));
    for (const theme of themes) {
      valueThemeOutcomeCounts.set(theme, (valueThemeOutcomeCounts.get(theme) ?? 0) + 1);
    }
  }

  const valueThemeRecordCounts = countByKey(valueRecords, (v) => v.theme);

  const allThemes = new Set([
    ...valueThemeOutcomeCounts.keys(),
    ...valueThemeRecordCounts.keys(),
  ]);

  const duplicateCodes = findDuplicateCodes(outcomes);
  const duplicateDescriptions = findDuplicateDescriptions(outcomes).filter(
    (group) => !duplicateCodes.some((codeGroup) => codeGroup.key === group.codes[0])
  );

  const missingYearGroups = outcomes
    .filter((o) => o.yearGroups.length === 0)
    .map((o) => toAuditIssue(o, "No year groups assigned."));

  const missingTopics = outcomes
    .filter(isTopicMissing)
    .map((o) => toAuditIssue(o, `Topic missing or generic (${o.topicId || "none"}).`));

  const missingSkills = outcomes
    .filter((o) => o.skillIds.length === 0)
    .map((o) => toAuditIssue(o, "No skills inferred or declared."));

  const missingValues = outcomes
    .filter((o) => o.values.length === 0)
    .map((o) => toAuditIssue(o, "No values linked to outcome."));

  const { weak, absent } = assessWeakPathways(pathways, outcomes);

  const pathwayLabelById = new Map(pathways.map((p) => [p.id, p.label]));
  const topicNameById = new Map(topics.map((t) => [t.id, t.name]));
  const skillNameById = new Map(skills.map((s) => [s.id, s.name]));

  return {
    auditedAt: new Date().toISOString(),
    dataDirectory: DATA_DIR,
    importManifest: {
      importedAt: manifest?.importedAt ?? null,
      sourceFileCount: manifest?.sourceFiles?.length ?? 0,
      ignoredFileCount: manifest?.ignoredFiles?.length ?? 0,
    },
    summary: {
      totalOutcomes: outcomes.length,
      totalTopics: topics.length,
      totalSkills: skills.length,
      totalValueRecords: valueRecords.length,
      pathwayCount: pathways.length,
    },
    counts: {
      byPathway: [...pathwayCounts.entries()]
        .map(([id, count]) => ({
          id,
          label: pathwayLabelById.get(id) ?? id,
          count,
        }))
        .sort((a, b) => b.count - a.count),
      byYearGroup: [...yearGroupCounts.entries()]
        .map(([yearGroup, count]) => ({ yearGroup, count }))
        .sort((a, b) => a.yearGroup.localeCompare(b.yearGroup)),
      byTopic: [...topicCounts.entries()]
        .map(([topicId, count]) => ({
          topicId,
          topic: topicNameById.get(topicId) ?? topicId,
          count,
        }))
        .sort((a, b) => b.count - a.count),
      bySkill: [...skillCounts.entries()]
        .map(([skillId, count]) => ({
          skillId,
          skill: skillNameById.get(skillId) ?? skillId,
          count,
        }))
        .sort((a, b) => b.count - a.count),
      byValueTheme: [...allThemes]
        .map((theme) => ({
          theme,
          outcomeCount: valueThemeOutcomeCounts.get(theme) ?? 0,
          valueRecordCount: valueThemeRecordCounts.get(theme) ?? 0,
        }))
        .sort((a, b) => b.outcomeCount - a.outcomeCount),
    },
    issues: {
      duplicateOutcomes: [...duplicateCodes, ...duplicateDescriptions],
      missingYearGroups,
      missingTopics,
      missingSkills,
      missingValues,
      weakPathwayCoverage: weak,
      absentPathways: absent,
    },
  };
}

function formatTable(rows: string[][]): string {
  if (rows.length === 0) return "_None._\n";
  const widths = rows[0].map((_, col) =>
    Math.max(...rows.map((row) => row[col]?.length ?? 0))
  );
  const divider = widths.map((w) => "-".repeat(w)).join(" | ");
  const header = rows[0].map((cell, i) => cell.padEnd(widths[i])).join(" | ");
  const body = rows
    .slice(1)
    .map((row) => row.map((cell, i) => cell.padEnd(widths[i])).join(" | "))
    .join("\n");
  return `${header}\n${divider}\n${body}\n`;
}

export function renderAuditMarkdown(report: CurriculumAuditReport): string {
  const lines: string[] = [
    "# Curriculum Audit Report",
    "",
    `**Audited:** ${report.auditedAt}`,
    `**Import snapshot:** ${report.importManifest.importedAt ?? "unknown"}`,
    `**Data directory:** \`${report.dataDirectory}\``,
    "",
    "## Summary",
    "",
    `- **Total learning outcomes:** ${report.summary.totalOutcomes}`,
    `- **Pathways with data:** ${report.summary.pathwayCount}`,
    `- **Topics:** ${report.summary.totalTopics}`,
    `- **Skills:** ${report.summary.totalSkills}`,
    `- **Value records:** ${report.summary.totalValueRecords}`,
    `- **Source files processed:** ${report.importManifest.sourceFileCount}`,
    `- **Ignored files:** ${report.importManifest.ignoredFileCount}`,
    "",
    "## Outcome counts by pathway",
    "",
    formatTable([
      ["Pathway", "Outcomes"],
      ...report.counts.byPathway.map((row) => [row.label, String(row.count)]),
    ]),
    "## Outcome counts by year group",
    "",
    formatTable([
      ["Year group", "Outcomes"],
      ...report.counts.byYearGroup.map((row) => [row.yearGroup, String(row.count)]),
    ]),
    "## Outcome counts by topic",
    "",
    formatTable([
      ["Topic", "Outcomes"],
      ...report.counts.byTopic.map((row) => [row.topic, String(row.count)]),
    ]),
    "## Outcome counts by skill",
    "",
    report.counts.bySkill.length > 0
      ? formatTable([
          ["Skill", "Outcomes"],
          ...report.counts.bySkill.map((row) => [row.skill, String(row.count)]),
        ])
      : "_No skills linked to outcomes._\n",
    "## Outcome counts by value theme",
    "",
    report.counts.byValueTheme.length > 0
      ? formatTable([
          ["Theme", "Outcomes", "Value records"],
          ...report.counts.byValueTheme.map((row) => [
            row.theme,
            String(row.outcomeCount),
            String(row.valueRecordCount),
          ]),
        ])
      : "_No values linked to outcomes._\n",
    "## Issues",
    "",
    "### Duplicate outcomes",
    "",
  ];

  if (report.issues.duplicateOutcomes.length === 0) {
    lines.push("No duplicate codes or descriptions detected.\n");
  } else {
    for (const group of report.issues.duplicateOutcomes.slice(0, 15)) {
      lines.push(
        `- **${group.matchType}** \`${group.key}\` — ${group.count} records across pathways: ${group.pathwayIds.join(", ")}`
      );
    }
    if (report.issues.duplicateOutcomes.length > 15) {
      lines.push(`- _…and ${report.issues.duplicateOutcomes.length - 15} more (see audit-report.json)._`);
    }
    lines.push("");
  }

  lines.push("### Outcomes missing year groups", "");
  lines.push(`**${report.issues.missingYearGroups.length}** outcomes without year groups.`);
  if (report.issues.missingYearGroups.length > 0) {
    const byPathway = countByKey(report.issues.missingYearGroups, (i) => i.pathwayId);
    for (const [pathwayId, count] of [...byPathway.entries()].sort((a, b) => b[1] - a[1])) {
      const label = report.counts.byPathway.find((p) => p.id === pathwayId)?.label ?? pathwayId;
      lines.push(`- ${label}: ${count}`);
    }
  }
  lines.push("");

  lines.push("### Outcomes missing topics", "");
  lines.push(`**${report.issues.missingTopics.length}** outcomes with missing or generic topics.`);
  lines.push("");

  lines.push("### Outcomes missing skills", "");
  lines.push(`**${report.issues.missingSkills.length}** outcomes without skills.`);
  if (report.issues.missingSkills.length > 0) {
    const byPathway = countByKey(report.issues.missingSkills, (i) => i.pathwayId);
    for (const [pathwayId, count] of [...byPathway.entries()].sort((a, b) => b[1] - a[1])) {
      const label = report.counts.byPathway.find((p) => p.id === pathwayId)?.label ?? pathwayId;
      lines.push(`- ${label}: ${count}`);
    }
  }
  lines.push("");

  lines.push("### Outcomes missing values", "");
  lines.push(`**${report.issues.missingValues.length}** outcomes without linked values.`);
  lines.push("");

  lines.push("### Pathways with weak coverage", "");
  if (report.issues.weakPathwayCoverage.length === 0) {
    lines.push("No pathways flagged below coverage threshold.\n");
  } else {
    for (const item of report.issues.weakPathwayCoverage) {
      lines.push(`#### ${item.pathwayLabel} (${item.outcomeCount} outcomes)`);
      lines.push(`- ${item.reason}`);
      for (const rec of item.recommendations) {
        lines.push(`- _Recommendation:_ ${rec}`);
      }
      lines.push("");
    }
  }

  lines.push("### Absent pathways (no imported data)", "");
  if (report.issues.absentPathways.length === 0) {
    lines.push("All known pathways have imported outcomes.\n");
  } else {
    for (const item of report.issues.absentPathways) {
      lines.push(`- **${item.label}** (\`${item.pathwayId}\`): ${item.reason}`);
    }
    lines.push("");
  }

  lines.push("---", "", "_Generated by `npm run audit-curriculum`. Audit-only — imported data was not modified._");

  return lines.join("\n");
}

export async function writeCurriculumAuditReports(): Promise<CurriculumAuditReport> {
  const [outcomes, topics, skills, valueRecords, pathways, manifest] =
    await Promise.all([
      readJson<ImportedLearningOutcomeRecord[]>("imported-learning-outcomes.json"),
      readJson<ImportedTopicRecord[]>("imported-topics.json"),
      readJson<ImportedSkillRecord[]>("imported-skills.json"),
      readJson<ImportedValueRecord[]>("imported-values.json"),
      readJson<ImportedPathwayRecord[]>("imported-pathways.json"),
      readJson<{
        importedAt?: string;
        sourceFiles?: string[];
        ignoredFiles?: string[];
      }>("import-manifest.json").catch(() => null),
    ]);

  const report = runCurriculumAudit(
    outcomes,
    topics,
    skills,
    valueRecords,
    pathways,
    manifest
  );

  await fs.writeFile(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await fs.writeFile(REPORT_MD, `${renderAuditMarkdown(report)}\n`, "utf8");

  return report;
}
