import { IMPORTED_LEARNING_OUTCOMES } from "../coverage/coverage-engine";
import { LEARNING_OUTCOMES } from "../learning-outcomes";
import type { ImportedLearningOutcomeRecord } from "../import/types";
import type { LearningOutcome } from "../types";
import { enhanceImportedOutcome, enhanceKnowledgeBaseOutcome } from "./enhance";
import { inferSkillIdsFromText } from "./infer-skills";
import { METADATA_SKILL_PATTERNS } from "./skill-patterns";

export interface TopicAuditRow {
  topicId: string;
  topicName: string;
  pathwayId: string;
  yearGroups: string[];
  outcomeCount: number;
  currentSkillIds: string[];
  inferredMissingSkillIds: string[];
  sourceDocuments: string[];
  flags: string[];
}

export interface MetadataAuditReport {
  auditedAt: string;
  totals: {
    knowledgeBaseOutcomes: number;
    importedOutcomes: number;
    combinedOutcomes: number;
    enhancedImported: number;
    enhancedKnowledgeBase: number;
    missingSkillIds: number;
    emptyTopicIds: number;
    underTaggedTopics: number;
  };
  skillsAddedToRegistry: string[];
  topicRows: TopicAuditRow[];
  underTaggedTopics: TopicAuditRow[];
  manualReviewItems: string[];
}

function normaliseTopicId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function topicLabel(topicId: string, topic?: string): string {
  return topic?.trim() || topicId;
}

function collectTopicRows(
  outcomes: Array<{
    id: string;
    description: string;
    pathwayId: string;
    topicId: string;
    topic?: string;
    yearGroups?: string[];
    skillIds?: string[];
    sourceFile?: string;
    sourceDocument?: string;
  }>
): TopicAuditRow[] {
  const groups = new Map<string, TopicAuditRow>();

  for (const outcome of outcomes) {
    const topicId = normaliseTopicId(outcome.topicId || "unknown");
    const key = `${outcome.pathwayId}::${topicId}`;

    const existing = groups.get(key) ?? {
      topicId,
      topicName: topicLabel(topicId, outcome.topic),
      pathwayId: outcome.pathwayId,
      yearGroups: [],
      outcomeCount: 0,
      currentSkillIds: [],
      inferredMissingSkillIds: [],
      sourceDocuments: [],
      flags: [],
    };

    existing.outcomeCount += 1;
    existing.yearGroups = [
      ...new Set([...existing.yearGroups, ...(outcome.yearGroups ?? [])]),
    ].sort();
    existing.currentSkillIds = [
      ...new Set([
        ...existing.currentSkillIds,
        ...(outcome.skillIds ?? []).map((id) => id.toLowerCase()),
      ]),
    ].sort();
    const inferred = inferSkillIdsFromText(outcome.description, outcome.skillIds ?? []);
    const missing = inferred.filter(
      (id) => !(outcome.skillIds ?? []).map((s) => s.toLowerCase()).includes(id)
    );
    existing.inferredMissingSkillIds = [
      ...new Set([...existing.inferredMissingSkillIds, ...missing]),
    ].sort();

    const source = outcome.sourceDocument ?? outcome.sourceFile;
    if (source && !existing.sourceDocuments.includes(source)) {
      existing.sourceDocuments.push(source);
    }

    if (!outcome.topicId?.trim()) existing.flags.push("missing-topic-id");
    if (!outcome.skillIds || outcome.skillIds.length === 0) {
      existing.flags.push("outcomes-without-skills");
    }

    groups.set(key, existing);
  }

  const rows = [...groups.values()];
  for (const row of rows) {
    row.flags = [...new Set(row.flags)];
    if (row.currentSkillIds.length <= 1 && row.inferredMissingSkillIds.length >= 2) {
      row.flags.push("single-skill-but-text-suggests-more");
    }
    if (row.inferredMissingSkillIds.length > 0) {
      row.flags.push("likely-missing-skills");
    }
    const genericOnly = row.currentSkillIds.every((id) =>
      ["movement", "cooperation", "analysis", "communication"].includes(id)
    );
    if (genericOnly && row.outcomeCount >= 3) {
      row.flags.push("generic-skills-overused");
    }
  }

  return rows.sort((a, b) => a.topicName.localeCompare(b.topicName));
}

