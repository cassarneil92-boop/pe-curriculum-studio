export function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getTeacherDisplayName(
  schoolName: string,
  manualName?: string
): string {
  if (manualName?.trim()) {
    const first = manualName.trim().split(/\s+/)[0];
    if (first) return first;
  }
  if (schoolName?.trim()) {
    const first = schoolName.trim().split(/\s+/)[0];
    if (first && first.length > 2) return first;
  }
  return "there";
}
