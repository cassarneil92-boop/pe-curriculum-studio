import type { TeacherProfile } from "@/lib/types";
import { getTeacherGreetingName, getTimeGreeting } from "./greeting";

export interface TeacherPersonalisation {
  greeting: string;
  name: string;
}

export function buildTeacherPersonalisation(teacher: TeacherProfile): TeacherPersonalisation {
  return {
    greeting: getTimeGreeting(),
    name: getTeacherGreetingName(teacher),
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
