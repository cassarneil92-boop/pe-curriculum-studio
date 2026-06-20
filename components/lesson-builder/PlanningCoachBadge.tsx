import { BADGE_STYLES, type SuggestionBadge } from "@/lib/lesson-builder/planning-coach-labels";

export function PlanningCoachBadge({ badge }: { badge: SuggestionBadge }) {
  const styles = BADGE_STYLES[badge];
  return (
    <span
      className={`inline-flex shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {badge}
    </span>
  );
}
