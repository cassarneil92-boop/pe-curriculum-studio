import { getYearGroupLabel } from "@/lib/year-groups";
import type { YearGroupId } from "@/lib/year-groups";
import { buildSchemesLink } from "@/lib/curriculum-hub/planning-links";
import { suggestedSchemeTitle } from "@/lib/scheme-builder/helpers";
import { buildWaltIdeas, SOW_WILF_CARDS } from "@/lib/scheme-builder/constants";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import {
  describeTrainingMethodsToProgrammeDesign,
  getFitnessCurriculumOutcomes,
  getOutcomesByHealthComponent,
  getOutcomesByTrainingMethod,
  queryFitnessProgression,
  TRAINING_METHOD_LABELS,
} from "@/src/lib/curriculum/fitness-curriculum";
import { FITNESS_BATTERY } from "@/src/lib/intelligence/frameworks/fitness-strands";
import { FITNESS_KNOWLEDGE_TOPICS } from "@/src/lib/peKnowledge/fitnessCurriculumMaster";
import type { ParsedAssistantQuery } from "./query-parser";
import type { AssistantResponse, AssistantQueryContext } from "./responses";

function toMatches(
  outcomes: ReturnType<typeof getFitnessCurriculumOutcomes>,
  limit = 8
): NonNullable<AssistantResponse["matches"]> {
  return outcomes.slice(0, limit).map((o) => ({
    code: o.code,
    description: o.description,
    topicLabel: getPlanningTopicDisplayName(o.topicIds[0] ?? ""),
  }));
}

function resolveFitnessYearGroup(parsed: ParsedAssistantQuery): {
  yearGroupId: YearGroupId;
  yearLabel: string;
} {
  const id = parsed.yearGroupId ?? "year-10";
  return { yearGroupId: id, yearLabel: getYearGroupLabel(id) };
}

function isFitnessContext(parsed: ParsedAssistantQuery): boolean {
  const q = parsed.normalised;
  return (
    parsed.pathwayIds.includes("fitness-curriculum") ||
    parsed.topicId === "fitness" ||
    (parsed.yearGroupId &&
      ["year-7", "year-8", "year-9", "year-10", "year-11"].includes(parsed.yearGroupId) &&
      /\b(fitness|training|endurance|interval|circuit|hrf)\b/.test(q)) ||
    /\b(fitness curriculum|health related fitness|hrf|interval training|continuous training|circuit training|fartlek|resistance training|cardiovascular|muscular endurance|fitness test|form [45] fitness)\b/.test(
      q
    )
  );
}

