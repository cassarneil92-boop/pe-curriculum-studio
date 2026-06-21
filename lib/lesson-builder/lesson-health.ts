import type { LessonCoachingReport } from "@/lib/lesson-builder/curriculum-coaching";

export type LessonHealthStatus = "needs_work" | "developing" | "strong" | "excellent";

export interface LessonHealthSummary {
  percentage: number;
  status: LessonHealthStatus;
  statusLabel: string;
  strengths: string[];
  improvements: string[];
}

const STATUS_LABELS: Record<LessonHealthStatus, string> = {
  needs_work: "Needs work",
  developing: "Developing",
  strong: "Strong",
  excellent: "Excellent",
};

export function getLessonHealthStatus(percentage: number): LessonHealthStatus {
  if (percentage < 40) return "needs_work";
  if (percentage < 65) return "developing";
  if (percentage < 85) return "strong";
  return "excellent";
}

export function buildLessonHealthSummary(report: LessonCoachingReport): LessonHealthSummary {
  const status = getLessonHealthStatus(report.percentage);

  return {
    percentage: report.percentage,
    status,
    statusLabel: STATUS_LABELS[status],
    strengths: report.strengths.slice(0, 3).map((s) => s.label),
    improvements: report.suggestions.slice(0, 3).map((s) => s.label),
  };
}
