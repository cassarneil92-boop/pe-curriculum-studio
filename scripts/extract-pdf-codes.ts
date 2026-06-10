import path from "node:path";
import { readPdfText } from "../src/lib/curriculum/import/parse-pdf";

const PDF_PATH = path.join(
  process.cwd(),
  "data/curriculum-pdfs/PE_syllabus_Learning_Outcomes_latest.pdf"
);

const CODE_PATTERN = /\b([A-Z]{1,2}\d+)\.(\d+[a-z]?)\b/g;

async function main() {
  const { text, pageCount } = await readPdfText(PDF_PATH);
  const codes = new Set<string>();

  for (const match of text.replace(/\s+/g, " ").matchAll(CODE_PATTERN)) {
    codes.add(`${match[1]}.${match[2]}`);
  }

  const sorted = [...codes].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  console.log(`Pages: ${pageCount}`);
  console.log(`Unique codes: ${sorted.length}`);
  console.log(sorted.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
