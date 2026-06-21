import { getYearGroupLabel } from "@/lib/year-groups";
import type { YearGroupId } from "@/lib/year-groups";
import { buildSchemesLink } from "@/lib/curriculum-hub/planning-links";
import { suggestedSchemeTitle } from "@/lib/scheme-builder/helpers";
import { buildWaltIdeas, SOW_WILF_CARDS } from "@/lib/scheme-builder/constants";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import {
  ALL_SEC_CATEGORIES,
  buildSecAssessmentSuggestions,
  getOutcomesBySecCategory,
  getSecPeOptionOutcomes,
  querySecProgression,
  SEC_CATEGORY_LABELS,
  showExamTopicCoverage,
  showMissingTopics,
  showRevisionTopics,
} from "@/src/lib/curriculum/pe-option-sec";
import { SEC_KNOWLEDGE_TOPICS } from "@/src/lib/peKnowledge/secPeOptionMaster";
import type { ParsedAssistantQuery } from "./query-parser";
import type { AssistantResponse, AssistantQueryContext } from "./responses";

function toMatches(
  outcomes: ReturnType<typeof getSecPeOptionOutcomes>,
  limit = 8
): NonNullable<AssistantResponse["matches"]> {
  return outcomes.slice(0, limit).map((o) => ({
    code: o.code,
    description: o.description,
    topicLabel: getPlanningTopicDisplayName(o.topicIds[0] ?? ""),
  }));
}

function resolveSecYearGroup(parsed: ParsedAssistantQuery): {
  yearGroupId: YearGroupId;
  yearLabel: string;
} {
  const id = parsed.yearGroupId ?? "year-10";
  return { yearGroupId: id, yearLabel: getYearGroupLabel(id) };
}

function isSecContext(parsed: ParsedAssistantQuery): boolean {
  const q = parsed.normalised;
  return (
    parsed.pathwayIds.includes("pe-option-sec") ||
    parsed.topicId === "pe-option-theory" ||
    /\b(sec pe|pe option|matsec|sec\.lo|anatomy scheme|cardiovascular system lesson|principles of training|revision activit|fitness testing outcome|exam prep)\b/.test(
      q
    )
  );
}

