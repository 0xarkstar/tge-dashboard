"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"
import type { TGEToken, TierStats } from "@/lib/types"
import { computeTierStats } from "@/lib/data/compute-stats"

const TIER_ORDER = ["small", "mid", "large", "mega"] as const

interface FdvTierAnalysisProps {
  readonly tokens: readonly TGEToken[]
}

export function FdvTierAnalysis({ tokens }: FdvTierAnalysisProps) {
  const tierStats = useMemo(() => computeTierStats(tokens), [tokens])

  const chartData = useMemo(() => {
    return TIER_ORDER.map((tier) => {
      const stats: TierStats | undefined = tierStats[tier]
      return {
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        range: stats?.range_label ?? "",
        absChange: Math.abs(stats?.median_change ?? 0),
        median_change: stats?.median_change ?? 0,
        count: stats?.count ?? 0,
        pct_green: stats?.pct_green ?? 0,
        median_starting_fdv: stats?.median_starting_fdv ?? 0,
      }
    })
  }, [tierStats])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Median FDV Change by Tier</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
              <XAxis
                dataKey="tier"
                stroke="oklch(0.65 0 0)"
                fontSize={12}
              />
              <YAxis
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.178 0 0)",
                  border: "1px solid oklch(0.3 0 0)",
                  borderRadius: "8px",
                  color: "oklch(0.985 0 0)",
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
                    fill="oklch(0.6 0.2 27)"
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
