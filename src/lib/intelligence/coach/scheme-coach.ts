import type { SchemeOfWork } from "@/lib/types";
import { buildSchemeAdvisoryAlignment } from "../advisory/scheme-alignment";
import type { TeacherContextSnapshot } from "@/lib/teacher-context";
import { getPlanningTopicDisplayName } from "@/src/lib/curriculum/planning";

export interface SchemeCoachingFeedback {
  strengths: string[];
  suggestions: string[];
  alignmentScore: number;
  strandBalance: string[];
}

export function analyseSchemeCoaching(
  scheme: SchemeOfWork,
  context: TeacherContextSnapshot
): SchemeCoachingFeedback {
  const advisory = buildSchemeAdvisoryAlignment(scheme, context);
  const strengths: string[] = [];
  const suggestions: string[] = [...advisory.recommendations];
  const strandBalance: string[] = [];

  const lessonsWithContent = scheme.lessons.filter(
    (l) => l.learningOutcomeIds.length > 0 || l.walt.trim() || l.wilf.trim()
  ).length;

  if (lessonsWithContent > 0) {
    strengths.push(`${lessonsWithContent}/${scheme.lessons.length} lessons have content.`);
  }

  if (advisory.coveredOutcomes.length > 0) {
    strengths.push(`${advisory.coveredOutcomes.length} outcomes covered in scheme focus.`);
  }

  if (advisory.score >= 80) {
    strengths.push(`Strong curriculum alignment (${advisory.score}%).`);
  }

  const topic = getPlanningTopicDisplayName(scheme.topicId);
  strandBalance.push(`Primary focus: ${topic}`);

  if (advisory.missingHolistic.length > 0) {
    strandBalance.push("Holistic development: gaps identified");
    if (!suggestions.some((s) => s.includes("holistic"))) {
      suggestions.push("Balance content outcomes with holistic development (roles, responsibility).");
    }
  } else {
    strandBalance.push("Holistic development: represented");
  }

  if (scheme.pedagogicalModels?.length) {
    strengths.push("Pedagogical model tagged for this scheme.");
  } else {
    suggestions.push("Tag a pedagogical model (e.g. TGfU, Sport Education) to guide lesson design.");
  }

  return {
    strengths,
    suggestions,
    alignmentScore: advisory.score,
    strandBalance,
  };
}
