"use client"

import { useLiveTokens } from "@/lib/hooks/use-live-data"
import { getTopPerformers, getBottomPerformers } from "@/lib/data/compute-stats"
import { HeroStats } from "@/components/dashboard/hero-stats"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { FdvTierChart } from "@/components/dashboard/fdv-tier-chart"
import { PerformersTable } from "@/components/dashboard/performers-table"

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[120px] rounded-xl border border-border bg-card"
          />
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          2025 TGE Performance Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tracking {stats.total_tokens} VC-backed token generation
          events and their market performance.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red/30 bg-red/10 p-4 text-red">
          Failed to load data: {error.message}
        </div>
      )}

      {isLoading && <LoadingSkeleton />}

      {!isLoading && (
        <div className="space-y-6">
          <HeroStats stats={stats} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CategoryChart stats={stats} />
            <FdvTierChart stats={stats} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PerformersTable
              tokens={getTopPerformers(tokens, 5)}
              title="Top 5 Performers"
              variant="top"
            />
            <PerformersTable
              tokens={getBottomPerformers(tokens, 5)}
              title="Bottom 5 Performers"
              variant="bottom"
            />
          </div>
        </div>
      )}
    </main>
  )
}
