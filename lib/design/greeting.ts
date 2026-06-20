import type { TeacherProfile } from "@/lib/types";

export function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Preferred display name for dashboard greeting — falls back to "Teacher". */
export function getTeacherGreetingName(teacher: Pick<TeacherProfile, "preferredDisplayName" | "name">): string {
  if (teacher.preferredDisplayName?.trim()) {
    return teacher.preferredDisplayName.trim();
  }
  if (teacher.name?.trim()) {
    const first = teacher.name.trim().split(/\s+/)[0];
    if (first) return first;
  }
  return "Teacher";
}

/** Sidebar profile — full preferred name or full teacher name. */
export function getSidebarProfileName(
  teacher: Pick<TeacherProfile, "preferredDisplayName" | "name">
): string {
  if (teacher.preferredDisplayName?.trim()) {
    return teacher.preferredDisplayName.trim();
  }
  if (teacher.name?.trim()) {
    return teacher.name.trim();
  }
  return "Teacher";
}
