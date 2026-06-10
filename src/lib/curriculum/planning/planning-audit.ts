import {
  GENERIC_TOPIC_IDS,
  GENERIC_TOPIC_LABELS,
  getPlanningOutcomeCounts,
  getPlanningOutcomes,
  resetPlanningOutcomesCache,
} from "./planning-outcomes";
import {
  getPlanningSkillCorrectionsLog,
  resetPlanningSkillCorrectionsLog,
} from "./skill-corrections";

export function formatPlanningStabilizationMarkdown(): string {
  resetPlanningOutcomesCache();
  resetPlanningSkillCorrectionsLog();
  getPlanningOutcomes();

  const counts = getPlanningOutcomeCounts();
  const corrections = getPlanningSkillCorrectionsLog();

  const genericTopicsInUse = [...GENERIC_TOPIC_IDS].filter((topicId) =>
    getPlanningOutcomes().some((outcome) =>
      outcome.topicIds.some((id) => id.toLowerCase() === topicId)
    )
  );

  const lines: string[] = [
    "",
    "---",
    "",
    "## Planning layer stabilization",
    "",
    "Unified planning source: `src/lib/curriculum/planning/planning-outcomes.ts`",
    "",
    "- `getPlanningOutcomes()` = imported JSON + KNOWLEDGE_BASE + metadata enhancement + planning skill corrections",
    "- Strict alignment engine remains KNOWLEDGE_BASE only (`alignCurriculumFromInput`)",
    "- Lesson Builder, Schemes, and Curriculum Tester use the planning layer for topic/skill options",
    "- Curriculum Hub browses imported outcomes; skills use metadata enhancement consistent with planning",
    "- Curriculum Coverage uses planning outcomes where appropriate; strict checks remain KB-only",
    "",
    "### Outcome counts",
    "",
    `- Planning layer outcomes: **${counts.planningTotal}**`,
    `- Strict KB outcomes: **${counts.knowledgeBase}**`,
    `- Imported / enhanced outcomes in planning layer: **${counts.importedEnhanced}**`,
    "",
    "### Generic topic groups (manual review)",
    "",
    "Broad curriculum topic ids are displayed with friendly labels but not retagged to specific sports:",
    "",
    ...genericTopicsInUse.map(
      (id) => `- \`${id}\` → ${GENERIC_TOPIC_LABELS[id] ?? id}`
    ),
    "",
    "### Skill corrections applied in planning layer",
    "",
  ];

  if (corrections.length === 0) {
    lines.push("- None applied in this run.");
  } else {
    for (const correction of corrections) {
      lines.push(
        `- \`${correction.outcomeId}\`: removed \`${correction.removed.join(", ")}\` — ${correction.reason}`
      );
    }
  }

  lines.push(
    "",
    "### Remaining limitations",
    "",
    "- Strict alignment uses the primary (first) app pathway when multiple pathways are selected",
    "- Full multi-pathway strict alignment is not yet implemented",
    "- Some imported outcomes may still have weak or missing skill tags pending manual review",
    "- Generic topic groups (games, invasion-games, net-games, etc.) remain broad curriculum areas",
    "- Curriculum Coverage strict checks remain KB-only; planning layer supplements visibility",
    ""
  );

  return lines.join("\n");
}
