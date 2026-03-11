"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine } from "recharts"
import type { TGEToken, TierStats } from "@/lib/types"
import { computeTierStats, getAnalyticsTokens, computeMedian } from "@/lib/data/compute-stats"
import { formatNumber, formatPercent } from "@/lib/utils"
import { FDV_TIER_LABELS } from "@/lib/constants"
import { useChartTheme, chartTooltipStyle } from "@/lib/hooks/use-chart-theme"
import type { FdvTier } from "@/lib/types"
import { ChartContainer } from "@/components/shared/chart-container"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

const TIER_ORDER = ["small", "mid", "large", "mega"] as const

interface FdvTierAnalysisProps {
  readonly tokens: readonly TGEToken[]
}

export function FdvTierAnalysis({ tokens }: FdvTierAnalysisProps) {
  const ct = useChartTheme()
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
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
            <XAxis
              dataKey="tier"
              stroke={ct.axis}
              fontSize={12}
            />
            <YAxis
              stroke={ct.axis}
              fontSize={12}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={chartTooltipStyle(ct)}
              formatter={((_value, _name, props) => {
                const v = (props as { payload: { median_change: number } }).payload.median_change
                return [`${v.toFixed(2)}%`, "Median Change"] as [string, string]
              })}
            />
            <ReferenceLine y={0} stroke={ct.reference} strokeDasharray="3 3" />
            <Bar dataKey="median_change">
              {chartData.map((entry) => (
                <Cell
                  key={entry.tier}
                  fill={entry.median_change >= 0 ? ct.green : ct.red}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium uppercase tracking-wider">Tier</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider">Range</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Count</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Median FDV</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Median Change</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">% Green</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Median Volume</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Median Circ Ratio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartData.map((row) => (
              <TableRow key={row.tier}>
                <TableCell className="font-medium">{row.tier}</TableCell>
                <TableCell className="text-muted-foreground">{row.range}</TableCell>
                <TableCell className="text-right">{row.count}</TableCell>
                <TableCell className="text-right">
                  {row.median_starting_fdv >= 1_000_000_000
                    ? `$${(row.median_starting_fdv / 1_000_000_000).toFixed(2)}B`
                    : `$${(row.median_starting_fdv / 1_000_000).toFixed(0)}M`}
                </TableCell>
                <TableCell className={`text-right ${row.median_change >= 0 ? "text-green" : "text-red"}`}>
                  {row.median_change >= 0 ? "\u25B2 +" : "\u25BC -"}{Math.abs(row.median_change).toFixed(2)}%
                </TableCell>
                <TableCell className="text-right">{row.pct_green.toFixed(1)}%</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.median_volume > 0
                    ? row.median_volume >= 1_000_000
                      ? `$${(row.median_volume / 1_000_000).toFixed(1)}M`
                      : `$${(row.median_volume / 1_000).toFixed(0)}K`
                    : "\u2014"}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.median_circ_ratio > 0 ? `${(row.median_circ_ratio * 100).toFixed(1)}%` : "\u2014"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">* Excludes outlier tokens (WLFI, ASTER, ESPORTS). Illiquid tokens included but may have unreliable price data.</p>

      <TierTokenBreakdown tokens={tokens} />
    </div>
  )
}

function TierTokenBreakdown({ tokens }: { readonly tokens: readonly TGEToken[] }) {
  const ct = useChartTheme()
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
    small: ct.scatter,
    mid: ct.axis,
    large: ct.h2,
    mega: ct.red,
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium uppercase">Ticker</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Name</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Category</TableHead>
                        <TableHead className="text-right text-xs font-medium uppercase">Starting FDV</TableHead>
                        <TableHead className="text-right text-xs font-medium uppercase">Current FDV</TableHead>
                        <TableHead className="text-right text-xs font-medium uppercase">FDV Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tierTokens.map((t) => (
                        <TableRow key={t.ticker}>
                          <TableCell className="font-medium">
                            <Link href={`/tokens/${t.ticker}`} className="hover:text-primary transition-colors hover:underline">
                              {t.ticker}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{t.name}</TableCell>
                          <TableCell>{t.category}</TableCell>
                          <TableCell className="text-right">{formatNumber(t.starting_fdv)}</TableCell>
                          <TableCell className="text-right">{formatNumber(t.current_fdv)}</TableCell>
                          <TableCell className={`text-right ${(t.fdv_change_pct ?? 0) >= 0 ? "text-green" : "text-red"}`}>
                            {formatPercent(t.fdv_change_pct)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
