import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/components/providers/AppProvider";
import { BRAND_PATHS } from "@/lib/brand/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F8FAFC] font-sans text-slate-800">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
