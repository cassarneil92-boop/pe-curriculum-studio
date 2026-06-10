"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { APP_NAME, APP_SUBTITLE, NAV_ITEMS } from "@/lib/constants";
import { getPathwayLabel } from "@/lib/constants";
import { resolveSchoolDisplayName } from "@/src/lib/schools";
import { NavIcon } from "./NavIcon";

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useApp();
  const { context } = useTeacherContext();
  const schoolName = resolveSchoolDisplayName(
    data.teacher.school,
    data.teacher.manualSchoolName
  );

  return (
    <aside className="app-sidebar no-print flex w-64 shrink-0 flex-col bg-[#0F766E] text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-100/90">
          {APP_SUBTITLE}
        </p>
        <h1 className="mt-1 text-lg font-semibold leading-snug tracking-tight">{APP_NAME}</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-teal-50/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <p className="truncate text-sm font-medium text-white">
            {schoolName || "Your school"}
          </p>
          <p className="mt-0.5 text-xs text-teal-100/80">{context.roleLabel}</p>
          {data.teacher.pathways[0] && (
            <p className="mt-2 truncate text-xs text-teal-50/70">
              {getPathwayLabel(data.teacher.pathways[0])}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4">
        <p className="text-[11px] text-teal-100/60">PE Curriculum Studio © Neil Cassar</p>
      </div>
    </aside>
  );
}
