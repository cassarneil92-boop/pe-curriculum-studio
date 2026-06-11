import { Badge } from "@/components/ui/Badge";
import { deliveryStatusLabel } from "@/lib/progress/delivery";
import type { LessonDeliveryStatus } from "@/lib/types";

const TONES: Record<LessonDeliveryStatus, "green" | "teal" | "amber" | "slate"> = {
  delivered: "green",
  planned: "teal",
  skipped: "amber",
  moved: "slate",
};

export function DeliveryStatusBadge({ status }: { status?: LessonDeliveryStatus }) {
  const value = status ?? "planned";
  return <Badge tone={TONES[value]}>{deliveryStatusLabel(value)}</Badge>;
}
