import type { SchemeProgressSummary } from "./summary";

export type CoverageScoreLevel =
  | "needs_attention"
  | "developing"
  | "good"
  | "excellent";

export interface CoverageScore {
  percent: number;
  level: CoverageScoreLevel;
  label: string;
  tone: "rose" | "amber" | "blue" | "green";
  barVariant: "rose" | "amber" | "blue" | "green";
}

export function coveragePercentFromSummary(summary: SchemeProgressSummary): number {
  if (summary.plannedOutcomes === 0) {
    return summary.totalLessons > 0
      ? Math.round((summary.deliveredLessons / summary.totalLessons) * 100)
      : 0;
  }
  return Math.round((summary.taughtOutcomes / summary.plannedOutcomes) * 100);
}

export function lessonProgressPercent(summary: SchemeProgressSummary): number {
  if (summary.totalLessons === 0) return 0;
  return Math.round((summary.deliveredLessons / summary.totalLessons) * 100);
}

export function getCoverageScore(percent: number): CoverageScore {
  const safe = Math.max(0, Math.min(100, percent));

  if (safe <= 25) {
    return {
      percent: safe,
      level: "needs_attention",
      label: "Needs Attention",
      tone: "rose",
      barVariant: "rose",
    };
  }
  if (safe <= 50) {
    return {
      percent: safe,
      level: "developing",
      label: "Developing",
      tone: "amber",
      barVariant: "amber",
    };
  }
  if (safe <= 75) {
    return {
      percent: safe,
      level: "good",
      label: "Good",
      tone: "blue",
      barVariant: "blue",
    };
  }
  return {
    percent: safe,
    level: "excellent",
    label: "Excellent",
    tone: "green",
    barVariant: "green",
  };
}
