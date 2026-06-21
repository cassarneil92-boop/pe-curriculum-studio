"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import type { IntelligenceTeacherView } from "@/lib/progress/intelligence-teacher-view";

const HEALTH_CONFIG = {
  strong: { emoji: "🟢", title: "Strong", className: "text-emerald-800" },
  needs_attention: { emoji: "🟡", title: "Needs attention", className: "text-amber-800" },
  missing: { emoji: "🔴", title: "Missing", className: "text-rose-800" },
} as const;

interface CurriculumHealthHeroProps {
  health: IntelligenceTeacherView["health"];
}

export function CurriculumHealthHero({ health }: CurriculumHealthHeroProps) {
  const groups = [
    { key: "strong" as const, items: health.strong },
    { key: "needs_attention" as const, items: health.needsAttention },
    { key: "missing" as const, items: health.missing },
  ].filter((g) => g.items.length > 0);

  return (
    <Card className="border-teal-100/80 bg-gradient-to-br from-teal-50/30 to-white">
      <CardHeader
        title="Curriculum health"
        description="Am I on track? Key curriculum areas at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {groups.map(({ key, items }) => {
          const config = HEALTH_CONFIG[key];
          return (
            <div key={key} className="rounded-xl border border-slate-100 bg-white/80 px-4 py-3">
              <p className={`text-sm font-semibold ${config.className}`}>
                {config.emoji} {config.title}
              </p>
              <ul className="mt-2 space-y-1">
                {items.map((item) => (
                  <li key={item.id} className="text-sm text-slate-800">
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
