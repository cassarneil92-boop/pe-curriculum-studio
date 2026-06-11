"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { SetupWizard } from "@/components/shared/SetupWizard";
import { useApp } from "@/components/providers/AppProvider";

export function AppShell({ children }: { children: ReactNode }) {
  const { data, hydrated } = useApp();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-slate-500">Loading your workspace…</p>
      </div>
    );
  }

  if (!data.setupComplete) {
    return <SetupWizard />;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10 lg:py-10 xl:max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
