"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { SetupWizard } from "@/components/shared/SetupWizard";
import { useAppData } from "@/components/providers/AppProvider";

export function AppShell({ children }: { children: ReactNode }) {
  const { data, hydrated } = useAppData();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
          <p className="text-sm text-slate-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!data.setupComplete) {
    return <SetupWizard />;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700"
            aria-label="Open navigation menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">PE Curriculum Studio</p>
            <p className="truncate text-xs text-slate-500">Malta</p>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 xl:max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
