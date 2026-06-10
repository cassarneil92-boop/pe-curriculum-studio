import fs from "node:fs/promises";
import path from "node:path";
import {
  formatMetadataAuditMarkdown,
  runMetadataAudit,
  writeImportedEnhancements,
} from "../src/lib/curriculum/metadata/audit";
import { IMPORTED_LEARNING_OUTCOMES } from "../src/lib/curriculum/coverage/coverage-engine";

const REPORT_PATH = path.join(process.cwd(), "curriculum-metadata-audit.md");
const IMPORTED_PATH = path.join(
  process.cwd(),
  "src/lib/curriculum/data/imported-learning-outcomes.json"
);

async function main() {
  const { enhanced, changedCount } = await writeImportedEnhancements(
    IMPORTED_LEARNING_OUTCOMES
  );

  await fs.writeFile(IMPORTED_PATH, `${JSON.stringify(enhanced, null, 2)}\n`, "utf8");

  const { resetUnifiedCurriculumOutcomesCache } = await import(
    "../src/lib/curriculum/metadata/unified-outcomes"
  );
  resetUnifiedCurriculumOutcomesCache();

  const report = runMetadataAudit();
  const { formatPlanningStabilizationMarkdown } = await import(
    "../src/lib/curriculum/planning/planning-audit"
  );
  const markdown =
    formatMetadataAuditMarkdown(report) + formatPlanningStabilizationMarkdown();
  await fs.writeFile(REPORT_PATH, markdown, "utf8");

  console.log("Curriculum metadata audit complete\n");
  console.log(`Imported outcomes enhanced: ${changedCount}`);
  console.log(`Report written: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
