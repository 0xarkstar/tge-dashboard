"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"
import type { TGEToken, TierStats } from "@/lib/types"
import { computeTierStats, getAnalyticsTokens, computeMedian } from "@/lib/data/compute-stats"
import { CHART_THEME } from "@/lib/constants"

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
        absChange: Math.abs(stats?.median_change ?? 0),
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
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
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
                contentStyle={{
                  backgroundColor: CHART_THEME.tooltipBg,
                  border: `1px solid ${CHART_THEME.tooltipBorder}`,
                  borderRadius: "8px",
                  color: CHART_THEME.tooltipText,
                }}
                formatter={((_value: number, _name: string, props: { payload: { median_change: number } }) => {
                  const v = props.payload.median_change
                  return [`${v.toFixed(2)}%`, "Median Change"]
                }) as never}
              />
              <Bar dataKey="absChange">
                {chartData.map((entry) => (
                  <Cell
                    key={entry.tier}
                    fill={entry.median_change >= 0 ? CHART_THEME.green : CHART_THEME.red}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
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
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {row.median_circ_ratio > 0 ? `${(row.median_circ_ratio * 100).toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">* Analytics exclude outlier tokens (WLFI). Illiquid tokens included but may have unreliable price data.</p>
    </div>
  )
}
