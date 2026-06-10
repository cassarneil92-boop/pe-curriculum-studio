import fs from "node:fs/promises";
import path from "node:path";
import { readPdfText } from "../src/lib/curriculum/import/parse-pdf";
import type { ImportedLearningOutcomeRecord } from "../src/lib/curriculum/import/types";

const PDF_PATH = path.join(
  process.cwd(),
  "data/curriculum-pdfs/PE_syllabus_Learning_Outcomes_latest.pdf"
);
const IMPORT_PATH = path.join(
  process.cwd(),
  "src/lib/curriculum/data/imported-learning-outcomes.json"
);

const CODE_PATTERN = /\b([A-Z]{1,2}\d+)\.(\d+[a-z]?)\b/g;

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
  const importedCodes = new Set(peImported.map((o) => o.code));

  const missing = [...pdfCodes].filter((c) => !importedCodes.has(c)).sort();
  const extra = [...importedCodes].filter((c) => !pdfCodes.has(c)).sort();

  console.log(`PDF codes: ${pdfCodes.size}`);
  console.log(`PE syllabus imported: ${peImported.length}`);
  console.log(`Missing (${missing.length}):`);
  console.log(missing.join("\n"));
  console.log(`\nExtra non-PDF codes (${extra.length}):`);
  console.log(extra.join("\n"));

  for (const term of ["Touch Rugby", "Tchoukball", "Pickleball", "Hockey", "Badminton"]) {
    const idx = text.indexOf(term);
    console.log(`\n${term}: ${idx >= 0 ? "found" : "NOT FOUND"}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
