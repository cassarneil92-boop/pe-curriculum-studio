/** Precise active-route matching — avoids `/curriculum` matching `/curriculum-analytics`. */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const NAV_DIAGNOSTICS =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

export function warnNavIssue(message: string, detail?: Record<string, unknown>): void {
  if (!NAV_DIAGNOSTICS) return;
  console.warn(`[Navigation] ${message}`, detail ?? "");
}
