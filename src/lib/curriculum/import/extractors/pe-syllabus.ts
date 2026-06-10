import type {
  ImportSourceConfig,
  ImportedLearningOutcomeRecord,
  ImportWarning,
} from "../types";
import { cleanDescription, makeRecordId, normaliseSkillId, uniqueSorted } from "../utils";
import { inferSkillsFromDescription } from "./shared";

const CODE_PATTERN = /\b([A-Z]{1,2}\d+)\.(\d+)\b/g;

const PREFIX_TOPICS: Record<string, { topic: string; topicId: string }> = {
  F: { topic: "Fundamentals", topicId: "fundamentals" },
  IG: { topic: "Invasion Games", topicId: "invasion-games" },
  NG: { topic: "Net Games", topicId: "net-games" },
  MA: { topic: "Martial Arts", topicId: "martial-arts" },
  HD: { topic: "Holistic Development", topicId: "holistic-development" },
  GY: { topic: "Gymnastics", topicId: "gymnastics" },
  A: { topic: "Athletics", topicId: "athletics" },
  D: { topic: "Educational Dance", topicId: "educational-dance" },
  OR: { topic: "Outdoor Recreation", topicId: "outdoor-recreation" },
  G: { topic: "Games", topicId: "games" },
  S: { topic: "Swimming / Aquatics", topicId: "swimming-aquatics" },
  SF: { topic: "Striking and Fielding Games", topicId: "striking-and-fielding-games" },
};

const LEVEL_YEAR_GROUPS: Record<string, string[]> = {
  "2": ["Year 1", "Year 2"],
  "4": ["Year 3", "Year 4"],
  "6": ["Year 5", "Year 6"],
  "7": ["Year 7", "Year 8"],
  "8": ["Year 9", "Year 10"],
  "9": ["Year 11"],
  "10": ["Gifted & Talented"],
  "11": ["Year 11"],
};

function resolvePrefix(codePrefix: string): string {
  if (codePrefix.length >= 2 && PREFIX_TOPICS[codePrefix.slice(0, 2)]) {
    return codePrefix.slice(0, 2);
  }
  return codePrefix.slice(0, 1);
}

function resolveTopic(codePrefix: string): { topic: string; topicId: string } {
  const prefix = resolvePrefix(codePrefix);
  const level = codePrefix.replace(/^[A-Z]+/, "");

  if (prefix === "F" && Number(level) >= 7) {
    return { topic: "Fitness", topicId: "fitness" };
  }

  return PREFIX_TOPICS[prefix] ?? { topic: "General", topicId: "general" };
}

function resolveYearGroups(codePrefix: string): string[] {
  const level = codePrefix.replace(/^[A-Z]+/, "");
  return LEVEL_YEAR_GROUPS[level] ?? [];
}

function trimDescription(raw: string): string {
  return cleanDescription(
    raw
      .replace(/\b(?:Differentiation|Equilibrium|Reaction)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function isValidPeCode(fullCode: string, description: string): boolean {
  if (!/^[A-Z]{1,2}\d+\.\d+$/.test(fullCode)) return false;
  if (description.length < 12) return false;
  if (/^(Page|Table|Level|Year)\b/i.test(description)) return false;
  return /^(I can|Demonstrate|Perform|Complete|Use|Apply|Identify|Explain)/i.test(description);
}

export function isPeSyllabusDocument(text: string, filename: string): boolean {
  if (/fitness|cope|outlook|fw:/i.test(filename)) return false;
  return (
    (/pe[\s_-]?syllabus/i.test(filename) ||
      /learning[\s_-]?outcomes[\s_-]?latest/i.test(filename)) &&
    /Physical Education Learning Outcomes/i.test(text) &&
    /\bF2\.\d+\b/.test(text) &&
    /\bI can\b/i.test(text)
  );
}

export function extractPeSyllabusFormat(
  text: string,
  source: ImportSourceConfig,
  sourceFile: string
): { outcomes: ImportedLearningOutcomeRecord[]; warnings: ImportWarning[] } {
  const outcomes: ImportedLearningOutcomeRecord[] = [];
  const warnings: ImportWarning[] = [];
  const normalized = text.replace(/\s+/g, " ");
  const matches = [...normalized.matchAll(CODE_PATTERN)];

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const codePrefix = match[1];
    const index = match[2];
    const fullCode = `${codePrefix}.${index}`;
    const start = match.index! + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : normalized.length;
    const rawSlice = normalized.slice(start, end);
    const description = trimDescription(rawSlice);

    if (!isValidPeCode(fullCode, description)) continue;

    const { topic, topicId } = resolveTopic(codePrefix);
    const skills = inferSkillsFromDescription(rawSlice);
    const yearGroups = uniqueSorted([
      ...resolveYearGroups(codePrefix),
      ...(source.defaultYearGroups ?? []),
    ]);

    outcomes.push({
      id: makeRecordId(["lo", source.pathwayId, fullCode]),
      code: fullCode,
      description,
      pathwayId: source.pathwayId,
      pathwayLabel: source.pathwayLabel,
      yearGroups,
      topic,
      topicId,
      skills,
      skillIds: skills.map((s) => normaliseSkillId(s)),
      values: [],
      strand: topic,
      sourceFile,
      rawExcerpt: rawSlice.slice(0, 280),
    });
  }

  if (outcomes.length === 0) {
    warnings.push({
      sourceFile,
      message: "PE syllabus format detected but no coded learning outcomes parsed.",
    });
  }

  return { outcomes, warnings };
}
