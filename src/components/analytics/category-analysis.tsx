"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine } from "recharts"
import type { TGEToken, Category } from "@/lib/types"
import { computeCategoryStats, getAnalyticsTokens, computeMedian } from "@/lib/data/compute-stats"
import { formatNumber, formatPercent } from "@/lib/utils"
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/constants"
import { useChartTheme, chartTooltipStyle } from "@/lib/hooks/use-chart-theme"
import { ChartContainer } from "@/components/shared/chart-container"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

interface CategoryAnalysisProps {
  readonly tokens: readonly TGEToken[]
}

export function CategoryAnalysis({ tokens }: CategoryAnalysisProps) {
  const ct = useChartTheme()
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
        <ChartContainer height="h-80">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
            <XAxis
              dataKey="category"
              stroke={ct.axis}
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={60}
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
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category as Category] ?? ct.axis}
                  fillOpacity={entry.count < 3 ? 0.4 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <p className="mt-2 text-xs text-muted-foreground italic">
          * Categories with fewer than 3 tokens shown with reduced opacity — statistics may not be meaningful.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Count</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Median Change</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Avg Change</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">% Green</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Median Volume</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider">VC Raised</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartData.map((row) => (
              <TableRow key={row.category}>
                <TableCell className="font-medium">{row.category}</TableCell>
                <TableCell className="text-right">
                  {row.count}{row.count <= 2 ? <span className="text-muted-foreground ml-1 text-xs">(insufficient data)</span> : null}
                </TableCell>
                <TableCell className={`text-right ${row.count <= 2 ? "text-muted-foreground" : row.median_change >= 0 ? "text-green" : "text-red"}`}>
                  {row.count <= 2 ? "\u2014" : <>{row.median_change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(row.median_change).toFixed(2)}%</>}
                </TableCell>
                <TableCell className={`text-right ${row.count <= 2 ? "text-muted-foreground" : row.avg_change >= 0 ? "text-green" : "text-red"}`}>
                  {row.count <= 2 ? "\u2014" : <>{row.avg_change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(row.avg_change).toFixed(2)}%</>}
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
                  {row.total_vc_raised > 0
                    ? row.total_vc_raised >= 1_000_000_000
                      ? `$${(row.total_vc_raised / 1_000_000_000).toFixed(2)}B`
                      : `$${(row.total_vc_raised / 1_000_000).toFixed(0)}M`
                    : "\u2014"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">* Excludes outlier tokens (WLFI, ASTER, ESPORTS). 2 illiquid tokens (ALMANAK, MITO) are included but have unreliable price data due to near-zero trading volume.</p>

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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium uppercase">Ticker</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Name</TableHead>
                        <TableHead className="text-right text-xs font-medium uppercase">Starting FDV</TableHead>
                        <TableHead className="text-right text-xs font-medium uppercase">Current FDV</TableHead>
                        <TableHead className="text-right text-xs font-medium uppercase">FDV Change</TableHead>
                        <TableHead className="text-right text-xs font-medium uppercase">Volume 24h</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catTokens.map((t) => (
                        <TableRow key={t.ticker}>
                          <TableCell className="font-medium">
                            <Link href={`/tokens/${t.ticker}`} className="hover:text-primary transition-colors hover:underline">
                              {t.ticker}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{t.name}</TableCell>
                          <TableCell className="text-right">{formatNumber(t.starting_fdv)}</TableCell>
                          <TableCell className="text-right">{formatNumber(t.current_fdv)}</TableCell>
                          <TableCell className={`text-right ${(t.fdv_change_pct ?? 0) >= 0 ? "text-green" : "text-red"}`}>
                            {formatPercent(t.fdv_change_pct)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatNumber(t.volume_24h)}
                            {t.is_illiquid ? <span className="ml-1 text-xs text-chart-4" title="Low liquidity">{"\u26A0"}</span> : null}
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
