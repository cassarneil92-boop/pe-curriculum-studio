"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTeacherProfile } from "@/components/providers/AppProvider";
import { useTeacherContext } from "@/hooks/useTeacherContext";
import { BRAND_FOOTER, BRAND_PATHS } from "@/lib/brand/constants";
import { NAV_SECTIONS } from "@/lib/constants";
import { getPathwayLabel } from "@/lib/constants";
import { getTeacherGreetingName } from "@/lib/design/greeting";
import { isNavItemActive, warnNavIssue } from "@/lib/navigation";
import { resolveSchoolDisplayName } from "@/src/lib/schools";
import { NavIcon, type IconName } from "./NavIcon";

/** Heavy routes — disable prefetch to avoid main-thread contention during navigation. */
const HEAVY_ROUTES = new Set([
  "/schemes",
  "/lesson-builder",
  "/curriculum",
  "/curriculum-analytics",
  "/calendar",
]);

const NAV_RETRY_MS = 2500;

function navLinkClass(active: boolean): string {
  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    active
      ? "bg-white/20 text-white shadow-sm ring-1 ring-white/20"
      : "text-teal-50/90 hover:bg-white/10 hover:text-white"
  }`;
}

interface SidebarNavLinkProps {
  href: string;
  label: string;
  icon: IconName;
  pathname: string;
  onNavigate: (href: string) => void;
}

const SidebarNavLink = memo(function SidebarNavLink({
  href,
  label,
  icon,
  pathname,
  onNavigate,
}: SidebarNavLinkProps) {
  const active = isNavItemActive(pathname, href);

  const handleClick = useCallback(() => {
    onNavigate(href);
  }, [href, onNavigate]);

  return (
    <Link
      href={href}
      prefetch={!HEAVY_ROUTES.has(href)}
      onClick={handleClick}
      aria-current={active ? "page" : undefined}
      className={navLinkClass(active)}
    >
      <NavIcon name={icon} />
      {label}
    </Link>
  );
});

const SidebarProfile = memo(function SidebarProfile() {
  const teacher = useTeacherProfile();
  const { context } = useTeacherContext();
  const schoolName = resolveSchoolDisplayName(teacher.school, teacher.manualSchoolName);
  const displayName = getTeacherGreetingName(teacher);

  return (
    <div className="border-t border-white/10 px-4 py-4">
      <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
        <p className="truncate text-sm font-medium text-white">{displayName}</p>
        <p className="mt-0.5 truncate text-xs text-teal-100/80">
          {teacher.role?.trim() || context.roleLabel}
        </p>
        {schoolName && (
          <p className="mt-1 truncate text-xs text-teal-50/70">{schoolName}</p>
        )}
        {teacher.pathways[0] && (
          <p className="mt-1 truncate text-xs text-teal-50/60">
            {getPathwayLabel(teacher.pathways[0])}
          </p>
        )}
      </div>
    </div>
  );
});

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [, forceNavSync] = useState(0);
  const pendingNavRef = useRef<string | null>(null);
  const retryTimerRef = useRef<number | null>(null);

  const clearNavRetry = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    pendingNavRef.current = null;
  }, []);

  const scheduleNavRetry = useCallback(
    (href: string) => {
      clearNavRetry();
      pendingNavRef.current = href;

      retryTimerRef.current = window.setTimeout(() => {
        const pending = pendingNavRef.current;
        if (!pending || pending !== href) return;

        const actualPath = window.location.pathname;
        if (actualPath !== href && pathname !== href) {
          warnNavIssue("Navigation appears stuck — retrying route change", {
            target: href,
            pathname,
            actualPath,
          });
          try {
            router.push(href);
          } catch (error) {
            warnNavIssue("router.push failed during nav retry", { href, error });
          }
        }
        pendingNavRef.current = null;
      }, NAV_RETRY_MS);
    },
    [clearNavRetry, pathname, router]
  );

  const handleNavigate = useCallback(
    (href: string) => {
      scheduleNavRetry(href);
    },
    [scheduleNavRetry]
  );

  useEffect(() => {
    clearNavRetry();
  }, [pathname, clearNavRetry]);

  useEffect(() => {
    const actualPath = window.location.pathname;
    if (actualPath !== pathname) {
      warnNavIssue("Route mismatch detected — syncing sidebar active state", {
        pathname,
        actualPath,
      });
      forceNavSync((n) => n + 1);
    }
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => forceNavSync((n) => n + 1);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <aside className="app-sidebar no-print flex w-64 shrink-0 flex-col bg-[#0F766E] text-white">
      <Link
        href="/"
        prefetch
        onClick={() => handleNavigate("/")}
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
          <SidebarNavLink
            href="/"
            label="Dashboard"
            icon="home"
            pathname={pathname}
            onNavigate={handleNavigate}
          />
        </div>

        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-teal-100/50">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  pathname={pathname}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <SidebarProfile />

      <div className="border-t border-white/10 px-6 py-3">
        <p className="text-[10px] text-teal-100/50">{BRAND_FOOTER}</p>
      </div>
    </aside>
  );
}
