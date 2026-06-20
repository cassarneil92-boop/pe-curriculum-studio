import Link from "next/link";
import type { ReactNode } from "react";

export function QuickActionCard({
  href,
  title,
  description,
  icon,
  accent = "teal",
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent?: "teal" | "blue" | "amber" | "purple" | "green";
}) {
  const accents = {
    teal: "from-teal-500/8 to-teal-600/4 border-teal-100/90 hover:border-teal-200",
    blue: "from-blue-500/8 to-blue-600/4 border-blue-100/90 hover:border-blue-200",
    amber: "from-amber-500/8 to-amber-600/4 border-amber-100/90 hover:border-amber-200",
    purple: "from-violet-500/8 to-violet-600/4 border-violet-100/90 hover:border-violet-200",
    green: "from-emerald-500/8 to-emerald-600/4 border-emerald-100/90 hover:border-emerald-200",
  };

  return (
    <Link
      href={href}
      className={`group rounded-[20px] border bg-gradient-to-br p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${accents[accent]}`}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/90 text-teal-700 shadow-sm ring-1 ring-black/5">
        {icon}
      </div>
      <p className="font-semibold text-[#0F172A] group-hover:text-teal-800">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
    </Link>
  );
}
