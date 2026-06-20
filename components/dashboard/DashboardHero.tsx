"use client";

import Link from "next/link";
import { BRAND_TAGLINE } from "@/lib/brand/constants";
import { getSidebarProfileName, getTeacherGreetingName, getTimeGreeting } from "@/lib/design/greeting";
import type { TeacherProfile } from "@/lib/types";
import { getCollegeById, resolveSchoolDisplayName } from "@/src/lib/schools";

export function DashboardHero({
  teacher,
  subtitle,
}: {
  teacher: TeacherProfile;
  subtitle: string;
}) {
  const greeting = getTimeGreeting();
  const greetingName = getTeacherGreetingName(teacher);
  const displayName = getSidebarProfileName(teacher);
  const role = teacher.role?.trim() ?? "";
  const collegeName = teacher.college ? getCollegeById(teacher.college)?.name ?? "" : "";
  const schoolName = resolveSchoolDisplayName(teacher.school, teacher.manualSchoolName);

  return (
    <section className="rounded-[20px] border border-slate-200/80 bg-gradient-to-br from-white via-white to-teal-50/30 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium text-teal-700">
            {greeting}, {greetingName} 👋
          </p>
          <h1 className="mt-1.5 text-[28px] font-bold leading-tight tracking-tight text-[#0F172A] sm:text-[32px]">
            Your Teaching Workspace
          </h1>
          <p className="mt-1.5 text-sm font-medium tracking-[0.12em] text-slate-500">
            {BRAND_TAGLINE}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{subtitle}</p>
        </div>

        <div className="relative shrink-0 rounded-2xl border border-teal-100/90 bg-white/95 px-4 py-3 shadow-sm lg:w-[260px]">
          <Link
            href="/settings"
            className="absolute right-3 top-3 text-xs font-medium text-teal-700 transition-colors hover:text-teal-900"
          >
            Edit
          </Link>
          <p className="pr-10 text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-700/70">
            Your workspace
          </p>
          <p
            className="mt-2 truncate text-[17px] font-semibold leading-snug text-[#0F172A]"
            title={displayName}
          >
            {displayName}
          </p>
          {role ? (
            <p className="mt-0.5 truncate text-sm text-slate-600" title={role}>
              {role}
            </p>
          ) : null}
          {collegeName ? (
            <p className="mt-2 truncate text-xs leading-snug text-slate-500" title={collegeName}>
              {collegeName}
            </p>
          ) : null}
          {schoolName ? (
            <p className="mt-0.5 truncate text-xs leading-snug text-slate-500" title={schoolName}>
              {schoolName}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
