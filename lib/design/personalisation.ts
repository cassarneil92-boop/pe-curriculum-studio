import type { TeacherProfile } from "@/lib/types";
import { getPathwayLabel } from "@/lib/constants";
import { getTeacherGreetingName, getTimeGreeting } from "./greeting";
import { resolveSchoolDisplayName } from "@/src/lib/schools";

export interface TeacherPersonalisation {
  greeting: string;
  name: string;
  schoolLine: string;
  pathwayLine: string;
  roleLine: string;
}

export function buildTeacherPersonalisation(
  teacher: TeacherProfile,
  roleLabel?: string
): TeacherPersonalisation {
  const name = getTeacherGreetingName(teacher);
  const schoolName = resolveSchoolDisplayName(teacher.school, teacher.manualSchoolName);
  const primaryPathway = teacher.pathways[0];

  return {
    greeting: getTimeGreeting(),
    name,
    schoolLine: schoolName || "",
    pathwayLine: primaryPathway ? getPathwayLabel(primaryPathway) : "",
    roleLine: teacher.role?.trim() || roleLabel || "",
  };
}

export function formatWeeklyLessonSummary(count: number): string {
  if (count === 0) return "No lessons planned this week yet.";
  if (count === 1) return "You have 1 lesson planned this week.";
  return `You have ${count} lessons planned this week.`;
}

export function formatTodayLessonSummary(count: number): string {
  if (count === 0) return "Nothing scheduled for today.";
  if (count === 1) return "1 lesson scheduled today.";
  return `${count} lessons scheduled today.`;
}
