import {
  CODE_SKILL_SEGMENTS,
  CODE_TOPIC_SEGMENTS,
  TOPIC_ALIASES,
  VALUE_KEYWORDS,
  YEAR_GROUP_PATTERNS,
} from "../config";
import { inferSkillsFromDescription as inferSkillsFromText } from "./shared";
import type {
  ImportSourceConfig,
  ImportedLearningOutcomeRecord,
  ImportedValueRecord,
  ImportWarning,
} from "../types";
import {
  cleanDescription,
  makeRecordId,
  normaliseSkillId,
  normaliseTopicId,
  resolveSkillName,
  resolveTopicName,
  uniqueSorted,
} from "../utils";

const LO_CODE_PATTERN = /\b([A-Z]{2,5})\.([A-Z]{2,5})\.([A-Z0-9]{1,5})\b/;
const LO_LINE_PATTERN =
  /^([A-Z]{2,5}\.[A-Z]{2,5}\.[A-Z0-9]{1,5})\s*[:\-–.]?\s*(.+)$/i;
const TOPIC_HEADER_PATTERN = new RegExp(
  `^(${Object.values(TOPIC_ALIASES).join("|")})\\s*$`,
  "i"
);
const SKILL_LINE_PATTERN = /^Skills?\s*:\s*(.+)$/i;
const VALUE_LINE_PATTERN = /^Values?\s*:\s*(.+)$/i;
const YEAR_LINE_PATTERN = /^Years?\s*:\s*(.+)$/i;
const STRAND_LINE_PATTERN = /^(Strand|Unit|Topic area)\s*:\s*(.+)$/i;

interface ParseState {
  currentTopic: string;
  currentTopicId: string;
  currentStrand: string;
  currentYearGroups: string[];
  pendingSkills: string[];
  pendingValues: string[];
}

function extractYearGroups(text: string): string[] {
  const groups: string[] = [];
  for (const pattern of YEAR_GROUP_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      groups.push(
        match[0].toLowerCase().startsWith("form")
          ? `Form ${match[1]}`
          : `Year ${match[1]}`
      );
    }
  }
  return uniqueSorted(groups);
}

function inferTopicFromCode(code: string): string | null {
  const match = code.match(LO_CODE_PATTERN);
  if (!match) return null;
  return CODE_TOPIC_SEGMENTS[match[2].toUpperCase()] ?? null;
}

function inferSkillsFromCode(code: string): string[] {
  const match = code.match(LO_CODE_PATTERN);
  if (!match) return [];
  const skill = CODE_SKILL_SEGMENTS[match[3].toUpperCase().charAt(0)];
  return skill ? [skill] : [];
}

function extractValues(
  text: string,
  topic: string,
  topicId: string,
  skills: string[],
  skillIds: string[],
  parentCode: string,
  pending: string[]
): ImportedValueRecord[] {
  const values: ImportedValueRecord[] = [];

  for (const description of pending) {
    values.push({
      id: makeRecordId(["val", topicId, description.slice(0, 12), parentCode]),
      code: `VAL.${parentCode.split(".").slice(1).join(".")}`,
      description: cleanDescription(description),
      theme: "teamwork",
      topic,
      topicId,
      skills,
      skillIds,
    });
  }

  for (const entry of VALUE_KEYWORDS) {
    if (!entry.pattern.test(text)) continue;
    values.push({
      id: makeRecordId(["val", topicId, entry.theme, parentCode]),
      code: `VAL.${parentCode.split(".").slice(1).join(".")}.${entry.theme}`,
      description: `${entry.label} in ${topic} context.`,
      theme: entry.theme,
      topic,
      topicId,
      skills,
      skillIds,
    });
  }

  return values.filter(
    (v, i, arr) => arr.findIndex((x) => x.id === v.id) === i
  );
}

