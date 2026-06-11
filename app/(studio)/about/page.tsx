import Link from "next/link";
import { BrandLogoFull } from "@/components/brand/BrandLogoFull";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { BRAND_SUBTAGLINE, BRAND_TAGLINE } from "@/lib/brand/constants";
import { APP_NAME } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="About"
        description="Official branding and mission for PE Curriculum Studio."
      />

      <Card className="flex flex-col items-center px-8 py-10 text-center">
        <BrandLogoFull priority className="mx-auto" />
        <h2 className="mt-6 text-2xl font-semibold text-slate-900">{APP_NAME}</h2>
        <p className="mt-3 text-sm font-medium tracking-wide text-teal-700">{BRAND_TAGLINE}</p>
        <p className="mt-2 text-sm text-slate-500">{BRAND_SUBTAGLINE}</p>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-600">
          {APP_NAME} is a calm planning workspace for Malta PE teachers — lesson plans,
          schemes of work, calendar pacing, and curriculum alignment in one place.
        </p>
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
