"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import type { AttentionItem } from "@/lib/progress/teaching-progress-teacher-view";

interface AttentionNeededPanelProps {
  items: AttentionItem[];
}

export function AttentionNeededPanel({ items }: AttentionNeededPanelProps) {
  if (items.length === 0) return null;

  return (
    <Card className="border-amber-100 bg-amber-50/25">
      <CardHeader title="Attention needed" description="Items that may need your action." />
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-2 rounded-lg bg-white/70 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="flex items-start gap-2 text-sm text-amber-950">
              <span aria-hidden>⚠</span>
              {item.message}
            </span>
            {item.actionHref && item.actionLabel && (
              <Link href={item.actionHref} className="shrink-0">
                <Button variant="secondary" className="text-xs">
                  {item.actionLabel}
                </Button>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
