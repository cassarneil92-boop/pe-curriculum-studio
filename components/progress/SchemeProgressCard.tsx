import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { SchemeProgressSummary } from "@/lib/progress/summary";

export function SchemeProgressCard({ summary }: { summary: SchemeProgressSummary }) {
  const statusTone =
    summary.status === "completed"
      ? "green"
      : summary.status === "in_progress"
        ? "teal"
        : "slate";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{summary.title || "Untitled scheme"}</p>
          <p className="mt-1 text-sm text-slate-600">
            {summary.deliveredLessons}/{summary.totalLessons} lessons delivered ·{" "}
            {summary.remainingLessons} remaining
          </p>
        </div>
        <Badge tone={statusTone}>
          {summary.status === "completed"
            ? "Completed"
            : summary.status === "in_progress"
              ? "In progress"
              : "Draft"}
        </Badge>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {summary.taughtOutcomes} outcomes taught · {summary.plannedOutcomes} planned in scheme
      </p>
    </Card>
  );
}
