"use client";

import type { ReactNode } from "react";

interface StickyActionBarProps {
  children: ReactNode;
  className?: string;
}

export function StickyActionBar({ children, className = "" }: StickyActionBarProps) {
  return (
    <div
      className={`no-print sticky top-0 z-20 -mx-6 border-b border-slate-200/80 bg-[#F8FAFC]/95 px-6 py-3 backdrop-blur-sm lg:-mx-10 lg:px-10 ${className}`}
    >
      {children}
    </div>
  );
}
