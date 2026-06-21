import type { TeacherProfile } from "@/lib/types";
import { getCollegeById, resolveSchoolDisplayName } from "@/src/lib/schools";
import { getPathwayLabel } from "@/lib/constants";
import { getYearGroupLabel } from "@/lib/year-groups";

export interface ExportDocumentContext {
  teacherName?: string;
  school?: string;
  college?: string;
  pathway?: string;
  yearGroup?: string;
  term?: string;
  classGroup?: string;
  generatedAt: string;
}

export function buildExportDocumentContext(
  teacher: TeacherProfile,
  options?: {
    pathwayId?: string;
    yearGroup?: string;
    term?: string;
    classGroup?: string;
  }
): ExportDocumentContext {
  const school = resolveSchoolDisplayName(teacher.school, teacher.manualSchoolName);
  const college = teacher.college ? getCollegeById(teacher.college)?.name : undefined;
  const teacherName = teacher.preferredDisplayName?.trim() || teacher.name?.trim();

  return {
    teacherName: teacherName || undefined,
    school: school || undefined,
    college: college || undefined,
    pathway: options?.pathwayId ? getPathwayLabel(options.pathwayId as never) : undefined,
    yearGroup: options?.yearGroup ? getYearGroupLabel(options.yearGroup as never) : undefined,
    term: options?.term,
    classGroup: options?.classGroup,
    generatedAt: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

export function formatExportMetaBlock(ctx: ExportDocumentContext): string {
  const lines: string[] = [];
  if (ctx.teacherName) lines.push(`Teacher: ${escapeHtml(ctx.teacherName)}`);
  if (ctx.school) lines.push(`School: ${escapeHtml(ctx.school)}`);
  if (ctx.college) lines.push(`College: ${escapeHtml(ctx.college)}`);
  if (ctx.pathway) lines.push(`Pathway: ${escapeHtml(ctx.pathway)}`);
  if (ctx.yearGroup) lines.push(`Year group: ${escapeHtml(ctx.yearGroup)}`);
  if (ctx.classGroup) lines.push(`Class: ${escapeHtml(ctx.classGroup)}`);
  if (ctx.term) lines.push(`Term: ${escapeHtml(ctx.term)}`);
  lines.push(`Generated: ${escapeHtml(ctx.generatedAt)}`);
  return lines.join("<br />");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