function createOutcome(
  source: ImportSourceConfig,
  code: string,
  description: string,
  state: ParseState,
  sourceFile: string,
  rawExcerpt: string
): ImportedLearningOutcomeRecord | null {
  const cleaned = cleanDescription(description);
  if (!cleaned) return null;

  const topic = state.currentTopic || inferTopicFromCode(code) || "General";
  const topicId = normaliseTopicId(topic);
  const skills = uniqueSorted([
    ...state.pendingSkills
      .map((s) => resolveSkillName(s))
      .filter((s): s is string => Boolean(s)),
    ...inferSkillsFromCode(code),
    ...inferSkillsFromText(cleaned),
  ]);

  return {
    id: makeRecordId(["lo", source.pathwayId, code]),
    code: code.toUpperCase(),
    description: cleaned,
    pathwayId: source.pathwayId,
    pathwayLabel: source.pathwayLabel,
    yearGroups: uniqueSorted([
      ...state.currentYearGroups,
      ...extractYearGroups(rawExcerpt),
      ...(source.defaultYearGroups ?? []),
    ]),
    topic,
    topicId,
    skills,
    skillIds: skills.map((s) => normaliseSkillId(s)),
    values: extractValues(
      cleaned,
      topic,
      topicId,
      skills,
      skills.map((s) => normaliseSkillId(s)),
      code,
      state.pendingValues
    ),
    strand: state.currentStrand || topic,
    sourceFile,
    rawExcerpt: rawExcerpt.trim(),
  };
}

export function extractCodedLoFormat(
  text: string,
  source: ImportSourceConfig,
  sourceFile: string
): { outcomes: ImportedLearningOutcomeRecord[]; warnings: ImportWarning[] } {
  const lines = text.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
  const outcomes: ImportedLearningOutcomeRecord[] = [];
  const warnings: ImportWarning[] = [];

  const state: ParseState = {
    currentTopic: "",
    currentTopicId: "",
    currentStrand: "",
    currentYearGroups: source.defaultYearGroups ?? [],
    pendingSkills: [],
    pendingValues: [],
  };

  let pendingCode: string | null = null;
  let pendingExcerpt = "";

  const flush = () => {
    if (!pendingCode) return;
    const description = pendingExcerpt.split("\n").slice(1).join(" ").trim() || pendingExcerpt;
    const outcome = createOutcome(source, pendingCode, description, state, sourceFile, pendingExcerpt);
    if (outcome) outcomes.push(outcome);
    else
      warnings.push({
        sourceFile,
        message: `Learning outcome ${pendingCode} has no description.`,
        rawExcerpt: pendingExcerpt,
      });
    pendingCode = null;
    pendingExcerpt = "";
    state.pendingSkills = [];
    state.pendingValues = [];
  };

  for (const line of lines) {
    const topicHeader = line.match(TOPIC_HEADER_PATTERN);
    if (topicHeader) {
      flush();
      state.currentTopic = resolveTopicName(topicHeader[1]) ?? topicHeader[1];
      state.currentTopicId = normaliseTopicId(state.currentTopic);
      continue;
    }

    const strandMatch = line.match(STRAND_LINE_PATTERN);
    if (strandMatch) {
      state.currentStrand = cleanDescription(strandMatch[2]);
      continue;
    }

    const yearMatch = line.match(YEAR_LINE_PATTERN);
    if (yearMatch) {
      state.currentYearGroups = uniqueSorted([
        ...state.currentYearGroups,
        ...extractYearGroups(yearMatch[1]),
      ]);
      continue;
    }

    const skillMatch = line.match(SKILL_LINE_PATTERN);
    if (skillMatch) {
      state.pendingSkills = skillMatch[1].split(/[,;|]/).map((s) => s.trim());
      continue;
    }

    const valueMatch = line.match(VALUE_LINE_PATTERN);
    if (valueMatch) {
      state.pendingValues = valueMatch[1].split(/[,;|]/).map((s) => s.trim());
      continue;
    }

    const loMatch = line.match(LO_LINE_PATTERN);
    if (loMatch) {
      flush();
      pendingCode = loMatch[1].toUpperCase();
      const inline = cleanDescription(loMatch[2]);
      if (inline.length > 8) {
        const outcome = createOutcome(source, pendingCode, inline, state, sourceFile, line);
        if (outcome) outcomes.push(outcome);
        pendingCode = null;
        state.pendingSkills = [];
        state.pendingValues = [];
      } else {
        pendingExcerpt = line;
      }
      continue;
    }

    const codeOnly = line.match(/^([A-Z]{2,5}\.[A-Z]{2,5}\.[A-Z0-9]{1,5})$/i);
    if (codeOnly) {
      flush();
      pendingCode = codeOnly[1].toUpperCase();
      pendingExcerpt = line;
      continue;
    }

    if (pendingCode) pendingExcerpt += `\n${line}`;
  }

  flush();
  return { outcomes, warnings };
}