export function handleFitnessAssistantQuery(
  parsed: ParsedAssistantQuery,
  _context: AssistantQueryContext
): AssistantResponse | null {
  if (!isFitnessContext(parsed)) return null;

  const q = parsed.normalised;
  const { yearGroupId, yearLabel } = resolveFitnessYearGroup(parsed);

  if (/\b(compare|versus|vs|difference between)\b/.test(q) && /\bcontinuous\b/.test(q) && /\binterval\b/.test(q)) {
    return {
      answer:
        "**Continuous training** keeps activity at moderate intensity for a sustained period — ideal for building cardiovascular endurance base.\n\n**Interval training** alternates work and rest at higher intensity — develops both aerobic capacity and recovery management.\n\nBoth appear in the fitness catalogue; choose based on year group readiness and lesson focus.",
      detectedContext: {
        intent: "Compare training methods",
        yearGroup: yearLabel,
        topic: "Training methods",
        confidence: parsed.confidence,
      },
      matches: toMatches([
        ...getOutcomesByTrainingMethod("continuous-training", yearLabel),
        ...getOutcomesByTrainingMethod("interval-training", yearLabel),
      ]),
      waltExamples: [
        "We are learning to apply continuous training safely.",
        "We are learning to structure an interval training session.",
      ],
      successCriteria: [...SOW_WILF_CARDS].slice(0, 4),
      relatedOutcomeCodes: [],
      relatedTopicIds: ["fitness"],
      suggestions: FITNESS_KNOWLEDGE_TOPICS.slice(0, 4),
    };
  }

  if (/\bexplain\b/.test(q) && /\binterval\b/.test(q)) {
    const outcomes = getOutcomesByTrainingMethod("interval-training", yearLabel);
    return {
      answer:
        "**Interval training** alternates periods of higher-intensity work with recovery. In school fitness, this might be shuttle runs, timed stations, or work:rest circuits. Students should understand intensity, recovery, and how overload applies.",
      detectedContext: {
        intent: "Explain fitness concept",
        yearGroup: yearLabel,
        topic: "Interval training",
        confidence: parsed.confidence,
      },
      matches: toMatches(outcomes),
      waltExamples: buildWaltIdeas("Fitness", "interval training"),
      relatedOutcomeCodes: outcomes.map((o) => o.code),
      relatedTopicIds: ["fitness"],
      suggestions: ["Create a 6 lesson cardiovascular endurance unit", "Compare continuous and interval training"],
    };
  }

  if (/\bmuscular endurance\b/.test(q) && /\boutcome/.test(q)) {
    const outcomes = getOutcomesByHealthComponent("muscular-endurance", yearLabel);
    return {
      answer: `Found **${outcomes.length}** outcomes related to **muscular endurance** for **${yearLabel}**.`,
      detectedContext: {
        intent: "Find fitness outcomes",
        yearGroup: yearLabel,
        topic: "Muscular endurance",
        confidence: parsed.confidence,
      },
      matches: toMatches(outcomes),
      relatedOutcomeCodes: outcomes.map((o) => o.code),
      relatedTopicIds: ["fitness"],
      suggestions: ["Suggest assessment ideas for fitness testing"],
    };
  }

  if (/\b(assessment|test)\b/.test(q) && /\b(fitness|shuttle|plank|hexagon)\b/.test(q)) {
    const battery = FITNESS_BATTERY.map((t) => t.label).join(", ");
    const outcomes = queryFitnessProgression({
      category: "fitness-testing",
      yearGroup: yearLabel,
    }).current;
    return {
      answer: `**Fitness testing suggestions** for **${yearLabel}**:\n\nCommon Fitness Battery: ${battery}.\n\nUse results for **personal goal setting** and interpretation — not ranking alone. ${outcomes.length} catalogue outcomes support testing and interpretation.`,
      detectedContext: {
        intent: "Fitness assessment ideas",
        yearGroup: yearLabel,
        confidence: parsed.confidence,
      },
      matches: toMatches(outcomes),
      successCriteria: [
        "I can perform the test with safe technique.",
        "I can record and interpret my result against a personal goal.",
      ],
      relatedOutcomeCodes: outcomes.map((o) => o.code),
      relatedTopicIds: ["fitness"],
      suggestions: ["Show progression from training methods to programme design"],
    };
  }

  if (/\bprogression\b/.test(q) && /\b(training method|programme|program design)\b/.test(q)) {
    const progression = describeTrainingMethodsToProgrammeDesign();
    const matches = toMatches([...progression.previous.slice(0, 4), ...progression.current.slice(0, 4)]);
    return {
      answer:
        progression.narrative ??
        "Progression from training methods toward personal programme design across the fitness catalogue.",
      detectedContext: {
        intent: "Fitness progression",
        yearGroup: yearLabel,
        topic: "Training methods → programme design",
        confidence: parsed.confidence,
      },
      matches,
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: ["fitness"],
      suggestions: ["Create a Form 4 fitness scheme"],
    };
  }

  if (/\bcardiovascular\b/.test(q) && /\b(6 lesson|unit|scheme|sow)\b/.test(q)) {
    const outcomes = getOutcomesByHealthComponent("cardiovascular-endurance", yearLabel).slice(0, 12);
    const matches = toMatches(outcomes);
    const lessonCount = parsed.lessonCount ?? 6;
    const schemeHref = buildSchemesLink({
      appPathways: ["fitness-curriculum"],
      yearGroupId,
      topicLabel: "Fitness",
    });
    return {
      answer: `I can help you plan a **${lessonCount}-lesson cardiovascular endurance unit** for **${yearLabel}**. ${outcomes.length} related outcomes are in the fitness catalogue.`,
      detectedContext: {
        intent: "Create fitness scheme",
        yearGroup: yearLabel,
        topic: "Cardiovascular endurance",
        lessonCount,
        confidence: parsed.confidence,
      },
      matches,
      planningSequence: [
        { lessonNumber: 1, focus: "Components of fitness", activity: "Introduce cardiovascular endurance and safe warm-up" },
        { lessonNumber: 2, focus: "Continuous training", activity: "Sustained moderate activity with pacing cues" },
        { lessonNumber: 3, focus: "Interval training", activity: "Work:rest intervals — shuttle or circuit" },
        { lessonNumber: 4, focus: "Training principles", activity: "Overload and progression in practice" },
        { lessonNumber: 5, focus: "Fitness testing", activity: "Shuttle run or timed endurance check" },
        { lessonNumber: 6, focus: "Goal setting", activity: "Interpret results and plan next steps" },
      ].slice(0, lessonCount),
      waltExamples: buildWaltIdeas("Fitness", "cardiovascular endurance"),
      successCriteria: [...SOW_WILF_CARDS].slice(0, 4),
      suggestedTitle: suggestedSchemeTitle("fitness", yearLabel, "Term 1"),
      suggestedLessonCount: lessonCount,
      schemeDraftSource: {
        yearGroupId,
        appPathways: ["fitness-curriculum"],
        topicId: "fitness",
        skillId: outcomes[0]?.skillIds[0] ?? "endurance",
        term: "Term 1",
        outcomeIds: outcomes.map((o) => o.id),
      },
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: ["fitness"],
      suggestions: [
        "Compare continuous and interval training",
        "Suggest assessment ideas for fitness testing",
      ],
      actions: [
        { label: "Start fitness scheme", href: schemeHref, variant: "primary" },
        { label: "Coverage Dashboard", href: "/curriculum-coverage", variant: "secondary" },
      ],
    };
  }

  if (
    (/\bscheme\b|\bsow\b|\bunit\b/.test(q) || parsed.intent === "create-scheme") &&
    (/\bform 4\b|\bform 5\b|\bfitness\b/.test(q) || parsed.pathwayIds.includes("fitness-curriculum"))
  ) {
    const outcomes = getFitnessCurriculumOutcomes(yearLabel).slice(0, 12);
    const matches = toMatches(outcomes);
    const lessonCount = parsed.lessonCount ?? 6;
    const schemeHref = buildSchemesLink({
      appPathways: ["fitness-curriculum"],
      yearGroupId,
      topicLabel: "Fitness",
    });
    return {
      answer: `I can help you plan a **${lessonCount}-lesson fitness scheme** for **${yearLabel}**. The catalogue includes **${outcomes.length}** fitness outcomes (embedded syllabus + KB samples).`,
      detectedContext: {
        intent: "Create fitness scheme",
        yearGroup: yearLabel,
        topic: "Fitness",
        lessonCount,
        confidence: parsed.confidence,
      },
      matches,
      waltExamples: buildWaltIdeas("Fitness", "health related fitness"),
      successCriteria: [...SOW_WILF_CARDS].slice(0, 4),
      suggestedTitle: suggestedSchemeTitle("fitness", yearLabel, "Term 1"),
      suggestedLessonCount: lessonCount,
      schemeDraftSource: {
        yearGroupId,
        appPathways: ["fitness-curriculum"],
        topicId: "fitness",
        skillId: outcomes[0]?.skillIds[0] ?? "endurance",
        term: "Term 1",
        outcomeIds: outcomes.map((o) => o.id),
      },
      relatedOutcomeCodes: matches.map((m) => m.code),
      relatedTopicIds: ["fitness"],
      suggestions: [
        "Compare continuous and interval training",
        "Suggest assessment ideas for fitness testing",
      ],
      actions: [
        { label: "Start fitness scheme", href: schemeHref, variant: "primary" },
      ],
    };
  }

  if (/\btgfu\b/.test(q) && /\bfitness\b/.test(q)) {
    const outcomes = getFitnessCurriculumOutcomes(yearLabel).slice(0, 6);
    return {
      answer:
        "For fitness, TGfU applies when using **modified games** or **conditioned activities** where students solve movement problems (e.g. spacing, pacing, team roles) rather than isolated drills. Pair game-practice-game with named fitness components.",
      detectedContext: {
        intent: "Fitness lesson with TGfU",
        yearGroup: yearLabel,
        topic: "Fitness",
        confidence: parsed.confidence,
      },
      matches: toMatches(outcomes),
      relatedOutcomeCodes: outcomes.map((o) => o.code),
      relatedTopicIds: ["fitness", "games"],
      suggestions: ["Explain interval training", "Create a 6 lesson cardiovascular endurance unit"],
    };
  }

  if (/\bfitness\b/.test(q)) {
    const outcomes = getFitnessCurriculumOutcomes(yearLabel).slice(0, 8);
    return {
      answer: `**${outcomes.length}** fitness outcomes available for **${yearLabel}** across health related fitness, training methods, testing, and lifestyle topics.`,
      detectedContext: {
        intent: "Fitness curriculum overview",
        yearGroup: yearLabel,
        confidence: parsed.confidence,
      },
      matches: toMatches(outcomes),
      relatedOutcomeCodes: outcomes.map((o) => o.code),
      relatedTopicIds: ["fitness"],
      suggestions: [
        "Create a Form 4 fitness scheme",
        "Compare continuous and interval training",
        "Which outcomes teach muscular endurance?",
      ],
      actions: [{ label: "Coverage Dashboard", href: "/curriculum-coverage", variant: "secondary" }],
    };
  }

  return null;
}
