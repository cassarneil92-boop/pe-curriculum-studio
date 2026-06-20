import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { BRAND_PATHS } from "@/lib/brand/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PE Curriculum Studio — Malta",
  description:
    "A calm planning workspace for Malta PE teachers. Lesson plans, schemes of work, and curriculum alignment up to Form 5.",
  icons: {
    icon: [{ url: BRAND_PATHS.icon, type: "image/png" }],
    apple: [{ url: BRAND_PATHS.icon, type: "image/png" }],
    shortcut: [BRAND_PATHS.icon],
  },
  applicationName: "PE Curriculum Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F7F9FB] font-sans text-[#0F172A]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
