import { writeCurriculumAuditReports } from "../src/lib/curriculum/import/audit";

async function main() {
  console.log("PE Curriculum Studio — curriculum audit\n");

  const report = await writeCurriculumAuditReports();

  console.log(`Audited at: ${report.auditedAt}`);
  console.log(`Total outcomes: ${report.summary.totalOutcomes}`);
  console.log(`Pathways:       ${report.summary.pathwayCount}`);
  console.log("");
  console.log("Outcome counts by pathway:");
  for (const row of report.counts.byPathway) {
    console.log(`  - ${row.label}: ${row.count}`);
  }
  console.log("");
  console.log("Issues:");
  console.log(`  Duplicate groups:     ${report.issues.duplicateOutcomes.length}`);
  console.log(`  Missing year groups:  ${report.issues.missingYearGroups.length}`);
  console.log(`  Missing topics:       ${report.issues.missingTopics.length}`);
  console.log(`  Missing skills:       ${report.issues.missingSkills.length}`);
  console.log(`  Missing values:       ${report.issues.missingValues.length}`);
  console.log(`  Weak pathways:        ${report.issues.weakPathwayCoverage.length}`);
  console.log(`  Absent pathways:      ${report.issues.absentPathways.length}`);
  console.log("");
  console.log("Reports written:");
  console.log("  - src/lib/curriculum/data/audit-report.json");
  console.log("  - curriculum-audit.md");
}

main().catch((error) => {
  console.error("Audit failed:", error);
  process.exit(1);
});
