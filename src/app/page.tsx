"use client"

import { useLiveTokens } from "@/lib/hooks/use-live-data"
import { getTopPerformers, getBottomPerformers } from "@/lib/data/compute-stats"
import { HeroStats } from "@/components/dashboard/hero-stats"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { FdvTierChart } from "@/components/dashboard/fdv-tier-chart"
import { PerformersTable } from "@/components/dashboard/performers-table"
import { TokenTicker } from "@/components/dashboard/token-ticker"
import { ErrorBanner } from "@/components/shared/error-banner"
import { useI18n } from "@/lib/i18n"

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[120px] rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-[450px] rounded-xl border border-border bg-card" />
        <div className="h-[400px] rounded-xl border border-border bg-card" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-[300px] rounded-xl border border-border bg-card" />
        <div className="h-[300px] rounded-xl border border-border bg-card" />
      </div>
    </div>
  )
}

export default function Home() {
  const { tokens, stats, isLoading, error } = useLiveTokens()
  const { t } = useI18n()

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("dashboard.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("dashboard.subtitle", { total: String(stats.total_tokens) })}
        </p>
      </div>

      {error && <ErrorBanner message={`Failed to load data: ${error.message}`} />}
      {isLoading && <LoadingSkeleton />}

      {!isLoading && (
        <div className="space-y-6">
          <HeroStats stats={stats} />
          <TokenTicker tokens={tokens} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CategoryChart stats={stats} />
            <FdvTierChart stats={stats} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PerformersTable tokens={getTopPerformers(tokens, 5)} title={t("dashboard.topPerformers")} variant="top" />
            <PerformersTable tokens={getBottomPerformers(tokens, 5)} title={t("dashboard.bottomPerformers")} variant="bottom" />
          </div>
        </div>
      )}
    </main>
  )
}
