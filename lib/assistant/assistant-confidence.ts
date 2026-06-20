import { allLessonsHaveOutcomes } from "@/lib/assistant/outcome-distribution";
import { isSportSpecificTopic } from "@/lib/assistant/sport-progressions";

export type AssistantConfidenceLevel = "high" | "medium" | "low";

export interface AssistantConfidenceReport {
  level: AssistantConfidenceLevel;
  label: string;
  detail: string;
}

export function computeAssistantConfidence(input: {
  matchCount: number;
  outcomeIds: string[];
  topicId: string;
  lessonCount: number;
  outcomeBuckets: string[][];
}): AssistantConfidenceReport {
  const sportSpecific = isSportSpecificTopic(input.topicId);
  const outcomesLinked = input.outcomeIds.length;
  const allLessonsCovered = allLessonsHaveOutcomes(input.outcomeBuckets);

  let score = 0;
  if (input.matchCount >= 6) score += 3;
  else if (input.matchCount >= 3) score += 2;
  else if (input.matchCount >= 1) score += 1;

  if (outcomesLinked >= input.lessonCount) score += 2;
  else if (outcomesLinked >= Math.ceil(input.lessonCount / 2)) score += 1;

  if (allLessonsCovered) score += 2;
  if (sportSpecific) score += 2;

  let level: AssistantConfidenceLevel = "low";
  if (score >= 7) level = "high";
  else if (score >= 4) level = "medium";

  const label =
    level === "high"
      ? "High confidence"
      : level === "medium"
        ? "Medium confidence"
        : "Low confidence";

  const detailParts: string[] = [];
  detailParts.push(`${input.matchCount} curriculum match${input.matchCount === 1 ? "" : "es"}`);
  detailParts.push(`${outcomesLinked} outcome${outcomesLinked === 1 ? "" : "s"} linked`);
  if (sportSpecific) detailParts.push("sport-specific progression applied");
  else detailParts.push("generic progression applied");

  return {
    level,
    label,
    detail: detailParts.join(" · "),
  };
}

export function confidenceTone(level: AssistantConfidenceLevel): string {
  switch (level) {
    case "high":
      return "text-emerald-800 bg-emerald-50 border-emerald-200";
    case "medium":
      return "text-amber-900 bg-amber-50 border-amber-200";
    default:
      return "text-slate-700 bg-slate-50 border-slate-200";
  }
}
