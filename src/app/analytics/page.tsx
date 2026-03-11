"use client"

import { useLiveTokens } from "@/lib/hooks/use-live-data"
import { AnalyticsTabs } from "@/components/analytics/analytics-tabs"
import { FdvTierAnalysis } from "@/components/analytics/fdv-tier-analysis"
import { CategoryAnalysis } from "@/components/analytics/category-analysis"
import { VcRoiChart } from "@/components/analytics/vc-roi-chart"
import { HalfComparison } from "@/components/analytics/half-comparison"
import { TimelineChart } from "@/components/analytics/timeline-chart"
import { useI18n } from "@/lib/i18n"

export default function AnalyticsPage() {
  const { tokens, isLoading, error } = useLiveTokens()
  const { t } = useI18n()

  if (isLoading && tokens.length === 0) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">{t("analytics.title")}</h1>
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">{t("analytics.loading")}</div>
          </div>
        </div>
      </main>
    )
  }

  if (error && tokens.length === 0) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">{t("analytics.title")}</h1>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {t("analytics.error")}
          </div>
        </div>
      </main>
    )
  }

  const tabs = [
    { id: "fdv-tiers", label: t("analytics.tabs.fdvTiers"), content: <FdvTierAnalysis tokens={tokens} /> },
    { id: "categories", label: t("analytics.tabs.categories"), content: <CategoryAnalysis tokens={tokens} /> },
    { id: "vc-roi", label: t("analytics.tabs.vcRoi"), content: <VcRoiChart tokens={tokens} /> },
    { id: "h1-vs-h2", label: t("analytics.tabs.h1h2"), content: <HalfComparison tokens={tokens} /> },
    { id: "timeline", label: t("analytics.tabs.timeline"), content: <TimelineChart tokens={tokens} /> },
  ]

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
          <p className="mt-1 text-muted-foreground">
            {t("analytics.subtitle")}
          </p>
        </div>
        <AnalyticsTabs tabs={tabs} />
      </div>
    </main>
  )
}
