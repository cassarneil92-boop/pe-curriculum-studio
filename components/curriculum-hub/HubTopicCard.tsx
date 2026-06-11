"use client";

import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TOPIC_THEMES } from "@/lib/design/topic-theme";
import type { TopicTeachingStats } from "@/lib/progress/hub-stats";
import type { HubTopicGroup } from "@/lib/curriculum-hub/engine";

interface HubTopicCardProps {
  topic: HubTopicGroup;
  stats?: TopicTeachingStats;
  onClick: () => void;
}

export function HubTopicCard({ topic, stats, onClick }: HubTopicCardProps) {
  const theme = TOPIC_THEMES[topic.color];
  const taughtPercent = stats?.taughtPercent ?? 0;

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

          {stats ? (
            <>
              <p className="mt-2 text-xs text-slate-600">
                <span className="font-semibold">Outcomes:</span> {stats.totalOutcomes}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-1 text-[11px] text-slate-600">
                <span>
                  <span className="font-semibold text-emerald-700">{stats.taught}</span> taught
                </span>
                <span>
                  <span className="font-semibold text-blue-700">{stats.planned}</span> planned
                </span>
                <span>
                  <span className="font-semibold text-amber-700">{stats.remaining}</span> remaining
                </span>
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={taughtPercent}
                  label={topic.name}
                  variant="teal"
                  showPercent
                />
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-600">
              {topic.totalCount} outcome{topic.totalCount !== 1 ? "s" : ""}
              {topic.yearRange ? ` · ${topic.yearRange}` : ""}
            </p>
          )}

          {topic.pathwayLabels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {topic.pathwayLabels.map((label) => (
                <Badge key={label} tone="teal">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
