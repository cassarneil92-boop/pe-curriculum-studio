import fs from "node:fs/promises";
import path from "node:path";
import { IMPORTED_LEARNING_OUTCOMES } from "../src/lib/curriculum/coverage/coverage-engine";
import { OFFICIAL_CURRICULUM_EXPECTATIONS } from "../src/lib/intelligence/frameworks/curriculum-expectations";
import { LEARNING_OUTCOMES } from "../src/lib/curriculum/learning-outcomes";

const REPORT_PATH = path.join(process.cwd(), "curriculum-implementation-audit.md");

function normaliseTopic(id: string): string {
  return id.trim().toLowerCase().replace(/\s+/g, "-");
}

function outcomeTopicIds(outcome: {
  topicId?: string;
  topic?: string;
  topics?: string[];
}): string[] {
  const ids = new Set<string>();
  if (outcome.topicId) ids.add(normaliseTopic(outcome.topicId));
  if (outcome.topic) ids.add(normaliseTopic(outcome.topic));
  for (const topic of outcome.topics ?? []) {
    ids.add(normaliseTopic(topic));
  }
  return [...ids];
}

async function main() {
  const lines: string[] = [
    "# Curriculum Implementation Audit",
    "",
    `Audited at: ${new Date().toISOString()}`,
    "",
    "## Data sources",
    "",
    `- Imported outcomes: **${IMPORTED_LEARNING_OUTCOMES.length}**`,
    `- Knowledge base outcomes: **${LEARNING_OUTCOMES.length}**`,
    "",
    "## Official syllabus area verification",
    "",
    "| Area | Status | Imported outcomes | Notes |",
    "|------|--------|-------------------|-------|",
  ];

  const missing: string[] = [];
  const partial: string[] = [];
  const present: string[] = [];

  for (const expectation of OFFICIAL_CURRICULUM_EXPECTATIONS) {
    const topicSet = new Set(expectation.topicIds.map(normaliseTopic));
    const matching = IMPORTED_LEARNING_OUTCOMES.filter((o) => {
      const ids = outcomeTopicIds(o);
      return ids.some((tid) => topicSet.has(tid));
    });

    const count = matching.length;
    let status: "present" | "partial" | "missing";
    if (count === 0) {
      status = "missing";
      missing.push(expectation.label);
    } else if (expectation.minOutcomes && count < expectation.minOutcomes) {
      status = "partial";
      partial.push(`${expectation.label} (${count}/${expectation.minOutcomes})`);
    } else if (count < 2 && !["touch-rugby", "tchoukball", "pickleball", "badminton", "archery", "orienteering", "trekking"].includes(expectation.id)) {
      status = "partial";
      partial.push(`${expectation.label} (${count})`);
    } else {
      status = "present";
      present.push(expectation.label);
    }

    lines.push(
      `| ${expectation.label} | ${status.toUpperCase()} | ${count} | ${expectation.category} |`
    );
  }

  lines.push(
    "",
    "## Summary",
    "",
    `- Present: **${present.length}**`,
    `- Partial: **${partial.length}**`,
    `- Missing: **${missing.length}**`,
    "",
    "### Missing curriculum areas",
    "",
    ...(missing.length ? missing.map((m) => `- ${m}`) : ["- None — all expected areas have at least one imported outcome."]),
    "",
    "### Partial coverage (needs manual review)",
    "",
    ...(partial.length ? partial.map((p) => `- ${p}`) : ["- None flagged."]),
    "",
    "## Pedagogical framework",
    "",
    "Framework definitions implemented in `src/lib/intelligence/frameworks/pedagogical-models.ts`.",
    "Lesson/scheme tagging supported via optional `pedagogicalModels` field.",
    "",
    "## Fitness framework",
    "",
    "Fitness strands F7–F11 and Common Fitness Battery defined in `src/lib/intelligence/frameworks/fitness-strands.ts`.",
    `Imported fitness outcomes: **${IMPORTED_LEARNING_OUTCOMES.filter((o) => normaliseTopic(o.topicId ?? "") === "fitness").length}**`,
    "",
    "## Holistic development",
    "",
    `Imported HD outcomes: **${IMPORTED_LEARNING_OUTCOMES.filter((o) => normaliseTopic(o.topicId ?? "") === "holistic-development" || (o.code ?? "").toUpperCase().startsWith("HD")).length}**`,
    "",
    "## Remaining limitations",
    "",
    "- Generic IG/NG outcomes include sport coverage via `topics` metadata from the official pedagogical model table",
    "- Code-level completeness is tracked in `curriculum-completeness-report.md`",
    "- Strict alignment engine remains KB-only (17 outcomes)",
    "- Full cloud collaboration not yet implemented",
    ""
  );

  await fs.writeFile(REPORT_PATH, lines.join("\n"), "utf8");
  console.log(`Report written: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
