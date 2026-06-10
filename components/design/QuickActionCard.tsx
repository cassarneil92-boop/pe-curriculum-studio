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
    teal: "from-teal-500/10 to-teal-600/5 border-teal-100 hover:border-teal-200",
    blue: "from-blue-500/10 to-blue-600/5 border-blue-100 hover:border-blue-200",
    amber: "from-amber-500/10 to-amber-600/5 border-amber-100 hover:border-amber-200",
    purple: "from-violet-500/10 to-violet-600/5 border-violet-100 hover:border-violet-200",
    green: "from-emerald-500/10 to-emerald-600/5 border-emerald-100 hover:border-emerald-200",
  };

  return (
    <Link
      href={href}
      className={`group rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${accents[accent]}`}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-teal-700 shadow-sm ring-1 ring-black/5">
        {icon}
      </div>
      <p className="font-semibold text-slate-800 group-hover:text-teal-800">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
    </Link>
  );
}
