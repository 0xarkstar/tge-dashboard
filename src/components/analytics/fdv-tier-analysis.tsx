"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine } from "recharts"
import type { TGEToken, TierStats } from "@/lib/types"
import { computeTierStats, getAnalyticsTokens, computeMedian } from "@/lib/data/compute-stats"
import { formatNumber, formatPercent } from "@/lib/utils"
import { CHART_THEME, FDV_TIER_LABELS, CHART_TOOLTIP_STYLE } from "@/lib/constants"
import type { FdvTier } from "@/lib/types"
import { ChartContainer } from "@/components/shared/chart-container"

const TIER_ORDER = ["small", "mid", "large", "mega"] as const

interface FdvTierAnalysisProps {
  readonly tokens: readonly TGEToken[]
}

export function FdvTierAnalysis({ tokens }: FdvTierAnalysisProps) {
  const tierStats = useMemo(() => computeTierStats(tokens), [tokens])

  const chartData = useMemo(() => {
    const analyticsTokens = getAnalyticsTokens(tokens)
    return TIER_ORDER.map((tier) => {
      const stats: TierStats | undefined = tierStats[tier]
      const tierTokens = analyticsTokens.filter((t) => t.fdv_tier === tier)
      const volumes = tierTokens.map((t) => t.volume_24h).filter((v): v is number => v != null)
      const circRatios = tierTokens.map((t) => t.initial_circ_ratio).filter((v): v is number => v != null)
      return {
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        range: stats?.range_label ?? "",
        median_change: stats?.median_change ?? 0,
        count: stats?.count ?? 0,
        pct_green: stats?.pct_green ?? 0,
        median_starting_fdv: stats?.median_starting_fdv ?? 0,
        median_volume: computeMedian(volumes) ?? 0,
        median_circ_ratio: computeMedian(circRatios) ?? 0,
      }
    })
  }, [tierStats, tokens])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Median FDV Change by Tier</h3>
        <ChartContainer height="h-80">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
            <XAxis
              dataKey="tier"
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
              formatter={((_value, _name, props) => {
                const v = (props as { payload: { median_change: number } }).payload.median_change
                return [`${v.toFixed(2)}%`, "Median Change"] as [string, string]
              })}
            />
            <ReferenceLine y={0} stroke={CHART_THEME.reference} strokeDasharray="3 3" />
            <Bar dataKey="median_change">
              {chartData.map((entry) => (
                <Cell
                  key={entry.tier}
                  fill={entry.median_change >= 0 ? CHART_THEME.green : CHART_THEME.red}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Tier</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Range</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Count</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Median FDV</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Median Change</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">% Green</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Median Volume</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Median Circ Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {chartData.map((row) => (
              <tr key={row.tier} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 font-medium">{row.tier}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.range}</td>
                <td className="px-4 py-3 text-right">{row.count}</td>
                <td className="px-4 py-3 text-right">
                  {row.median_starting_fdv >= 1_000_000_000
                    ? `$${(row.median_starting_fdv / 1_000_000_000).toFixed(2)}B`
                    : `$${(row.median_starting_fdv / 1_000_000).toFixed(0)}M`}
                </td>
                <td className={`px-4 py-3 text-right ${row.median_change >= 0 ? "text-green" : "text-red"}`}>
                  {row.median_change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(row.median_change).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right">{row.pct_green.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {row.median_volume > 0
                    ? row.median_volume >= 1_000_000
                      ? `$${(row.median_volume / 1_000_000).toFixed(1)}M`
                      : `$${(row.median_volume / 1_000).toFixed(0)}K`
                    : "\u2014"}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {row.median_circ_ratio > 0 ? `${(row.median_circ_ratio * 100).toFixed(1)}%` : "\u2014"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">* Excludes outlier tokens (WLFI, ASTER, ESPORTS). Illiquid tokens included but may have unreliable price data.</p>

      <TierTokenBreakdown tokens={tokens} />
    </div>
  )
}

function TierTokenBreakdown({ tokens }: { readonly tokens: readonly TGEToken[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const analyticsTokens = useMemo(() => getAnalyticsTokens(tokens), [tokens])

  const tokensByTier = useMemo(() => {
    const map = new Map<string, readonly TGEToken[]>()
    for (const tier of TIER_ORDER) {
      const tierTokens = [...analyticsTokens]
        .filter((t) => t.fdv_tier === tier)
        .sort((a, b) => (b.fdv_change_pct ?? 0) - (a.fdv_change_pct ?? 0))
      map.set(tier, tierTokens)
    }
    return map
  }, [analyticsTokens])

  const tierColors: Record<string, string> = {
    small: CHART_THEME.scatter,
    mid: CHART_THEME.axis,
    large: CHART_THEME.h2,
    mega: CHART_THEME.red,
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Token Breakdown by FDV Tier</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {analyticsTokens.length} tokens across {TIER_ORDER.length} tiers. Click to expand.
      </p>
      <div className="space-y-2">
        {TIER_ORDER.map((tier) => {
          const tierTokens = tokensByTier.get(tier) ?? []
          const isOpen = expanded === tier
          const label = FDV_TIER_LABELS[tier as FdvTier]
          return (
            <div key={tier} className="rounded-lg border border-border">
              <button
                onClick={() => setExpanded(isOpen ? null : tier)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: tierColors[tier] }}
                  />
                  <span className="font-medium capitalize">{tier}</span>
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm text-muted-foreground">({tierTokens.length})</span>
                </div>
                <span className="text-muted-foreground text-sm">{isOpen ? "\u25B2" : "\u25BC"}</span>
              </button>
              {isOpen && (
                <div className="border-t border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-card">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Ticker</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Category</th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">Starting FDV</th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">Current FDV</th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">FDV Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {tierTokens.map((t) => (
                        <tr key={t.ticker} className="hover:bg-secondary/50 transition-colors">
                          <td className="px-4 py-2 font-medium">
                            <Link href={`/tokens/${t.ticker}`} className="hover:text-primary transition-colors hover:underline">
                              {t.ticker}
                            </Link>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">{t.name}</td>
                          <td className="px-4 py-2">{t.category}</td>
                          <td className="px-4 py-2 text-right">{formatNumber(t.starting_fdv)}</td>
                          <td className="px-4 py-2 text-right">{formatNumber(t.current_fdv)}</td>
                          <td className={`px-4 py-2 text-right ${(t.fdv_change_pct ?? 0) >= 0 ? "text-green" : "text-red"}`}>
                            {formatPercent(t.fdv_change_pct)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
