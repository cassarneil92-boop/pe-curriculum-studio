import { getYearGroupLabel } from "@/lib/year-groups";
import type { YearGroupId } from "@/lib/year-groups";
import { buildSchemesLink } from "@/lib/curriculum-hub/planning-links";
import { suggestedSchemeTitle } from "@/lib/scheme-builder/helpers";
import { buildWaltIdeas, SOW_WILF_CARDS } from "@/lib/scheme-builder/constants";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import {
  describeThrowingToInvasionProgression,
  getOutcomesByPhysicalLiteracy,
  getOutcomesByStrand,
  getPrimaryPEOutcomes,
  queryPrimaryProgression,
} from "@/src/lib/curriculum/primary-pe";
import { STRAND_LABELS } from "@/src/lib/curriculum/primary-pe/progression-framework";
import type { ParsedAssistantQuery } from "./query-parser";
import type { AssistantResponse, AssistantQueryContext } from "./responses";

function toMatches(
  outcomes: ReturnType<typeof getPrimaryPEOutcomes>,
  limit = 8
): NonNullable<AssistantResponse["matches"]> {
  return outcomes.slice(0, limit).map((o) => ({
    code: o.code,
    description: o.description,
    topicLabel: getPlanningTopicDisplayName(o.topicIds[0] ?? ""),
  }));
}

function resolvePrimaryYearGroup(parsed: ParsedAssistantQuery): string {
  if (parsed.yearGroupId) return getYearGroupLabel(parsed.yearGroupId);
  return "Year 3";
}

