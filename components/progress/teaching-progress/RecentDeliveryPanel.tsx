"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import type { RecentDeliveryItem } from "@/lib/progress/teaching-progress-teacher-view";

interface RecentDeliveryPanelProps {
  items: RecentDeliveryItem[];
}

export function RecentDeliveryPanel({ items }: RecentDeliveryPanelProps) {
  return (
    <Card>
      <CardHeader
        title="Recent delivery"
        description="Last lessons marked as delivered."
      />
      {items.length === 0 ? (
        <p className="text-sm text-slate-600">No delivered lessons yet.</p>
      ) : (
        <ol className="relative space-y-4 border-l-2 border-teal-100 pl-4">
          {items.map((item) => (
            <li key={item.id} className="relative">
              <span
                className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-teal-500"
                aria-hidden
              />
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-500">{item.date}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
