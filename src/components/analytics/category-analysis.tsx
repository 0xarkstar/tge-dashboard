"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts"
import type { TGEToken, Category } from "@/lib/types"
import { computeCategoryStats, getAnalyticsTokens, computeMedian } from "@/lib/data/compute-stats"
import { formatNumber, formatPercent } from "@/lib/utils"
import { CHART_THEME, CATEGORY_COLORS, CATEGORIES, CHART_TOOLTIP_STYLE } from "@/lib/constants"

interface CategoryAnalysisProps {
  readonly tokens: readonly TGEToken[]
}

export function CategoryAnalysis({ tokens }: CategoryAnalysisProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const categoryStats = useMemo(() => computeCategoryStats(tokens), [tokens])

  const chartData = useMemo(() => {
    const analyticsTokens = getAnalyticsTokens(tokens)
    const computed = Object.entries(categoryStats)
      .map(([category, stats]) => {
        const catTokens = analyticsTokens.filter((t) => t.category === category)
        const volumes = catTokens.map((t) => t.volume_24h).filter((v): v is number => v != null)
        return {
          category,
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
        median_change: 0,
        avg_change: 0,
        count: 0,
        pct_green: 0,
        total_vc_raised: 0,
        median_volume: 0,
      }
    }).filter((d) => d.count > 0).sort((a, b) => b.median_change - a.median_change)
  }, [categoryStats, tokens])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Median FDV Change by Category</h3>
        <div className="h-80 w-full">
          {mounted && (
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
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category as Category] ?? CHART_THEME.axis}
                      fillOpacity={entry.count < 3 ? 0.4 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground italic">
          * Categories with fewer than 3 tokens shown with reduced opacity — statistics may not be meaningful.
        </p>
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
                    : "\u2014"}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {row.total_vc_raised > 0
                    ? row.total_vc_raised >= 1_000_000_000
                      ? `$${(row.total_vc_raised / 1_000_000_000).toFixed(2)}B`
                      : `$${(row.total_vc_raised / 1_000_000).toFixed(0)}M`
                    : "\u2014"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">* Analytics exclude outlier tokens (WLFI). Illiquid tokens included but may have unreliable price data.</p>

      <CategoryTokenBreakdown tokens={tokens} />
    </div>
  )
}

function CategoryTokenBreakdown({ tokens }: { readonly tokens: readonly TGEToken[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const analyticsTokens = useMemo(() => getAnalyticsTokens(tokens), [tokens])

  const tokensByCategory = useMemo(() => {
    const map = new Map<string, readonly TGEToken[]>()
    for (const cat of CATEGORIES) {
      const catTokens = [...analyticsTokens]
        .filter((t) => t.category === cat)
        .sort((a, b) => (b.fdv_change_pct ?? 0) - (a.fdv_change_pct ?? 0))
      map.set(cat, catTokens)
    }
    return map
  }, [analyticsTokens])

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Token Breakdown by Category</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {analyticsTokens.length} tokens across {CATEGORIES.filter(c => (tokensByCategory.get(c)?.length ?? 0) > 0).length} categories. Click to expand.
      </p>
      <div className="space-y-2">
        {CATEGORIES.map((cat) => {
          const catTokens = tokensByCategory.get(cat) ?? []
          if (catTokens.length === 0) return null
          const isOpen = expanded === cat
          return (
            <div key={cat} className="rounded-lg border border-border">
              <button
                onClick={() => setExpanded(isOpen ? null : cat)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                  <span className="font-medium">{cat}</span>
                  <span className="text-sm text-muted-foreground">({catTokens.length})</span>
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
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">Starting FDV</th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">Current FDV</th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">FDV Change</th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">Volume 24h</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {catTokens.map((t) => (
                        <tr key={t.ticker} className="hover:bg-secondary/50 transition-colors">
                          <td className="px-4 py-2 font-medium">
                            <Link href={`/tokens/${t.ticker}`} className="hover:text-primary transition-colors hover:underline">
                              {t.ticker}
                            </Link>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">{t.name}</td>
                          <td className="px-4 py-2 text-right">{formatNumber(t.starting_fdv)}</td>
                          <td className="px-4 py-2 text-right">{formatNumber(t.current_fdv)}</td>
                          <td className={`px-4 py-2 text-right ${(t.fdv_change_pct ?? 0) >= 0 ? "text-green" : "text-red"}`}>
                            {formatPercent(t.fdv_change_pct)}
                          </td>
                          <td className="px-4 py-2 text-right text-muted-foreground">
                            {formatNumber(t.volume_24h)}
                            {t.is_illiquid ? <span className="ml-1 text-xs text-chart-4" title="Low liquidity">{"\u26A0"}</span> : null}
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
