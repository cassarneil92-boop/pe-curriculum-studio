"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import type { UpcomingLesson } from "@/lib/dashboard/insights";

interface UpcomingTeachingPanelProps {
  lessons: UpcomingLesson[];
}

export function UpcomingTeachingPanel({ lessons }: UpcomingTeachingPanelProps) {
  return (
    <Card>
      <CardHeader
        title="Upcoming teaching"
        description="Next scheduled lessons from your calendar."
      />
      {lessons.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">No upcoming lessons scheduled.</p>
          <Link href="/lesson-builder">
            <Button>Create Lesson</Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{lesson.title}</p>
                <p className="text-slate-500">
                  {lesson.date}
                  {lesson.time ? ` · ${lesson.time}` : ""}
                  {lesson.classGroup ? ` · ${lesson.classGroup}` : ""}
                </p>
              </div>
              <Link href="/calendar">
                <Button variant="ghost" className="text-xs">
                  Calendar
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
