"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"
import type { TGEToken, Category } from "@/lib/types"
import { computeCategoryStats, getAnalyticsTokens, computeMedian } from "@/lib/data/compute-stats"
import { CHART_THEME, CATEGORY_COLORS, CATEGORIES } from "@/lib/constants"

interface CategoryAnalysisProps {
  readonly tokens: readonly TGEToken[]
}

export function CategoryAnalysis({ tokens }: CategoryAnalysisProps) {
  const categoryStats = useMemo(() => computeCategoryStats(tokens), [tokens])

  const chartData = useMemo(() => {
    const analyticsTokens = getAnalyticsTokens(tokens)
    const computed = Object.entries(categoryStats)
      .map(([category, stats]) => {
        const catTokens = analyticsTokens.filter((t) => t.category === category)
        const volumes = catTokens.map((t) => t.volume_24h).filter((v): v is number => v != null)
        return {
          category,
          absChange: Math.abs(stats.median_change),
          median_change: stats.median_change,
          avg_change: stats.avg_change,
          count: stats.count,
          pct_green: stats.pct_green,
          total_vc_raised: stats.total_vc_raised,
          median_volume: computeMedian(volumes) ?? 0,
        }
      })

    return CATEGORIES.map((cat) => {
      const existing = computed.find((d) => d.category === cat)
      return existing ?? {
        category: cat,
        absChange: 0,
        median_change: 0,
        avg_change: 0,
        count: 0,
        pct_green: 0,
        total_vc_raised: 0,
        median_volume: 0,
      }
    }).sort((a, b) => b.median_change - a.median_change)
  }, [categoryStats, tokens])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Median FDV Change by Category</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis
                dataKey="category"
                stroke={CHART_THEME.axis}
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={60}
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
                    key={entry.category}
                    fill={CATEGORY_COLORS[entry.category as Category] ?? CHART_THEME.axis}
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
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Count</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Median Change</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Change</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">% Green</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Median Volume</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">VC Raised</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {chartData.map((row) => (
              <tr key={row.category} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 font-medium">{row.category}</td>
                <td className="px-4 py-3 text-right">
                  {row.count}{row.count === 1 ? <span className="text-muted-foreground ml-1 text-xs">(n=1)</span> : null}
                </td>
                <td className={`px-4 py-3 text-right ${row.median_change >= 0 ? "text-green" : "text-red"}`}>
                  {row.median_change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(row.median_change).toFixed(2)}%
                </td>
                <td className={`px-4 py-3 text-right ${row.avg_change >= 0 ? "text-green" : "text-red"}`}>
                  {row.avg_change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(row.avg_change).toFixed(2)}%
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
                  {row.total_vc_raised > 0
                    ? row.total_vc_raised >= 1_000_000_000
                      ? `$${(row.total_vc_raised / 1_000_000_000).toFixed(2)}B`
                      : `$${(row.total_vc_raised / 1_000_000).toFixed(0)}M`
                    : "—"}
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
