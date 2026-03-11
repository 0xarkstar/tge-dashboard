"use client"

import { useLiveTokens } from "@/lib/hooks/use-live-data"
import { AnalyticsTabs } from "@/components/analytics/analytics-tabs"
import { FdvTierAnalysis } from "@/components/analytics/fdv-tier-analysis"
import { CategoryAnalysis } from "@/components/analytics/category-analysis"
import { VcRoiChart } from "@/components/analytics/vc-roi-chart"
import { HalfComparison } from "@/components/analytics/half-comparison"
import { TimelineChart } from "@/components/analytics/timeline-chart"

export default function AnalyticsPage() {
  const { tokens, isLoading, error } = useLiveTokens()

  if (isLoading && tokens.length === 0) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Analytics</h1>
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Loading data...</div>
          </div>
        </div>
      </main>
    )
  }

  if (error && tokens.length === 0) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Analytics</h1>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            Failed to load data. Please try again later.
          </div>
        </div>
      </main>
    )
  }

  const tabs = [
    {
      id: "fdv-tiers",
      label: "FDV Tiers",
      content: <FdvTierAnalysis tokens={tokens} />,
    },
    {
      id: "categories",
      label: "Categories",
      content: <CategoryAnalysis tokens={tokens} />,
    },
    {
      id: "vc-roi",
      label: "VC ROI",
      content: <VcRoiChart tokens={tokens} />,
    },
    {
      id: "h1-vs-h2",
      label: "H1 vs H2",
      content: <HalfComparison tokens={tokens} />,
    },
    {
      id: "timeline",
      label: "Timeline",
      content: <TimelineChart tokens={tokens} />,
    },
  ]

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Deep dive into 2025 TGE performance data
          </p>
        </div>
        <AnalyticsTabs tabs={tabs} />
      </div>
    </main>
  )
}