export function runMetadataAudit(): MetadataAuditReport {
  const enhancedImported = IMPORTED_LEARNING_OUTCOMES.map(enhanceImportedOutcome);
  const enhancedKb = LEARNING_OUTCOMES.map(enhanceKnowledgeBaseOutcome);

  let enhancedImportedCount = 0;
  let enhancedKbCount = 0;

  for (let i = 0; i < IMPORTED_LEARNING_OUTCOMES.length; i++) {
    if (
      JSON.stringify(IMPORTED_LEARNING_OUTCOMES[i].skillIds) !==
      JSON.stringify(enhancedImported[i].skillIds)
    ) {
      enhancedImportedCount += 1;
    }
  }

  for (let i = 0; i < LEARNING_OUTCOMES.length; i++) {
    if (JSON.stringify(LEARNING_OUTCOMES[i].skillIds) !== JSON.stringify(enhancedKb[i].skillIds)) {
      enhancedKbCount += 1;
    }
  }

  const importedRows = collectTopicRows(
    IMPORTED_LEARNING_OUTCOMES.map((o) => ({
      id: o.id,
      description: o.description,
      pathwayId: o.pathwayId,
      topicId: o.topicId,
      topic: o.topic,
      yearGroups: o.yearGroups,
      skillIds: o.skillIds,
      sourceFile: o.sourceFile,
      sourceDocument: o.sourceDocument,
    }))
  );

  const kbRows = collectTopicRows(
    LEARNING_OUTCOMES.map((o: LearningOutcome) => ({
      id: o.id,
      description: o.description,
      pathwayId: o.pathwayId,
      topicId: o.topicIds[0] ?? "",
      topic: o.topicIds[0],
      yearGroups: o.yearGroups,
      skillIds: o.skillIds,
      sourceFile: "KNOWLEDGE_BASE",
    }))
  );

  const topicRows = [...importedRows, ...kbRows];
  const underTaggedTopics = topicRows.filter((row) =>
    row.flags.some((flag) =>
      [
        "likely-missing-skills",
        "single-skill-but-text-suggests-more",
        "outcomes-without-skills",
        "generic-skills-overused",
      ].includes(flag)
    )
  );

  const missingSkillIds = IMPORTED_LEARNING_OUTCOMES.filter(
    (o) => !o.skillIds || o.skillIds.length === 0
  ).length;
  const emptyTopicIds = IMPORTED_LEARNING_OUTCOMES.filter((o) => !o.topicId?.trim()).length;

  const newSkillIds = METADATA_SKILL_PATTERNS.map((p) => p.id).filter(
    (id) =>
      ![
        "passing",
        "receiving",
        "throwing",
        "catching",
        "kicking",
        "dribbling",
        "shooting",
        "defending",
        "attacking",
        "movement",
        "running",
        "sprinting",
        "jumping",
        "landing",
        "balance",
        "rolling",
        "travelling",
        "coordination",
        "agility",
        "strength",
        "endurance",
        "flexibility",
        "speed",
        "communication",
        "cooperation",
        "officiating",
        "analysis",
        "safety",
        "finishing",
      ].includes(id)
  );

  const manualReviewItems = [
    "Outcomes tagged to generic topics (games, net-games, invasion-games) may need topic refinement — not auto-changed.",
    "Some imported outcomes have mis-tagged skills (e.g. Shooting on sprint outcomes) — review athletics A10.x rows manually.",
    "KNOWLEDGE_BASE remains the alignment engine source; imported outcomes enrich filters only.",
    "Value tagging (values[]) was not auto-expanded in this pass.",
    "Duplicate topic slugs across pathways are expected (e.g. volleyball under secondary-pe and alp-sports-vocational).",
  ];

  return {
    auditedAt: new Date().toISOString(),
    totals: {
      knowledgeBaseOutcomes: LEARNING_OUTCOMES.length,
      importedOutcomes: IMPORTED_LEARNING_OUTCOMES.length,
      combinedOutcomes: IMPORTED_LEARNING_OUTCOMES.length + LEARNING_OUTCOMES.length,
      enhancedImported: enhancedImportedCount,
      enhancedKnowledgeBase: enhancedKbCount,
      missingSkillIds,
      emptyTopicIds,
      underTaggedTopics: underTaggedTopics.length,
    },
    skillsAddedToRegistry: newSkillIds,
    topicRows,
    underTaggedTopics,
    manualReviewItems,
  };
}

