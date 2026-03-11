"use client"

import { useEffect, useState } from "react"
import type { TGEToken, DashboardStats } from "@/lib/types"
import { TGETokenSchema, DashboardStatsSchema } from "@/lib/types"
import { HeroStats } from "@/components/dashboard/hero-stats"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { FdvTierChart } from "@/components/dashboard/fdv-tier-chart"
import { PerformersTable } from "@/components/dashboard/performers-table"
import { z } from "zod"

interface DashboardData {
  readonly tokens: readonly TGEToken[]
  readonly stats: DashboardStats
}

function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [tokensRes, statsRes] = await Promise.all([
          fetch("/data/tokens.json"),
          fetch("/data/stats.json"),
        ])

        if (!tokensRes.ok || !statsRes.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const tokensRaw: unknown = await tokensRes.json()
        const statsRaw: unknown = await statsRes.json()

        const tokens = z.array(TGETokenSchema).parse(tokensRaw)
        const stats = DashboardStatsSchema.parse(statsRaw)

        setData({ tokens, stats })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, error, isLoading }
}

function getTopPerformers(tokens: readonly TGEToken[], count: number): readonly TGEToken[] {
  return [...tokens]
    .filter((t) => t.status === "launched" && t.fdv_change_pct != null)
    .sort((a, b) => (b.fdv_change_pct ?? 0) - (a.fdv_change_pct ?? 0))
    .slice(0, count)
}

function getBottomPerformers(tokens: readonly TGEToken[], count: number): readonly TGEToken[] {
  return [...tokens]
    .filter((t) => t.status === "launched" && t.fdv_change_pct != null)
    .sort((a, b) => (a.fdv_change_pct ?? 0) - (b.fdv_change_pct ?? 0))
    .slice(0, count)
}

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
  const { data, error, isLoading } = useDashboardData()

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          2025 TGE Performance Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tracking {data?.stats.total_tokens ?? "..."} VC-backed token generation
          events and their market performance.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red/30 bg-red/10 p-4 text-red">
          Failed to load data: {error}
        </div>
      )}

      {isLoading && <LoadingSkeleton />}

      {data && (
        <div className="space-y-6">
          <HeroStats stats={data.stats} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CategoryChart stats={data.stats} />
            <FdvTierChart stats={data.stats} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PerformersTable
              tokens={getTopPerformers(data.tokens, 5)}
              title="Top 5 Performers"
              variant="top"
            />
            <PerformersTable
              tokens={getBottomPerformers(data.tokens, 5)}
              title="Bottom 5 Performers"
              variant="bottom"
            />
          </div>
        </div>
      )}
    </main>
  )
}
