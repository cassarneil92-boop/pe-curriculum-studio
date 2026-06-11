import { getTopicDisplayName } from "@/lib/scheme-builder/curriculum-options";
import { schemeDisplayTitle } from "@/lib/scheme-builder/helpers";
import { getTopicTheme } from "@/lib/design/topic-theme";
import type { TopicTheme } from "@/lib/design/topic-theme";
import type { CalendarEntry, SchemeOfWork } from "@/lib/types";
import { parseIso, toIso } from "./dates";

export interface TermUnitBlock {
  id: string;
  schemeId: string;
  title: string;
  topicName: string;
  theme: TopicTheme;
  startDate: string;
  endDate: string;
  totalLessons: number;
  deliveredLessons: number;
  scheduledLessons: number;
  scheduled: boolean;
}

export interface DraftSchemeBlock {
  id: string;
  schemeId: string;
  title: string;
  topicName: string;
  theme: TopicTheme;
  totalLessons: number;
  deliveredLessons: number;
  lessonsStillToTeach: number;
}

export function buildTermUnitBlocks(
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[]
): TermUnitBlock[] {
  const blocks: TermUnitBlock[] = [];

  for (const scheme of schemes) {
    const linked = calendar.filter(
      (e) => e.linkedSchemeId === scheme.id && e.startDate
    );
    if (linked.length === 0) continue;

    const dates = linked.map((e) => e.startDate).sort();
    const topicName = scheme.topicId
      ? getTopicDisplayName(scheme.topicId)
      : linked[0]?.sport || "PE Unit";
    const delivered = scheme.lessons.filter((l) => l.deliveryStatus === "delivered").length;

    blocks.push({
      id: scheme.id,
      schemeId: scheme.id,
      title: schemeDisplayTitle(scheme) || topicName,
      topicName,
      theme: getTopicTheme(topicName),
      startDate: dates[0],
      endDate: dates[dates.length - 1],
      totalLessons: scheme.lessons.length,
      deliveredLessons: delivered,
      scheduledLessons: linked.length,
      scheduled: true,
    });
  }

  return blocks.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function buildDraftSchemeBlocks(
  schemes: SchemeOfWork[],
  calendar: CalendarEntry[]
): DraftSchemeBlock[] {
  const drafts: DraftSchemeBlock[] = [];

  for (const scheme of schemes) {
    const hasScheduled = calendar.some(
      (e) => e.linkedSchemeId === scheme.id && e.startDate
    );
    if (hasScheduled) continue;
    if (scheme.lessons.length === 0) continue;

    const topicName = scheme.topicId
      ? getTopicDisplayName(scheme.topicId)
      : "PE Unit";
    const delivered = scheme.lessons.filter((l) => l.deliveryStatus === "delivered").length;
    const remaining = scheme.lessons.filter(
      (l) => l.deliveryStatus !== "delivered" && l.deliveryStatus !== "skipped"
    ).length;

    drafts.push({
      id: scheme.id,
      schemeId: scheme.id,
      title: schemeDisplayTitle(scheme) || topicName,
      topicName,
      theme: getTopicTheme(topicName),
      totalLessons: scheme.lessons.length,
      deliveredLessons: delivered,
      lessonsStillToTeach: remaining,
    });
  }

  return drafts;
}

export function blockSpansWeek(
  block: TermUnitBlock,
  weekStartIso: string
): { startCol: number; span: number } | null {
  const weekStart = parseIso(weekStartIso);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const blockStart = parseIso(block.startDate);
  const blockEnd = parseIso(block.endDate);

  if (blockEnd < weekStart || blockStart > weekEnd) return null;

  const startCol = Math.max(
    0,
    Math.floor((Math.max(blockStart.getTime(), weekStart.getTime()) - weekStart.getTime()) / 86400000)
  );
  const endCol = Math.min(
    6,
    Math.floor((Math.min(blockEnd.getTime(), weekEnd.getTime()) - weekStart.getTime()) / 86400000)
  );

  return { startCol: startCol + 1, span: endCol - startCol + 1 };
}

export function currentUnitBlock(
  blocks: TermUnitBlock[],
  todayIso: string
): TermUnitBlock | null {
  return (
    blocks.find((b) => b.startDate <= todayIso && b.endDate >= todayIso) ?? null
  );
}

export function upcomingUnitBlock(
  blocks: TermUnitBlock[],
  todayIso: string
): TermUnitBlock | null {
  return blocks.find((b) => b.startDate > todayIso) ?? null;
}

export function weekEntries(calendar: CalendarEntry[], weekStartIso: string): CalendarEntry[] {
  const weekStart = parseIso(weekStartIso);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const endIso = toIso(weekEnd);

  return calendar.filter(
    (e) => e.startDate && e.startDate >= weekStartIso && e.startDate <= endIso
  );
}