export function handlePrimaryPEAssistantQuery(
  parsed: ParsedAssistantQuery,
  context: AssistantQueryContext
): AssistantResponse | null {
  const q = parsed.normalised;
  const yearLabel = resolvePrimaryYearGroup(parsed);
  const yearGroupId = parsed.yearGroupId ?? "year-3";

  const isPrimaryContext =
    parsed.pathwayIds.includes("primary-pe") ||
    (parsed.yearGroupId &&
      ["year-1", "year-2", "year-3", "year-4", "year-5", "year-6"].includes(parsed.yearGroupId)) ||
    /\b(primary|fms|fundamental movement|year [1-6])\b/.test(q);

  if (!isPrimaryContext) return null;

  if (
    /\b(what comes before|comes before|prior to|progression from|progression to|build up to)\b/.test(q)
  ) {
    const progression = q.includes("invasion")
      ? describeThrowingToInvasionProgression()
      : queryPrimaryProgression({
          yearGroup: yearLabel,
          topicId: parsed.topicId ?? undefined,
          skillHint: parsed.skillHint ?? undefined,
        });

    const matches = toMatches(
      [...progression.previous, ...progression.current].slice(0, 10)
    );

    return {
      answer:
        progression.narrative ??
        `Primary progression for **${yearLabel}**: ${progression.current.length} current outcomes, ${progression.previous.length} from the prior year, ${progression.next.length} leading into the next year.`,
      detectedContext: {
        intent: "Primary PE progression",
        yearGroup: yearLabel,
        topic: parsed.topicLabel ?? undefined,
        confidence: parsed.confidence,
      },
      matches,
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: parsed.topicId ? [parsed.topicId] : ["fundamentals", "invasion-games"],
      suggestions: [
        "Create a Year 3 FMS scheme",
        "Show Year 4 balance outcomes",
        "Which outcomes support confidence development?",
      ],
    };
  }

  if (
    (/\bfms\b/.test(q) || /\bfundamental movement\b/.test(q)) &&
    (/\bscheme\b|\bsow\b|\bunit\b/.test(q) || parsed.intent === "create-scheme")
  ) {
    const outcomes = getOutcomesByStrand("fundamental-movement-skills", yearLabel).slice(0, 12);
    const matches = toMatches(outcomes);
    const topicId = "fundamentals";
    const schemeHref = buildSchemesLink({
      appPathways: ["primary-pe"],
      yearGroupId: yearGroupId as YearGroupId,
      topicLabel: "Fundamentals",
    });

    return {
      answer: `I can help you plan a **Fundamental Movement Skills** scheme for **${yearLabel}**. ${outcomes.length} FMS outcomes are available in the primary catalogue.`,
      detectedContext: {
        intent: "Create Primary FMS scheme",
        yearGroup: yearLabel,
        topic: STRAND_LABELS["fundamental-movement-skills"],
        confidence: parsed.confidence,
      },
      matches,
      waltExamples: buildWaltIdeas("Fundamentals", "movement skills"),
      successCriteria: [...SOW_WILF_CARDS].slice(0, 4),
      suggestedTitle: suggestedSchemeTitle(topicId, yearLabel, "Term 1"),
      suggestedLessonCount: parsed.lessonCount ?? 6,
      schemeDraftSource: {
        yearGroupId: yearGroupId as YearGroupId,
        appPathways: ["primary-pe"],
        topicId,
        skillId: outcomes[0]?.skillIds[0] ?? "balance",
        term: "Term 1",
        outcomeIds: outcomes.map((o) => o.id),
      },
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: [topicId],
      suggestions: [
        "Review FMS outcomes in Scheme Builder before saving.",
        "Combine locomotor and manipulative stations across the unit.",
      ],
      actions: [
        { label: "Start FMS scheme", href: schemeHref, variant: "primary" },
        { label: "Open Coverage Dashboard", href: "/curriculum-coverage", variant: "secondary" },
      ],
    };
  }

  if (/\bbalance\b/.test(q) && /\boutcome/.test(q)) {
    const outcomes = queryPrimaryProgression({
      yearGroup: yearLabel.includes("Year 4") ? "Year 4" : yearLabel,
      skillHint: "balance",
    }).current;
    const matches = toMatches(outcomes);

    return {
      answer: `Found **${outcomes.length}** balance-related outcomes for **${yearLabel}** in the Primary PE catalogue.`,
      detectedContext: {
        intent: "Find Primary PE outcomes",
        yearGroup: yearLabel,
        topic: "Balance / movement competence",
        confidence: parsed.confidence,
      },
      matches,
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: ["fundamentals", "gymnastics"],
      suggestions: [
        `Create a ${parsed.lessonCount ?? 6} lesson balance scheme for ${yearLabel}`,
        "What comes before invasion games?",
      ],
    };
  }

  if (/\bconfidence\b/.test(q)) {
    const outcomes = getOutcomesByPhysicalLiteracy("confidence", yearLabel);
    const matches = toMatches(outcomes);

    return {
      answer: `These **${outcomes.length}** Primary PE outcomes support **confidence** development for **${yearLabel}** — through achievable success, safe practice, and positive participation.`,
      detectedContext: {
        intent: "Physical literacy — confidence",
        yearGroup: yearLabel,
        confidence: parsed.confidence,
      },
      matches,
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: ["fundamentals", "gymnastics", "holistic-development"],
      suggestions: [
        "Pair confidence outcomes with low-stakes personal best tasks.",
        `Create a ${parsed.lessonCount ?? 6} lesson FMS scheme for ${yearLabel}`,
      ],
      actions: [
        {
          label: "Browse Primary PE coverage",
          href: "/curriculum-coverage",
          variant: "secondary",
        },
      ],
    };
  }

  if (/\bthrow(ing)?\b/.test(q) && /\binvasion\b/.test(q)) {
    const progression = describeThrowingToInvasionProgression();
    const matches = toMatches(
      [...progression.previous.slice(0, 4), ...progression.current.slice(0, 4)]
    );

    return {
      answer:
        progression.narrative ??
        "Progression from early throwing in fundamentals toward invasion games outcomes in upper primary.",
      detectedContext: {
        intent: "Primary PE progression",
        yearGroup: "Year 2 → Year 4",
        topic: "Throwing to invasion games",
        confidence: parsed.confidence,
      },
      matches,
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: ["fundamentals", "invasion-games"],
      suggestions: [
        "Create a Year 3 FMS scheme",
        "Show Year 4 balance outcomes",
      ],
    };
  }

  if (/\bprimary pe\b/.test(q) && /\bprogression\b/.test(q)) {
    const summary = queryPrimaryProgression({ yearGroup: yearLabel });
    const matches = toMatches(summary.current);

    return {
      answer: `Primary PE progression for **${yearLabel}**: ${summary.current.length} outcomes this year, ${summary.previous.length} from the year before, ${summary.next.length} preparing for the next year.`,
      detectedContext: {
        intent: "Primary PE progression overview",
        yearGroup: yearLabel,
        confidence: parsed.confidence,
      },
      matches,
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: ["fundamentals", "games", "invasion-games"],
      suggestions: [
        "Create a Year 3 FMS scheme",
        "Which outcomes support confidence development?",
      ],
      actions: [
        { label: "Coverage Dashboard", href: "/curriculum-coverage", variant: "primary" },
      ],
    };
  }

  return null;
}
