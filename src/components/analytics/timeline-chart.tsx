"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts"
import type { TGEToken } from "@/lib/types"
import { getAnalyticsTokens } from "@/lib/data/compute-stats"
import { formatNumber, formatPercent } from "@/lib/utils"
import { useChartTheme, chartTooltipStyle } from "@/lib/hooks/use-chart-theme"
import { ChartContainer } from "@/components/shared/chart-container"

interface TimelineChartProps {
  readonly tokens: readonly TGEToken[]
}

export function TimelineChart({ tokens }: TimelineChartProps) {
  const ct = useChartTheme()
  const timelineData = useMemo(() => {
    return getAnalyticsTokens(tokens)
      .filter((t) => t.tge_date != null && t.fdv_change_pct != null)
      .map((t) => ({
        ticker: t.ticker,
        name: t.name,
        date: t.tge_date as string,
        timestamp: new Date(t.tge_date as string).getTime(),
        fdv_change: t.fdv_change_pct as number,
        category: t.category,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }, [tokens])

  const positiveData = useMemo(() => timelineData.filter(d => d.fdv_change >= 0), [timelineData])
  const negativeData = useMemo(() => timelineData.filter(d => d.fdv_change < 0), [timelineData])

  if (timelineData.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        No tokens with TGE dates available.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">TGE Timeline</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {timelineData.length} of {tokens.filter(t => t.status === "launched").length} launched tokens have TGE dates
        </p>
        <ChartContainer height="h-96">
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
            <XAxis
              dataKey="timestamp"
              name="TGE Date"
              stroke={ct.axis}
              fontSize={11}
              tickFormatter={(ts: number) => {
                const d = new Date(ts)
                return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }}
              type="number"
              domain={["dataMin", "dataMax"]}
            />
            <YAxis
              dataKey="fdv_change"
              name="FDV Change"
              stroke={ct.axis}
              fontSize={12}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={chartTooltipStyle(ct)}
              formatter={((value, name) => {
                if (name === "TGE Date") {
                  return [new Date(value as number).toLocaleDateString(), name] as [string, string]
                }
                return [`${(value as number).toFixed(2)}%`, "FDV Change"] as [string, string]
              })}
              labelFormatter={((_label, payload) => {
                const items = payload as unknown as Array<{ payload?: { ticker?: string } }>
                const item = items?.[0]?.payload
                return item?.ticker ?? ""
              })}
            />
            <ReferenceLine y={0} stroke={ct.reference} strokeDasharray="3 3" />
            <Scatter data={positiveData} fill={ct.green} fillOpacity={0.7} />
            <Scatter data={negativeData} fill={ct.red} fillOpacity={0.7} />
          </ScatterChart>
        </ChartContainer>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Days Since TGE</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Ticker</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">FDV Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {timelineData.map((t) => (
              <tr key={t.ticker} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-2 text-muted-foreground">{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                <td className="px-4 py-2 text-right text-muted-foreground">
                  {Math.floor((Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24))}
                </td>
                <td className="px-4 py-2 font-medium">{t.ticker}</td>
                <td className="px-4 py-2 text-muted-foreground">{t.name}</td>
                <td className="px-4 py-2">{t.category}</td>
                <td className={`px-4 py-2 text-right ${t.fdv_change >= 0 ? "text-green" : "text-red"}`}>
                  {t.fdv_change >= 0 ? "\u25B2 +" : "\u25BC -"}{Math.abs(t.fdv_change).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <NoDateTokens tokens={tokens} />
    </div>
  )
}

function NoDateTokens({ tokens }: { readonly tokens: readonly TGEToken[] }) {
  const [showAll, setShowAll] = useState(false)
  const noDateTokens = useMemo(() => {
    return getAnalyticsTokens(tokens)
      .filter((t) => t.tge_date == null)
      .sort((a, b) => (b.fdv_change_pct ?? 0) - (a.fdv_change_pct ?? 0))
  }, [tokens])

  if (noDateTokens.length === 0) return null

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowAll((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{showAll ? "\u25B2" : "\u25BC"}</span>
        <span>{noDateTokens.length} tokens without TGE date</span>
      </button>
      {showAll && (
        <div className="mt-3 overflow-x-auto rounded-lg border border-border max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-card border-b border-border sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Ticker</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Category</th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">Starting FDV</th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">FDV Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {noDateTokens.map((t) => (
                <tr key={t.ticker} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-2 font-medium">
                    <Link href={`/tokens/${t.ticker}`} className="hover:text-primary transition-colors hover:underline">
                      {t.ticker}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{t.name}</td>
                  <td className="px-4 py-2">{t.category}</td>
                  <td className="px-4 py-2 text-right">{formatNumber(t.starting_fdv)}</td>
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
}
