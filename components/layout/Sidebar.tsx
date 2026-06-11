"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { BRAND_FOOTER, BRAND_PATHS } from "@/lib/brand/constants";
import { NAV_SECTIONS } from "@/lib/constants";
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
      <Link
        href="/"
        className="border-b border-white/10 px-4 py-5 transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <Image
            src={BRAND_PATHS.icon}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-xl object-contain"
            priority
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug tracking-tight text-white">
              PE Curriculum
            </p>
            <p className="text-sm font-semibold leading-snug tracking-tight text-white/90">
              Studio
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
        <p className="text-[11px] text-teal-100/60">{BRAND_FOOTER}</p>
      </div>
    </aside>
  );
}
