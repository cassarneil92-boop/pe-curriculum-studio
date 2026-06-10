import type { ImportSourceConfig, ImportedLearningOutcomeRecord, ImportWarning } from "../types";
import { cleanDescription, makeRecordId, uniqueSorted } from "../utils";
import { inferSkillsFromDescription } from "./shared";

const LO_HEADER = /Learning Outcome:\s*(\d+)\)?/i;
const ACHIEVEMENT_LINE = /^(\d+)\.\s+(.+)$/;

export function isEarlyYearsDocument(text: string, filename: string): boolean {
  return /kinder|early[\s_-]?years|level[\s_-]?3/i.test(filename);
}

export function extractEarlyYearsFormat(
  text: string,
  source: ImportSourceConfig,
  sourceFile: string
): { outcomes: ImportedLearningOutcomeRecord[]; warnings: ImportWarning[] } {
  const outcomes: ImportedLearningOutcomeRecord[] = [];
  const warnings: ImportWarning[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim());

  let currentLo = "";
  let currentAchievement = "";

  for (const line of lines) {
    const loHeader = line.match(LO_HEADER);
    if (loHeader) {
      currentLo = loHeader[1];
      currentAchievement = "";
      continue;
    }

    const related = line.match(/^[\u2192\uF0E0>]?\s*(\d+)\.(\d+)/);
    if (related) {
      currentAchievement = `${related[1]}.${related[2]}`;
      continue;
    }

    const achievement = line.match(ACHIEVEMENT_LINE);
    if (achievement && currentLo) {
      const index = achievement[1];
      const description = cleanDescription(achievement[2]);
      const code = `EY.LO${currentLo}.${currentAchievement || "0"}.${index}`;
      const skills = inferSkillsFromDescription(description);

      outcomes.push({
        id: makeRecordId(["lo", source.pathwayId, code]),
        code,
        description,
        pathwayId: source.pathwayId,
        pathwayLabel: source.pathwayLabel,
        yearGroups: uniqueSorted(source.defaultYearGroups ?? ["Year 1", "Year 2"]),
        topic: "Early Years",
        topicId: "early-years",
        skills,
        skillIds: skills.map((s) => s.toLowerCase().replace(/\s+/g, "-")),
        values: [],
        strand: `Learning Outcome ${currentLo}`,
        sourceFile,
        rawExcerpt: line,
      });
    }
  }

  if (outcomes.length === 0) {
    warnings.push({
      sourceFile,
      message: "Early Years format detected but no numbered achievements parsed.",
    });
  }

  return { outcomes, warnings };
}
