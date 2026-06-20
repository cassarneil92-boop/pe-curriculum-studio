"use client";

import Image from "next/image";
import { BRAND_PATHS, BRAND_TAGLINE } from "@/lib/brand/constants";
import type { TeacherPersonalisation } from "@/lib/design/personalisation";

export function DashboardHero({
  personal,
  subtitle,
}: {
  personal: TeacherPersonalisation;
  subtitle: string;
}) {
  const showBrandCard = personal.pathwayLine || personal.schoolLine || personal.roleLine;

  return (
    <section className="rounded-[20px] border border-slate-200/80 bg-gradient-to-br from-white via-white to-teal-50/30 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)] sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium text-teal-700">
            {personal.greeting}, {personal.name} 👋
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight text-[#0F172A]">
            Your Teaching Workspace
          </h1>
          <p className="mt-2 text-sm font-medium tracking-[0.12em] text-slate-500">
            {BRAND_TAGLINE}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{subtitle}</p>
        </div>

        {showBrandCard && (
          <div className="flex shrink-0 items-start gap-3 rounded-[20px] border border-teal-100/90 bg-white/90 px-5 py-4 shadow-sm lg:min-w-[220px]">
            <Image
              src={BRAND_PATHS.icon}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-xl object-contain"
            />
            <div className="min-w-0 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700/70">
                Your context
              </p>
              {personal.pathwayLine && (
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">{personal.pathwayLine}</p>
              )}
              {personal.schoolLine && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{personal.schoolLine}</p>
              )}
              {personal.roleLine && (
                <p className="mt-1 text-xs text-slate-500">{personal.roleLine}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
