import { runCurriculumImport } from "../src/lib/curriculum/import/pipeline";

async function main() {
  console.log("PE Curriculum Studio — curriculum import pipeline\n");

  const result = await runCurriculumImport();
  const { manifest } = result;

  console.log(`Imported at: ${manifest.importedAt}`);
  console.log(`Source: ${manifest.sourceDirectory}`);
  console.log(`Output: ${manifest.outputDirectory}\n`);

  if (manifest.ignoredFiles.length > 0) {
    console.log(`Ignored files (${manifest.ignoredFiles.length}) — IM 36 out of scope:`);
    for (const file of manifest.ignoredFiles) {
      console.log(`  - ${file}`);
    }
    console.log("");
  }

  if (manifest.sourceFiles.length === 0) {
    console.log("No source documents processed.");
  } else {
    console.log("Source files:");
    for (const file of manifest.sourceFiles) {
      console.log(`  - ${file}`);
    }
    console.log("");
  }

  console.log("Record counts:");
  console.log(`  Learning outcomes: ${manifest.recordCounts.learningOutcomes}`);
  console.log(`  Topics:            ${manifest.recordCounts.topics}`);
  console.log(`  Skills:            ${manifest.recordCounts.skills}`);
  console.log(`  Values:            ${manifest.recordCounts.values}`);

  if (manifest.pathways.length > 0) {
    console.log("\nOutcomes by pathway:");
    for (const pathway of manifest.pathways) {
      console.log(
        `  - ${pathway.label} (${pathway.learningOutcomeCount} outcomes)`
      );
    }
  }

  console.log("\nALP DOCX imports:");
  console.log(
    `  ALP Physical Education:      ${manifest.alpDocxCounts.alpPe}`
  );
  console.log(
    `  ALP Sports Vocational:       ${manifest.alpDocxCounts.alpSportsVocational}`
  );

  if (manifest.warnings.length > 0) {
    console.log(`\nWarnings (${manifest.warnings.length}):`);
    for (const warning of manifest.warnings) {
      console.log(`  [${warning.sourceFile}] ${warning.message}`);
    }
  }

  console.log(
    result.success
      ? "\nImport completed."
      : "\nImport completed with errors — review warnings above."
  );

  process.exit(result.success ? 0 : 1);
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
