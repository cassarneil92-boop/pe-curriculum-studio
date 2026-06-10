import fs from "node:fs/promises";
import path from "node:path";
import { readPdfText } from "../src/lib/curriculum/import/parse-pdf";
import type { ImportedLearningOutcomeRecord } from "../src/lib/curriculum/import/types";
import { OFFICIAL_CURRICULUM_EXPECTATIONS } from "../src/lib/intelligence/frameworks/curriculum-expectations";
import { normaliseTopicId } from "../src/lib/curriculum/import/utils";

const PDF_PATH = path.join(
  process.cwd(),
  "data/curriculum-pdfs/PE_syllabus_Learning_Outcomes_latest.pdf"
);
const IMPORT_PATH = path.join(
  process.cwd(),
  "src/lib/curriculum/data/imported-learning-outcomes.json"
);
const REPORT_PATH = path.join(process.cwd(), "curriculum-completeness-report.md");

const CODE_PATTERN = /\b([A-Z]{1,2}\d+)\.(\d+[a-z]?)\b/g;

const PE_CODE_PREFIXES =
  /^(A|D|F|G|GY|HD|IG|MA|NG|OR|S|SF)\d/i;

interface TopicAuditRow {
  label: string;
  expected: number;
  imported: number;
  missing: string[];
  duplicates: string[];
}

function outcomeTopicIds(outcome: ImportedLearningOutcomeRecord): string[] {
  const ids = new Set<string>();
  if (outcome.topicId) ids.add(normaliseTopicId(outcome.topicId));
  if (outcome.topic) ids.add(normaliseTopicId(outcome.topic));
  for (const topic of outcome.topics ?? []) {
    ids.add(normaliseTopicId(topic));
  }
  return [...ids];
}

function matchesExpectation(
  outcome: ImportedLearningOutcomeRecord,
  topicIds: string[]
): boolean {
  const outcomeTopics = outcomeTopicIds(outcome);
  return topicIds.some((id) => outcomeTopics.includes(normaliseTopicId(id)));
}

