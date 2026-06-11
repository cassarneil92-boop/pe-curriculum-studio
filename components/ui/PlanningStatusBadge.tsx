import { Badge } from "@/components/ui/Badge";

export type PlanningStatus =
  | "draft"
  | "planned"
  | "scheduled"
  | "delivered"
  | "skipped"
  | "needs-attention"
  | "good"
  | "excellent";

const STATUS_CONFIG: Record<
  PlanningStatus,
  { label: string; tone: "slate" | "blue" | "teal" | "green" | "amber" | "rose" | "purple" }
> = {
  draft: { label: "Draft", tone: "slate" },
  planned: { label: "Planned", tone: "blue" },
  scheduled: { label: "Scheduled", tone: "teal" },
  delivered: { label: "Delivered", tone: "green" },
  skipped: { label: "Skipped", tone: "amber" },
  "needs-attention": { label: "Needs attention", tone: "rose" },
  good: { label: "Good", tone: "green" },
  excellent: { label: "Excellent", tone: "purple" },
};

export function PlanningStatusBadge({ status }: { status: PlanningStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
