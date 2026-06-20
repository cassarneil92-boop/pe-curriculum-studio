"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTeacherProfile } from "@/components/providers/AppProvider";
import { BRAND_FOOTER, BRAND_PATHS } from "@/lib/brand/constants";
import { NAV_SECTIONS } from "@/lib/constants";
import { getSidebarProfileName } from "@/lib/design/greeting";
import { isNavItemActive, warnNavIssue } from "@/lib/navigation";
import { getCollegeById, resolveSchoolDisplayName } from "@/src/lib/schools";
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
  onAfterNavigate,
}: SidebarNavLinkProps & { onAfterNavigate?: () => void }) {
  const active = isNavItemActive(pathname, href);

  const handleClick = useCallback(() => {
    onNavigate(href);
    onAfterNavigate?.();
  }, [href, onNavigate, onAfterNavigate]);

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
  const displayName = getSidebarProfileName(teacher);
  const role = teacher.role?.trim() ?? "";
  const collegeName = teacher.college ? getCollegeById(teacher.college)?.name ?? "" : "";
  const schoolName = resolveSchoolDisplayName(teacher.school, teacher.manualSchoolName);

  return (
    <div className="mt-3 px-1">
      <div className="rounded-xl bg-teal-800/35 px-3 py-2.5 ring-1 ring-white/10">
        <p className="truncate text-[13px] font-semibold leading-snug text-white" title={displayName}>
          {displayName}
        </p>
        {role ? (
          <p className="mt-0.5 truncate text-[11px] leading-snug text-teal-100/85" title={role}>
            {role}
          </p>
        ) : null}
        {collegeName ? (
          <p className="mt-1 truncate text-[11px] leading-snug text-teal-50/75" title={collegeName}>
            {collegeName}
          </p>
        ) : null}
        {schoolName ? (
          <p className="mt-0.5 truncate text-[11px] leading-snug text-teal-50/70" title={schoolName}>
            {schoolName}
          </p>
        ) : null}
      </div>
    </div>
  );
});

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [, forceNavSync] = useState(0);
  const pendingNavRef = useRef<string | null>(null);
  const retryTimerRef = useRef<number | null>(null);

  const closeMobile = useCallback(() => onMobileClose?.(), [onMobileClose]);

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

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
          aria-label="Close navigation menu"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`app-sidebar no-print fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-[#0F766E] text-white transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      <Link
        href="/"
        prefetch
        onClick={() => {
          handleNavigate("/");
          closeMobile();
        }}
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
            onAfterNavigate={closeMobile}
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
                  onAfterNavigate={closeMobile}
                />
              ))}
            </div>
          </div>
        ))}

        <SidebarProfile />
      </nav>

      <div className="shrink-0 border-t border-white/10 px-6 py-2.5">
        <p className="text-[10px] leading-snug text-teal-100/45">{BRAND_FOOTER}</p>
      </div>
    </aside>
    </>
  );
}
