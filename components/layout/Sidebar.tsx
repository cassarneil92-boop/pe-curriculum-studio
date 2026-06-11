"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { BRAND_FOOTER, BRAND_PATHS } from "@/lib/brand/constants";
import { NAV_SECTIONS } from "@/lib/constants";
import { getPathwayLabel } from "@/lib/constants";
import { getTeacherGreetingName } from "@/lib/design/greeting";
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
  const displayName = getTeacherGreetingName(data.teacher);

  return (
    <aside className="app-sidebar no-print flex w-64 shrink-0 flex-col bg-[#0F766E] text-white">
      <Link
        href="/"
        className="border-b border-white/10 px-4 py-4 transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-2.5">
          <Image
            src={BRAND_PATHS.icon}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-lg object-contain"
            priority
          />
          <div className="min-w-0 leading-tight">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-teal-100/50">
              Malta
            </p>
            <p className="text-[13px] font-semibold tracking-tight text-white/95">
              PE Curriculum Studio
            </p>
          </div>
        </div>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        <div>
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-white/20 text-white shadow-sm ring-1 ring-white/20"
                : "text-teal-50/90 hover:bg-white/10 hover:text-white"
            }`}
          >
            <NavIcon name="home" />
            Dashboard
          </Link>
        </div>

        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-teal-100/50">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-white/20 text-white shadow-sm ring-1 ring-white/20"
                        : "text-teal-50/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <NavIcon name={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <p className="truncate text-sm font-medium text-white">{displayName}</p>
          <p className="mt-0.5 truncate text-xs text-teal-100/80">
            {data.teacher.role?.trim() || context.roleLabel}
          </p>
          {schoolName && (
            <p className="mt-1 truncate text-xs text-teal-50/70">{schoolName}</p>
          )}
          {data.teacher.pathways[0] && (
            <p className="mt-1 truncate text-xs text-teal-50/60">
              {getPathwayLabel(data.teacher.pathways[0])}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-3">
        <p className="text-[10px] text-teal-100/50">{BRAND_FOOTER}</p>
      </div>
    </aside>
  );
}