export function handleSecPeAssistantQuery(
  parsed: ParsedAssistantQuery,
  _context: AssistantQueryContext
): AssistantResponse | null {
  if (!isSecContext(parsed)) return null;

  const q = parsed.normalised;
  const { yearGroupId, yearLabel } = resolveSecYearGroup(parsed);

  if (/\b(create|build|plan)\b/.test(q) && /\banatomy\b/.test(q) && /\bscheme\b/.test(q)) {
    const outcomes = getOutcomesBySecCategory("anatomy-physiology", yearLabel);
    const title = suggestedSchemeTitle("pe-option-theory", yearLabel, "Term 1");
    return {
      answer: `**SEC PE Option anatomy scheme** for **${yearLabel}** — ${outcomes.length} anatomy outcomes mapped. Sequence: skeletal → muscular → cardiovascular → respiratory systems with exam-style retrieval each week.`,
      detectedContext: {
        intent: "Create SEC anatomy scheme",
        yearGroup: yearLabel,
        topic: "Anatomy & Physiology",
        confidence: parsed.confidence,
      },
      matches: toMatches(outcomes),
      waltExamples: buildWaltIdeas("Anatomy", "cardiovascular system"),
      successCriteria: [...SOW_WILF_CARDS].slice(0, 4),
      relatedOutcomeCodes: outcomes.map((o) => o.code),
      relatedTopicIds: ["pe-option-theory"],
      suggestions: SEC_KNOWLEDGE_TOPICS.slice(0, 4),
      suggestedTitle: title,
      schemeDraftSource: {
        yearGroupId,
        appPathways: ["pe-option-sec"],
        topicId: "pe-option-theory",
        skillId: outcomes[0]?.skillIds[0] ?? "analysis",
        term: "Term 1",
        outcomeIds: outcomes.map((o) => o.id),
      },
      actions: [{
        label: "Open Scheme Builder",
        href: buildSchemesLink({
          appPathways: ["pe-option-sec"],
          yearGroupId,
          topicLabel: "PE Option Theory",
        }),
        variant: "primary",
      }],
    };
  }

  if (/\b(create|build|plan)\b/.test(q) && /\bcardiovascular\b/.test(q) && /\blesson\b/.test(q)) {
    const result = querySecProgression({ anatomySubtopic: "cardiovascular-system", yearGroup: yearLabel });
    const assessments = buildSecAssessmentSuggestions(result.current.map((o) => o.id));
    return {
      answer: `**Cardiovascular system lesson** for SEC PE Option — focus on heart, circulation, and exercise response. Use labelled diagrams and sport application questions.`,
      detectedContext: {
        intent: "Create cardiovascular lesson",
        yearGroup: yearLabel,
        topic: "Cardiovascular system",
        confidence: parsed.confidence,
      },
      matches: toMatches(result.current.length ? result.current : getOutcomesBySecCategory("anatomy-physiology", yearLabel)),
      waltExamples: [
        "We are learning how the cardiovascular system responds to exercise.",
        "We are learning the role of the heart in sport performance.",
      ],
      successCriteria: [
        "I can label key structures of the cardiovascular system.",
        "I can explain how heart rate changes during exercise.",
      ],
      relatedOutcomeCodes: result.current.map((o) => o.code),
      relatedTopicIds: ["pe-option-theory"],
      suggestions: assessments.revisionPrompts.slice(0, 3),
    };
  }

  if (/\bexplain\b/.test(q) && /\bprinciples of training\b/.test(q)) {
    const outcomes = getOutcomesBySecCategory("fitness-training", yearLabel);
    const assessments = buildSecAssessmentSuggestions(outcomes.map((o) => o.id));
    return {
      answer:
        "**Principles of training** (specificity, overload, progression, reversibility, variation, recovery) guide how athletes adapt. SEC LO2 connects components, principles, and testing into a training concept.",
      detectedContext: {
        intent: "Explain training principles",
        yearGroup: yearLabel,
        topic: "Principles of training",
        confidence: parsed.confidence,
      },
      matches: toMatches(outcomes),
      waltExamples: buildWaltIdeas("Fitness", "training principles"),
      relatedOutcomeCodes: outcomes.map((o) => o.code),
      relatedTopicIds: ["fitness", "pe-option-theory"],
      suggestions: assessments.examStyleQuestions.slice(0, 3),
    };
  }

  if (/\brevision activit/i.test(q) && /\bmotivat/i.test(q)) {
    const outcomes = getOutcomesBySecCategory("sport-psychology", yearLabel);
    const assessments = buildSecAssessmentSuggestions(outcomes.map((o) => o.id));
    return {
      answer:
        "**Revision activities for motivation** — mind map linking personality, arousal, aggression, and SMART targets. Include scenario cards: how would motivation differ pre-competition vs training?",
      detectedContext: {
        intent: "Revision activities",
        yearGroup: yearLabel,
        topic: "Motivation",
        confidence: parsed.confidence,
      },
      matches: toMatches(outcomes),
      waltExamples: ["We are revising motivation and goal setting for SEC PE Option."],
      successCriteria: assessments.revisionPrompts.slice(0, 3),
      relatedOutcomeCodes: outcomes.map((o) => o.code),
      relatedTopicIds: ["pe-option-theory"],
      suggestions: [
        "Create a SEC PE Option anatomy scheme",
        "Show exam topic coverage",
        "Show missing revision topics",
      ],
    };
  }

  if (/\b(show|list|all)\b/.test(q) && /\bfitness testing\b/.test(q) && /\boutcome/i.test(q)) {
    const outcomes = querySecProgression({
      category: "fitness-training",
      yearGroup: yearLabel,
    }).current;
    return {
      answer: `Found **${outcomes.length}** SEC outcomes covering **fitness testing and training** for **${yearLabel}**.`,
      detectedContext: {
        intent: "Find fitness testing outcomes",
        yearGroup: yearLabel,
        topic: "Fitness testing",
        confidence: parsed.confidence,
      },
      matches: toMatches(outcomes),
      relatedOutcomeCodes: outcomes.map((o) => o.code),
      relatedTopicIds: ["fitness", "pe-option-theory"],
      suggestions: buildSecAssessmentSuggestions(outcomes.map((o) => o.id)).assessmentOpportunities.slice(0, 3),
    };
  }

  if (/\b(show|revision topic|exam topic|missing topic|weak topic)\b/i.test(q)) {
    const topics =
      /\bexam\b/.test(q)
        ? showExamTopicCoverage()
        : /\bmissing\b/.test(q)
          ? showMissingTopics()
          : showRevisionTopics();

    const lines = topics
      .map((t) => `- **${t.label}** (${t.outcomeCount} outcomes) — ${t.status.replace("-", " ")}`)
      .join("\n");

    return {
      answer: `**SEC PE Option revision overview** for **${yearLabel}**:\n\n${lines}`,
      detectedContext: {
        intent: "Revision overview",
        yearGroup: yearLabel,
        topic: "Revision intelligence",
        confidence: parsed.confidence,
      },
      matches: toMatches(getSecPeOptionOutcomes(yearLabel)),
      relatedOutcomeCodes: topics.flatMap((t) => t.outcomeCodes),
      relatedTopicIds: ["pe-option-theory"],
      suggestions: [...SEC_KNOWLEDGE_TOPICS],
    };
  }

  if (/\bsec pe option\b/.test(q) || parsed.pathwayIds.includes("pe-option-sec")) {
    const all = getSecPeOptionOutcomes(yearLabel);
    const categories = ALL_SEC_CATEGORIES.map((category) => {
        const count = getOutcomesBySecCategory(category, yearLabel).length;
        return `- **${SEC_CATEGORY_LABELS[category]}**: ${count} outcomes`;
      })
      .join("\n");

    return {
      answer: `**SEC PE Option** intelligence for **${yearLabel}** — ${all.length} outcomes across theory and practical strands.\n\n${categories}`,
      detectedContext: {
        intent: "SEC PE Option overview",
        yearGroup: yearLabel,
        pathways: ["PE Option SEC"],
        confidence: parsed.confidence,
      },
      matches: toMatches(all),
      waltExamples: buildWaltIdeas("SEC PE Option", "theory"),
      relatedOutcomeCodes: all.map((o) => o.code),
      relatedTopicIds: ["pe-option-theory"],
      suggestions: [
        "Create a SEC PE Option anatomy scheme",
        "Explain principles of training",
        "Generate revision activities for motivation",
      ],
    };
  }

  return null;
}
