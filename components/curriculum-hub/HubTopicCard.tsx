"use client";

import { Badge } from "@/components/ui/Badge";
import { TOPIC_THEMES } from "@/lib/design/topic-theme";
import type { HubTopicGroup } from "@/lib/curriculum-hub/engine";

interface HubTopicCardProps {
  topic: HubTopicGroup;
  onClick: () => void;
}

export function HubTopicCard({ topic, onClick }: HubTopicCardProps) {
  const theme = TOPIC_THEMES[topic.color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${theme.border} ${theme.bg}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${theme.iconBg}`}
          aria-hidden
        >
          {topic.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {topic.category}
          </p>
          <p className="mt-0.5 font-semibold text-slate-900 group-hover:text-teal-900">
            {topic.name}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {topic.totalCount} outcome{topic.totalCount !== 1 ? "s" : ""}
            {topic.yearRange ? ` · ${topic.yearRange}` : ""}
          </p>
          {topic.pathwayLabels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {topic.pathwayLabels.map((label) => (
                <Badge key={label} tone="teal">
                  {label}
                </Badge>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-slate-500">
            {topic.skillsCount} skill{topic.skillsCount !== 1 ? "s" : ""} available
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/70">
            <div
              className={`h-full rounded-full transition-all ${theme.bar}`}
              style={{ width: `${Math.max(topic.coverage * 100, 8)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {topic.visibleCount} visible outcomes in your context
          </p>
        </div>
      </div>
    </button>
  );
}
