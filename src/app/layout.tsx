import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BHRAMAN-SARTHI (भ्रमण-सारथी) · Your Indian Travel Companion",
    template: "%s · BHRAMAN-SARTHI",
  },
  description:
    "BHRAMAN-SARTHI (भ्रमण-सारथी) — Your divine travel companion. Deadline-aware journey planner seamlessly connecting flights and trains across Bharatvarsha.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col selection:bg-amber-500/20 selection:text-amber-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-amber-700 focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {/* Sacred Auspicious Top Zari Border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-700 via-amber-400 to-red-800" />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
