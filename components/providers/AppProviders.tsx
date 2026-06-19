"use client";

import type { ReactNode } from "react";
import { AppProvider } from "./AppProvider";
import { ToastProvider } from "./ToastProvider";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppProvider>
        <NavigationProgress />
        {children}
      </AppProvider>
    </ToastProvider>
  );
}
