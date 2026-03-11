import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "2025 TGE Performance Dashboard",
  description:
    "Track 118 VC-backed token generation events and their market performance in 2025. Real-time FDV tracking, VC ROI analysis, and category breakdowns.",
  openGraph: {
    title: "2025 TGE Performance Dashboard",
    description:
      "Track 118 VC-backed TGEs and their market performance in 2025.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "2025 TGE Performance Dashboard",
    description:
      "Track 118 VC-backed TGEs and their market performance in 2025.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased flex min-h-screen flex-col`}>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
