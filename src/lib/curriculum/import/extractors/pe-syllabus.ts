import type {
  ImportSourceConfig,
  ImportedLearningOutcomeRecord,
  ImportWarning,
} from "../types";
import { refineTopicForOutcome, resolveTopicFromCode } from "../topic-resolution";
import { cleanDescription, makeRecordId, normaliseSkillId, uniqueSorted } from "../utils";
import { inferSkillsFromDescription } from "./shared";

const CODE_PATTERN = /\b([A-Z]{1,2}\d+)\.(\d+[a-z]?)\b/g;

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

const OUTCOME_START =
  /\b(I can|I have|I feel|I respect|I exhibit|I demonstrate|Demonstrate|Perform|Complete|Use|Apply|Identify|Explain|Maintain|Sustain|Select|Adapt|Refine|Recall|Show|Exhibit)\b/i;

const LEADING_LABEL =
  /^(?:Runs|Jumps|Throws(?:\s*\/\s*Throws)?|Trekking|Orienteering|Team Building|Combination of Movements|Differentiation|Endurance|Strength|Flexibility|Area|Topic)\s+/i;

/** Expand shared codes such as `OR7.3 / OR8.3 / OR9.3 / OR10.3` for per-code extraction. */
function normalizeCombinedCodes(text: string): string {
  return text.replace(
    /((?:[A-Z]{1,2}\d+\.\d+[a-z]?)(?:\s*\/\s*[A-Z]{1,2}\d+\.\d+[a-z]?)+)/g,
    (group) => group.split(/\s*\/\s*/).join(" ")
  );
}

function resolvePrefix(codePrefix: string): string {
  if (codePrefix.length >= 2 && PREFIX_TOPICS[codePrefix.slice(0, 2)]) {
    return codePrefix.slice(0, 2);
  }
  return codePrefix.slice(0, 1);
}

function resolveYearGroups(codePrefix: string): string[] {
  const level = codePrefix.replace(/^[A-Z]+/, "").replace(/[a-z]$/, "");
  return LEVEL_YEAR_GROUPS[level] ?? [];
}

function resolveRawSlice(normalized: string, start: number, end: number): string {
  let slice = normalized.slice(start, end);

  if (!OUTCOME_START.test(slice)) {
    const extendedEnd = Math.min(start + 500, normalized.length);
    const extended = normalized.slice(start, extendedEnd);
    const descIndex = extended.search(OUTCOME_START);

    if (descIndex >= 0) {
      const afterDesc = extended.slice(descIndex);
      const nextCode = afterDesc.search(/\s+[A-Z]{1,2}\d+\.\d+[a-z]?\b/);
      slice =
        nextCode >= 0
          ? extended.slice(0, descIndex + nextCode)
          : extended;
    }
  }

  return slice;
}

function trimDescription(raw: string): string {
  let text = raw
    .replace(/\b(?:Differentiation|Equilibrium|Reaction)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  text = text.replace(LEADING_LABEL, "");

  const start = text.search(OUTCOME_START);
  if (start >= 0) {
    text = text.slice(start);
  }

  text = text.replace(/\s+\d{1,3}\s+[A-Z]{1,2}\d+\.\d+[a-z]?\b[\s\S]*$/i, "");
  text = text.replace(/\s+\d{1,3}\s*$/i, "");

  return cleanDescription(text);
}

function isValidPeCode(fullCode: string, description: string): boolean {
  if (!/^[A-Z]{1,2}\d+\.\d+[a-z]?$/.test(fullCode)) return false;
  if (description.length < 8) return false;
  if (/^(Page|Table|Level|Year|Area|Topic)\b/i.test(description)) return false;
  return OUTCOME_START.test(description);
}

function resolveTopic(
  codePrefix: string,
  fullCode: string,
  description: string
): { topic: string; topicId: string } {
  const base =
    resolveTopicFromCode(fullCode) ??
    PREFIX_TOPICS[resolvePrefix(codePrefix)] ??
    { topic: "General", topicId: "general" };

  return refineTopicForOutcome(fullCode, description, base);
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
  const normalized = normalizeCombinedCodes(text.replace(/\s+/g, " "));
  const matches = [...normalized.matchAll(CODE_PATTERN)];

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const codePrefix = match[1];
    const index = match[2];
    const fullCode = `${codePrefix}.${index}`;
    const start = match.index! + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : normalized.length;
    const rawSlice = resolveRawSlice(normalized, start, end);
    const description = trimDescription(rawSlice);

    if (!isValidPeCode(fullCode, description)) continue;

    const { topic, topicId } = resolveTopic(codePrefix, fullCode, description);
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