export function formatMetadataAuditMarkdown(report: MetadataAuditReport): string {
  const lines: string[] = [
    "# Curriculum Metadata Audit",
    "",
    `Audited at: ${report.auditedAt}`,
    "",
    "## Summary",
    "",
    `- Knowledge base outcomes audited: **${report.totals.knowledgeBaseOutcomes}**`,
    `- Imported JSON outcomes audited: **${report.totals.importedOutcomes}**`,
    `- Combined records reviewed: **${report.totals.combinedOutcomes}**`,
    `- Imported outcomes enhanced (skillIds added): **${report.totals.enhancedImported}**`,
    `- Knowledge base outcomes enhanced: **${report.totals.enhancedKnowledgeBase}**`,
    `- Outcomes with no skillIds (imported): **${report.totals.missingSkillIds}**`,
    `- Outcomes with missing topicIds (imported): **${report.totals.emptyTopicIds}**`,
    `- Under-tagged topic/pathway groups flagged: **${report.totals.underTaggedTopics}**`,
    "",
    "## Skills added to metadata registry",
    "",
    report.skillsAddedToRegistry.length
      ? report.skillsAddedToRegistry.map((id) => `- \`${id}\``).join("\n")
      : "- None",
    "",
    "## Under-tagged areas (sample)",
    "",
  ];

  for (const row of report.underTaggedTopics.slice(0, 40)) {
    lines.push(
      `### ${row.topicName} (${row.pathwayId})`,
      `- Outcomes: ${row.outcomeCount}`,
      `- Current skills: ${row.currentSkillIds.join(", ") || "—"}`,
      `- Likely missing: ${row.inferredMissingSkillIds.join(", ") || "—"}`,
      `- Flags: ${row.flags.join(", ")}`,
      `- Sources: ${row.sourceDocuments.slice(0, 3).join("; ") || "—"}`,
      ""
    );
  }

  lines.push("## Remaining manual review", "");
  for (const item of report.manualReviewItems) {
    lines.push(`- ${item}`);
  }

  lines.push("", "## Limitations", "");
  lines.push(
    "- Skill inference is text-pattern based; ambiguous phrases are not auto-tagged.",
    "- Descriptions are never modified; only skillIds/skills metadata may be enriched.",
    "- Curriculum Hub uses imported outcomes; Lesson Builder and Schemes use unified enhanced outcomes for filters.",
    "- Strict alignment engine still reads raw KNOWLEDGE_BASE learning outcomes."
  );

  return lines.join("\n");
}

export async function writeImportedEnhancements(
  outcomes: ImportedLearningOutcomeRecord[]
): Promise<{ enhanced: ImportedLearningOutcomeRecord[]; changedCount: number }> {
  let changedCount = 0;
  const enhanced = outcomes.map((outcome) => {
    const next = enhanceImportedOutcome(outcome);
    if (JSON.stringify(next.skillIds) !== JSON.stringify(outcome.skillIds)) {
      changedCount += 1;
    }
    return next;
  });
  return { enhanced, changedCount };
}
