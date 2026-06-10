import type { LessonPlan, SchemeOfWork } from "@/lib/types";
import { getPlanningOutcomes, getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";
import { getPlanningOutcomeSuggestions } from "@/src/lib/curriculum/planning";
import type { TeacherContextSnapshot } from "@/lib/teacher-context";
import { PEDAGOGICAL_MODELS } from "../frameworks/pedagogical-models";
import { buildCurriculumAnalytics } from "../analytics/coverage-analytics";
import { buildSchemeAdvisoryAlignment } from "../advisory/scheme-alignment";

export interface AssistantResponse {
  answer: string;
  relatedOutcomeCodes: string[];
  relatedTopicIds: string[];
  suggestions: string[];
}

function normaliseQuery(q: string): string {
  return q.trim().toLowerCase();
}

function findOutcomesByCodeFragment(fragment: string) {
  const key = fragment.toUpperCase();
  return getPlanningOutcomes().filter(
    (o) => o.code.toUpperCase().includes(key) || o.code.toUpperCase() === key
  );
}

function findOutcomesByTopicSearch(query: string) {
  const q = normaliseQuery(query);
  return getPlanningOutcomes()
    .filter(
      (o) =>
        o.description.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        o.topicIds.some((id) => getPlanningTopicDisplayName(id).toLowerCase().includes(q))
    )
    .slice(0, 10);
}

export function queryCurriculumAssistant(
  prompt: string,
  context: {
    teacherContext: TeacherContextSnapshot;
    lessons: LessonPlan[];
    schemes: SchemeOfWork[];
    activeScheme?: SchemeOfWork;
  }
): AssistantResponse {
  const q = normaliseQuery(prompt);
  const suggestions: string[] = [];
  let answer = "";
  let relatedOutcomeCodes: string[] = [];
  let relatedTopicIds: string[] = [];

  // Code lookup e.g. OR9.11, NG7.4, HD8.2
  const codeMatch = prompt.match(/\b([A-Z]{1,3}\d+\.\d+[a-z]?)\b/i);
  if (codeMatch) {
    const outcomes = findOutcomesByCodeFragment(codeMatch[1]);
    if (outcomes.length > 0) {
      relatedOutcomeCodes = outcomes.map((o) => o.code);
      relatedTopicIds = [...new Set(outcomes.flatMap((o) => o.topicIds))];
      answer = outcomes
        .map((o) => `**${o.code}** — ${o.description}`)
        .join("\n\n");
      return { answer, relatedOutcomeCodes, relatedTopicIds, suggestions };
    }
  }

  // Missing outcomes in scheme
  if (q.includes("missing") && q.includes("scheme") && context.activeScheme) {
    const advisory = buildSchemeAdvisoryAlignment(context.activeScheme, context.teacherContext);
    relatedOutcomeCodes = advisory.uncoveredOutcomes.map((o) => o.code);
    answer = `Scheme alignment: **${advisory.score}%**\n\nUncovered in focus area (${advisory.uncoveredOutcomes.length}):\n${advisory.uncoveredOutcomes
      .slice(0, 8)
      .map((o) => `• ${o.code}: ${o.description}`)
      .join("\n")}`;
    suggestions.push(...advisory.recommendations);
    return { answer, relatedOutcomeCodes, relatedTopicIds, suggestions };
  }

  // TGfU / pedagogical model
  if (q.includes("tgfu") || q.includes("games for understanding") || q.includes("invasion")) {
    const model = PEDAGOGICAL_MODELS.find((m) => m.id === "tgfu");
    const invasionOutcomes = getPlanningOutcomes().filter((o) =>
      o.topicIds.some((t) => ["invasion-games", "football", "handball", "basketball"].includes(t))
    );
    relatedOutcomeCodes = invasionOutcomes.slice(0, 6).map((o) => o.code);
    answer = `${model?.description ?? "TGfU"} Use game-practice-game: start with a modified game, identify tactical problems, practise in context, return to game.\n\nSample invasion outcomes:\n${invasionOutcomes
      .slice(0, 5)
      .map((o) => `• ${o.code}`)
      .join("\n")}`;
    suggestions.push("Tag lessons with TGfU in the pedagogical model field.");
    return { answer, relatedOutcomeCodes, relatedTopicIds, suggestions };
  }

  // Volleyball lesson
  if (q.includes("volleyball")) {
    const suggestions_result = getPlanningOutcomeSuggestions({
      appPathways:
        context.teacherContext.visibleAppPathways.length > 0
          ? context.teacherContext.visibleAppPathways
          : ["general-pe"],
      yearGroup: "year-9",
      topicId: "volleyball",
      skillId: "",
      context: context.teacherContext,
    });
    const all = [...suggestions_result.strict, ...suggestions_result.additional];
    relatedOutcomeCodes = all.slice(0, 8).map((o) => o.code);
    relatedTopicIds = ["volleyball"];
    answer = `Volleyball outcomes in curriculum (${all.length} match topic):\n${all
      .slice(0, 6)
      .map((o) => `• **${o.code}** — ${o.description}`)
      .join("\n")}`;
    suggestions.push("Select outcomes manually in Lesson Builder — suggestions are not auto-applied.");
    return { answer, relatedOutcomeCodes, relatedTopicIds, suggestions };
  }

  // Coverage overview
  if (q.includes("coverage") || q.includes("analytics")) {
    const report = buildCurriculumAnalytics(context.lessons, context.schemes);
    const topGaps = report.underrepresented.slice(0, 5);
    answer = `Overall taught coverage: **${report.summary.overallCoveragePercent}%** (${report.summary.taughtOutcomeIds} outcomes across ${report.summary.lessonsAnalysed} lessons and ${report.summary.schemesAnalysed} schemes).\n\nUnderrepresented topics:\n${topGaps.map((t) => `• ${t.label}: ${t.coveragePercent}%`).join("\n") || "None identified yet."}`;
    suggestions.push("Open Curriculum Analytics for full heat maps and pathway breakdown.");
    return { answer, relatedOutcomeCodes, relatedTopicIds, suggestions };
  }

  // Topic search fallback
  const searchResults = findOutcomesByTopicSearch(prompt);
  if (searchResults.length > 0) {
    relatedOutcomeCodes = searchResults.map((o) => o.code);
    relatedTopicIds = [...new Set(searchResults.flatMap((o) => o.topicIds))];
    answer = `Found ${searchResults.length} curriculum outcomes matching your query:\n${searchResults
      .slice(0, 6)
      .map((o) => `• **${o.code}** (${getPlanningTopicDisplayName(o.topicIds[0] ?? "")}) — ${o.description}`)
      .join("\n")}`;
    return { answer, relatedOutcomeCodes, relatedTopicIds, suggestions };
  }

  answer =
    "I could not find a specific curriculum match. Try including an outcome code (e.g. OR9.11), a topic (e.g. Volleyball), or ask about missing outcomes in a scheme.";
  suggestions.push(
    "Example: \"Show missing outcomes in this scheme\"",
    "Example: \"Suggest TGfU activities for invasion games\"",
    "Example: \"OR9.11\""
  );
  return { answer, relatedOutcomeCodes, relatedTopicIds, suggestions };
}
