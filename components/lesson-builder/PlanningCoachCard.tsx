"use client";

import { PlanningCoachBadge } from "@/components/lesson-builder/PlanningCoachBadge";
import { SOWPlanningCard } from "@/components/scheme-builder/SOWPlanningCard";
import type { SuggestionBadge } from "@/lib/lesson-builder/planning-coach-labels";

type CardTone = "teal" | "blue" | "purple" | "amber" | "green";

interface PlanningCoachCardProps {
  title: string;
  subtitle?: string;
  footer?: string;
  badge?: SuggestionBadge;
  tone: CardTone;
  used?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function PlanningCoachCard({
  title,
  subtitle,
  footer,
  badge,
  tone,
  used = false,
  disabled = false,
  onClick,
}: PlanningCoachCardProps) {
  return (
    <div className="space-y-1">
      {badge && (
        <div className="px-0.5">
          <PlanningCoachBadge badge={badge} />
        </div>
      )}
      <SOWPlanningCard
        title={title}
        subtitle={subtitle}
        footer={footer}
        tone={tone}
        used={used}
        disabled={disabled}
        onClick={onClick}
      />
    </div>
  );
}
