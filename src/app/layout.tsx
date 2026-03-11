import type { Metadata } from "next";
import { Inter } from "next/font/google";
import fs from "fs";
import path from "path";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { I18nProvider } from "@/components/shared/i18n-provider";
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

function getLastUpdated(): string {
  try {
    const filePath = path.join(process.cwd(), "data", "tokens.json")
    const tokens = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Array<{ last_updated: string }>
    const latest = tokens.reduce((max, t) => {
      const ts = new Date(t.last_updated).getTime()
      return ts > max ? ts : max
    }, 0)
    return new Date(latest).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
  } catch {
    return "Unknown"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased flex min-h-screen flex-col`}>
        <ThemeProvider>
          <I18nProvider>
            <SiteHeader />
            <main className="flex-1">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <SiteFooter lastUpdated={getLastUpdated()} />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