async function main() {
  const [{ text }, importedRaw] = await Promise.all([
    readPdfText(PDF_PATH),
    fs.readFile(IMPORT_PATH, "utf8"),
  ]);

  const pdfCodes = new Set<string>();
  for (const match of text.replace(/\s+/g, " ").matchAll(CODE_PATTERN)) {
    pdfCodes.add(`${match[1]}.${match[2]}`);
  }

  const imported = JSON.parse(importedRaw) as ImportedLearningOutcomeRecord[];
  const peImported = imported.filter((o) =>
    /PE_syllabus_Learning_Outcomes/i.test(o.sourceFile ?? "")
  );

  const importedByCode = new Map<string, ImportedLearningOutcomeRecord[]>();
  for (const outcome of peImported) {
    const list = importedByCode.get(outcome.code) ?? [];
    list.push(outcome);
    importedByCode.set(outcome.code, list);
  }

  const importedCodes = new Set(peImported.map((o) => o.code));
  const missingCodes = [...pdfCodes].filter((c) => !importedCodes.has(c)).sort();
  const duplicateCodes = [...importedByCode.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([code]) => code)
    .sort();

  const topicRows: TopicAuditRow[] = OFFICIAL_CURRICULUM_EXPECTATIONS.map(
    (expectation) => {
      const matching = peImported.filter((o) =>
        matchesExpectation(o, expectation.topicIds)
      );
      const codes = matching.map((o) => o.code);
      const codeDuplicates = codes.filter(
        (code, index) => codes.indexOf(code) !== index
      );

      return {
        label: expectation.label,
        expected: expectation.minOutcomes ?? 0,
        imported: matching.length,
        missing: [],
        duplicates: [...new Set(codeDuplicates)],
      };
    }
  );

  const metadataIssues: string[] = [];
  for (const outcome of peImported) {
    if (!outcome.pathwayId) metadataIssues.push(`${outcome.code}: missing pathwayId`);
    if (!outcome.topicId) metadataIssues.push(`${outcome.code}: missing topicId`);
    if (!outcome.skillIds?.length) metadataIssues.push(`${outcome.code}: missing skillIds`);
    if (PE_CODE_PREFIXES.test(outcome.code) && !outcome.yearGroups?.length) {
      metadataIssues.push(`${outcome.code}: missing yearGroups`);
    }
  }

  const totalOfficial = pdfCodes.size;
  const totalImportedPe = peImported.length;
  const totalMissing = missingCodes.length;
  const completenessPct =
    totalOfficial === 0
      ? 0
      : Math.round(((totalOfficial - totalMissing) / totalOfficial) * 10000) / 100;

  const lines: string[] = [
    "# Curriculum Completeness Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Executive summary",
    "",
    `| Metric | Count |`,
    `|--------|------:|`,
    `| Total official PE syllabus outcomes (PDF codes) | ${totalOfficial} |`,
    `| Imported PE syllabus outcomes | ${totalImportedPe} |`,
    `| Missing official codes | ${totalMissing} |`,
    `| Duplicate imported codes | ${duplicateCodes.length} |`,
    `| **Completeness** | **${completenessPct}%** |`,
    "",
    "## Missing official learning outcome codes",
    "",
    ...(missingCodes.length
      ? missingCodes.map((code) => `- \`${code}\``)
      : ["- None — all official PE syllabus codes are imported."]),
    "",
    "## Duplicate imported codes",
    "",
    ...(duplicateCodes.length
      ? duplicateCodes.map((code) => `- \`${code}\` (${importedByCode.get(code)!.length} records)`)
      : ["- None detected."]),
    "",
    "## Topic area verification",
    "",
    "| Topic | Expected min | Imported | Duplicates | Status |",
    "|-------|-------------:|---------:|------------|--------|",
  ];

  for (const row of topicRows) {
    const status =
      row.imported === 0
        ? "MISSING"
        : row.expected > 0 && row.imported < row.expected
          ? "PARTIAL"
          : "PRESENT";
    lines.push(
      `| ${row.label} | ${row.expected || "—"} | ${row.imported} | ${row.duplicates.length} | ${status} |`
    );
  }

  lines.push(
    "",
    "## Metadata verification",
    "",
    `- Records missing pathwayId: **${metadataIssues.filter((m) => m.includes("pathwayId")).length}**`,
    `- Records missing topicId: **${metadataIssues.filter((m) => m.includes("topicId")).length}**`,
    `- Records missing skillIds: **${metadataIssues.filter((m) => m.includes("skillIds")).length}**`,
    `- Records missing yearGroups: **${metadataIssues.filter((m) => m.includes("yearGroups")).length}**`,
    "",
    "## Primary curriculum areas",
    "",
    "- Fundamentals (F2/F4/F6)",
    "- Athletics (A)",
    "- Gymnastics (GY)",
    "- Educational Dance (D)",
    "- Games (G)",
    "- Outdoor Recreation (OR primary levels 2/4/6)",
    "",
    "## Secondary curriculum areas",
    "",
    "- Fitness (F7+)",
    "- Individual Activities (A/GY/D/MA/S secondary levels)",
    "- Team Games (IG/NG)",
    "- Outdoor Recreation (OR7+)",
    "- Holistic Development (HD)",
    "",
    "## Notes",
    "",
    "- Official source: `data/curriculum-pdfs/PE_syllabus_Learning_Outcomes_latest.pdf`",
    "- Generic IG/NG outcomes are tagged with applicable sports via the official pedagogical model table (`topics` metadata).",
    "- Sport-specific topic matching includes `topicId`, `topic`, and `topics` fields.",
    "- Non-PE syllabus imports (ALP DOCX, fitness outlook, etc.) are excluded from code-level completeness.",
    ""
  );

  if (metadataIssues.length > 0 && metadataIssues.length <= 30) {
    lines.push("### Metadata issue samples", "");
    for (const issue of metadataIssues.slice(0, 30)) {
      lines.push(`- ${issue}`);
    }
    lines.push("");
  }

  await fs.writeFile(REPORT_PATH, lines.join("\n"), "utf8");
  console.log(`Report written: ${REPORT_PATH}`);
  console.log(`Completeness: ${completenessPct}% (${totalOfficial - totalMissing}/${totalOfficial})`);
  console.log(`Missing codes: ${totalMissing}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
