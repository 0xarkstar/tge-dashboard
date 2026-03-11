"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import type { TGEToken } from "@/lib/types"
import { computeMedian, getAnalyticsTokens } from "@/lib/data/compute-stats"
import { CHART_THEME, CHART_TOOLTIP_STYLE } from "@/lib/constants"

interface HalfComparisonProps {
  readonly tokens: readonly TGEToken[]
}

function computeStdDev(values: readonly number[]): number | null {
  if (values.length < 2) return null
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

function computeHalfStats(tokens: readonly TGEToken[], half: "H1" | "H2") {
  const filtered = getAnalyticsTokens(tokens).filter(
    (t) => t.half === half
  )
  const changes = filtered
    .map((t) => t.fdv_change_pct)
    .filter((v): v is number => v != null)
  const greenCount = filtered.filter(
    (t) => t.performance_status === "green"
  ).length
  const avgChange =
    changes.length > 0
      ? changes.reduce((sum, v) => sum + v, 0) / changes.length
      : 0

  return {
    half,
    count: filtered.length,
    median_change: computeMedian(changes) ?? 0,
    avg_change: Math.round(avgChange * 100) / 100,
    std_dev: computeStdDev(changes),
    green_count: greenCount,
    red_count: filtered.length - greenCount,
    pct_green:
      filtered.length > 0
        ? Math.round((greenCount / filtered.length) * 10000) / 100
        : 0,
  }
}

export function HalfComparison({ tokens }: HalfComparisonProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const h1Stats = useMemo(() => computeHalfStats(tokens, "H1"), [tokens])
  const h2Stats = useMemo(() => computeHalfStats(tokens, "H2"), [tokens])

  const comparisonData = useMemo(
    () => [
      {
        metric: "Median Change",
        H1: h1Stats.median_change,
        H2: h2Stats.median_change,
      },
      {
        metric: "Avg Change",
        H1: h1Stats.avg_change,
        H2: h2Stats.avg_change,
      },
      {
        metric: "% Green",
        H1: h1Stats.pct_green,
        H2: h2Stats.pct_green,
      },
    ],
    [h1Stats, h2Stats]
  )

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">H1 vs H2 Performance Comparison</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[h1Stats, h2Stats].map((stats) => (
          <div
            key={stats.half}
            className="rounded-lg border border-border bg-card p-5"
          >
            <h4 className="text-base font-semibold mb-3">{stats.half}</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Tokens</div>
                <div className="text-lg font-semibold">{stats.count}</div>
              </div>
              <div>
                <div className="text-muted-foreground">% Green</div>
                <div className="text-lg font-semibold">
                  {stats.pct_green.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Median Change</div>
                <div
                  className={`text-lg font-semibold ${stats.median_change >= 0 ? "text-green" : "text-red"}`}
                >
                  {stats.median_change >= 0 ? "\u25B2" : "\u25BC"}{" "}
                  {Math.abs(stats.median_change).toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Avg Change</div>
                <div
                  className={`text-lg font-semibold ${stats.avg_change >= 0 ? "text-green" : "text-red"}`}
                >
                  {stats.avg_change >= 0 ? "\u25B2" : "\u25BC"}{" "}
                  {Math.abs(stats.avg_change).toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Std Dev</div>
                <div className="text-lg font-semibold text-muted-foreground">
                  {stats.std_dev != null ? `${stats.std_dev.toFixed(2)}%` : "\u2014"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Green / Red</div>
                <div className="text-lg font-semibold">
                  <span className="text-green">{stats.green_count}</span>
                  {" / "}
                  <span className="text-red">{stats.red_count}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-80 w-full">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis
                dataKey="metric"
                stroke={CHART_THEME.axis}
                fontSize={12}
              />
              <YAxis
                stroke={CHART_THEME.axis}
                fontSize={12}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={((value) => [`${(value as number).toFixed(2)}%`] as [string])}
              />
              <Legend wrapperStyle={{ color: CHART_THEME.axis }} />
              <Bar dataKey="H1" fill={CHART_THEME.h1} />
              <Bar dataKey="H2" fill={CHART_THEME.h2} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground italic">
        * Statistical significance not assessed. Small sample sizes may limit comparability.
      </p>
    </div>
  )
}
