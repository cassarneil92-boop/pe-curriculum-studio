import { Badge, type BadgeTone } from "./Badge";

export function StatusBadge({
  label,
  tone = "slate",
}: {
  label: string;
  tone?: BadgeTone;
}) {
  return (
    <Badge tone={tone} className="text-[11px] font-semibold uppercase tracking-wide">
      {label}
    </Badge>
  );
}
