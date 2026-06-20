import Link from "next/link";
import Image from "next/image";
import { BrandLogoFull } from "@/components/brand/BrandLogoFull";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  BRAND_FOOTER,
  BRAND_PATHS,
  BRAND_SUBTAGLINE,
  BRAND_TAGLINE,
} from "@/lib/brand/constants";
import { APP_NAME } from "@/lib/constants";

const FEATURES = [
  {
    title: "Curriculum Alignment",
    description:
      "Browse official Maltese PE learning outcomes, filter by pathway and year group, and align every lesson to the curriculum you are required to teach.",
  },
  {
    title: "Lesson Planning",
    description:
      "Build structured, curriculum-aligned lesson plans with learning intentions, activities, and quality checks — ready to preview, export, or deliver.",
  },
  {
    title: "Schemes of Work",
    description:
      "Plan term-long progressions with calm, card-based views. Link lessons to outcomes and track delivery across your academic year.",
  },
  {
    title: "Coverage Tracking",
    description:
      "See what you have planned, delivered, and still need to teach. Teaching Progress gives you a clear picture of curriculum health.",
  },
  {
    title: "Teaching Resources",
    description:
      "Build your personal library of lesson cards, assessment sheets, and curriculum resources — organised and ready when you need them.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        eyebrow="Product"
        title="About PE Curriculum Studio"
        description="Official-quality planning software for Malta PE teachers — calm, curriculum-aligned, and built for the classroom."
      />

      <Card className="overflow-hidden !p-0">
        <div className="bg-gradient-to-br from-teal-50/80 via-white to-white px-8 py-10 sm:px-10">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
            <Image
              src={BRAND_PATHS.icon}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-2xl object-contain"
            />
            <div className="mt-6 sm:mt-0 sm:ml-6">
              <h2 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">{APP_NAME}</h2>
              <p className="mt-2 text-sm font-medium tracking-[0.12em] text-teal-700">{BRAND_TAGLINE}</p>
              <p className="mt-1 text-sm text-slate-500">{BRAND_SUBTAGLINE}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 px-8 py-8 sm:px-10">
          <h3 className="text-lg font-semibold text-[#0F172A]">Mission</h3>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            {APP_NAME} exists to give Malta PE teachers a professional, calm workspace for
            curriculum-aligned planning. Every tool is designed to respect official curriculum
            wording, reduce administrative burden, and help teachers focus on what matters —
            quality physical education for every student.
          </p>
        </div>
      </Card>

      <section>
        <h2 className="mb-4 text-[22px] font-semibold tracking-tight text-[#0F172A]">Key features</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardHeader title={feature.title} />
              <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="flex flex-col items-center px-8 py-10 text-center">
        <BrandLogoFull priority className="mx-auto max-h-32 w-auto opacity-95" />
        <div className="mt-8 w-full max-w-md border-t border-slate-100 pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Version information
          </p>
          <p className="mt-2 text-sm font-medium text-[#0F172A]">PE Curriculum Studio v0.2.0</p>
          <p className="mt-4 text-sm font-semibold text-[#0F172A]">Created by Neil Cassar</p>
          <p className="mt-1 text-sm text-slate-500">PE Teacher & UEFA Licensed Football Coach</p>
          <p className="mt-6 text-xs text-slate-400">{BRAND_FOOTER}</p>
        </div>
        <Link
          href="/settings"
          className="mt-8 text-sm font-medium text-teal-700 hover:text-teal-800"
        >
          ← Back to Settings
        </Link>
      </Card>
    </div>
  );
}
