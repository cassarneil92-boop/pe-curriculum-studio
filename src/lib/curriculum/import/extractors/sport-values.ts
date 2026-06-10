import type { ImportSourceConfig, ImportedLearningOutcomeRecord, ImportWarning } from "../types";
import { cleanDescription, makeRecordId, normaliseSkillId, uniqueSorted } from "../utils";
import { buildValuesFromTheme, inferSkillsFromDescription, parseYearGroupHeader } from "./shared";

export function isSportValuesDocument(text: string, filename: string): boolean {
  return /sport[\s_-]?values/i.test(filename) || /SPORT VALUES/i.test(text);
}

export function extractSportValuesFormat(
  text: string,
  source: ImportSourceConfig,
  sourceFile: string
): { outcomes: ImportedLearningOutcomeRecord[]; warnings: ImportWarning[] } {
  const outcomes: ImportedLearningOutcomeRecord[] = [];
  const warnings: ImportWarning[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim());

  let currentYear = "";
  let currentTheme = "";
  let loCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const year = parseYearGroupHeader(line);
    if (year) {
      currentYear = year;
      currentTheme = "";
      continue;
    }

    if (
      line.length > 2 &&
      line.length < 40 &&
      /^[A-Z][a-z]+(\s[A-Za-z]+)*\s*$/.test(line) &&
      !line.startsWith("LO") &&
      !line.startsWith("SC")
    ) {
      const themes = [
        "Discipline",
        "Fair Play",
        "Inclusion",
        "Respect",
        "Responsibility",
        "Communication",
        "Teamwork",
        "Leadership",
        "Commitment",
        "Excellence",
        "Match Fixing",
        "Perseverance",
      ];
      if (themes.some((t) => t.toLowerCase() === line.toLowerCase())) {
        currentTheme = line;
        continue;
      }
    }

    const loMatch = line.match(/^LO:\s*(.+)$/i);
    if (loMatch && currentTheme) {
      loCounter += 1;
      const description = cleanDescription(loMatch[1]);
      const skills = inferSkillsFromDescription(`${description} ${currentTheme}`);
      const code = `SV.Y${currentYear.replace(/\D/g, "") || "0"}.${slugTheme(currentTheme)}.${loCounter}`;
      const topic = "Sport Values";
      const topicId = "sport-values";

      const values = buildValuesFromTheme(
        currentTheme,
        description,
        topic,
        topicId,
        skills,
        code
      );

      outcomes.push({
        id: makeRecordId(["lo", source.pathwayId, code]),
        code,
        description,
        pathwayId: source.pathwayId,
        pathwayLabel: source.pathwayLabel,
        yearGroups: currentYear ? [currentYear] : [],
        topic,
        topicId,
        skills,
        skillIds: skills.map((s) => normaliseSkillId(s)),
        values,
        strand: currentTheme,
        sourceFile,
        rawExcerpt: line,
      });
    }
  }

  if (outcomes.length === 0) {
    warnings.push({
      sourceFile,
      message: "Sport Values format detected but no LO: lines parsed.",
    });
  }

  return { outcomes, warnings };
}

function slugTheme(theme: string): string {
  return theme.toUpperCase().replace(/\s+/g, "").slice(0, 6);
}
