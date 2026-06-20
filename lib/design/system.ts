/** Shared design tokens — Ministry-grade, Apple-inspired restraint. */

export const colors = {
  navy: "#0F172A",
  teal: "#0F766E",
  gold: "#D4A72C",
  background: "#F7F9FB",
  card: "#FFFFFF",
  border: "#E5E7EB",
} as const;

export const radius = {
  button: "rounded-[14px]",
  card: "rounded-[20px]",
  tag: "rounded-full",
} as const;

export const shadow = {
  card: "shadow-[0_1px_3px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.04)]",
  cardHover: "shadow-[0_8px_32px_rgba(15,23,42,0.08)]",
} as const;

export const typography = {
  pageTitle: "text-[32px] font-bold leading-tight tracking-tight text-[#0F172A]",
  sectionTitle: "text-[22px] font-semibold leading-snug tracking-tight text-[#0F172A]",
  cardTitle: "text-lg font-semibold leading-snug tracking-tight text-[#0F172A]",
  body: "text-sm leading-relaxed text-slate-600",
  caption: "text-xs font-medium text-slate-500",
} as const;
