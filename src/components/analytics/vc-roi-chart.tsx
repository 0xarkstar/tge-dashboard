"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts"
import type { TGEToken } from "@/lib/types"
import { getAnalyticsTokens } from "@/lib/data/compute-stats"
import { formatNumber, formatPercent } from "@/lib/utils"
import { useChartTheme, chartTooltipStyle } from "@/lib/hooks/use-chart-theme"
import { ChartContainer } from "@/components/shared/chart-container"

interface VcRoiChartProps {
  readonly tokens: readonly TGEToken[]
}

function formatMillions(value: number): string {
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}B`
  if (value >= 1) return `$${value.toFixed(0)}M`
  return `$${(value * 1000).toFixed(0)}K`
}

export function VcRoiChart({ tokens }: VcRoiChartProps) {
  const ct = useChartTheme()
  const vcTokens = useMemo(() => {
    return getAnalyticsTokens(tokens)
      .filter((t) => t.vc_total_raised != null && t.vc_total_raised > 0 && t.fdv_change_pct != null)
      .map((t) => ({
        ticker: t.ticker,
        name: t.name,
        vc_raised: (t.vc_total_raised ?? 0) / 1_000_000,
        fdv_change: t.fdv_change_pct ?? 0,
        category: t.category,
        starting_fdv: t.starting_fdv,
      }))
  }, [tokens])

  const correlation = useMemo(() => {
    if (vcTokens.length < 3) return null
    const n = vcTokens.length
    const logX = vcTokens.map((t) => Math.log10(t.vc_raised))
    const sumX = logX.reduce((s, v) => s + v, 0)
    const sumY = vcTokens.reduce((s, t) => s + t.fdv_change, 0)
    const sumXY = vcTokens.reduce((s, t, i) => s + logX[i] * t.fdv_change, 0)
    const sumX2 = logX.reduce((s, v) => s + v * v, 0)
    const sumY2 = vcTokens.reduce((s, t) => s + t.fdv_change * t.fdv_change, 0)
    const num = n * sumXY - sumX * sumY
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    if (den === 0) return null
    return Number((num / den).toFixed(2))
  }, [vcTokens])

  const xDomain = useMemo(() => {
    if (vcTokens.length === 0) return [1, 1000]
    const values = vcTokens.map((t) => t.vc_raised)
    const min = Math.min(...values)
    const max = Math.max(...values)
    // Pad domain for log scale: round down/up to nearest power of 10
    const logMin = Math.floor(Math.log10(min))
    const logMax = Math.ceil(Math.log10(max))
    return [Math.pow(10, logMin), Math.pow(10, logMax)]
  }, [vcTokens])

  const xTicks = useMemo(() => {
    const [min, max] = xDomain
    const ticks: number[] = []
    let v = min
    while (v <= max) {
      ticks.push(v)
      v *= 10
    }
    return ticks
  }, [xDomain])

  if (vcTokens.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        No tokens with VC data available.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">VC Raised vs FDV Performance</h3>
        {correlation != null && (
          <p className="text-xs text-muted-foreground">
            Pearson r (log VC) = {correlation} ({Math.abs(correlation) < 0.3 ? "weak" : Math.abs(correlation) < 0.7 ? "moderate" : "strong"} {correlation >= 0 ? "positive" : "negative"} correlation)
          </p>
        )}
        <p className="text-sm text-muted-foreground mb-4">
          {vcTokens.length} of {tokens.filter(t => t.status === "launched").length} launched tokens have VC funding data
        </p>
        <ChartContainer height="h-96">
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
            <XAxis
              dataKey="vc_raised"
              name="VC Raised"
              type="number"
              stroke={ct.axis}
              fontSize={12}
              scale="log"
              domain={xDomain}
              ticks={xTicks}
              tickFormatter={(v: number) => {
                if (v >= 1000) return `$${(v / 1000).toFixed(0)}B`
                if (v >= 1) return `$${v.toFixed(0)}M`
                return `$${(v * 1000).toFixed(0)}K`
              }}
              label={{
                value: "VC Raised (log scale)",
                position: "insideBottom",
                offset: -10,
                style: { fill: ct.axis, fontSize: 12 },
              }}
            />
            <YAxis
              dataKey="fdv_change"
              name="FDV Change"
              stroke={ct.axis}
              fontSize={12}
              tickFormatter={(v: number) => `${v}%`}
              label={{
                value: "FDV Change %",
                angle: -90,
                position: "insideLeft",
                style: { fill: ct.axis, fontSize: 12 },
              }}
            />
            <Tooltip
              contentStyle={chartTooltipStyle(ct)}
              formatter={((value, name) => {
                if (name === "VC Raised") return [formatMillions(value as number), name] as [string, string]
                return [`${(value as number).toFixed(2)}%`, "FDV Change"] as [string, string]
              })}
              labelFormatter={((_label, payload) => {
                const items = payload as unknown as Array<{ payload?: { ticker?: string } }>
                const item = items?.[0]?.payload
                return item?.ticker ?? ""
              })}
            />
            <ReferenceLine y={0} stroke={ct.reference} strokeDasharray="3 3" />
            <Scatter
              data={vcTokens}
              fill={ct.scatter}
              fillOpacity={0.7}
            />
          </ScatterChart>
        </ChartContainer>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Ticker</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">VC Raised</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Starting FDV</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">FDV/VC</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">FDV Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...vcTokens]
              .sort((a, b) => b.vc_raised - a.vc_raised)
              .map((t) => {
                const fdvVcMultiple = t.starting_fdv != null && t.vc_raised > 0
                  ? t.starting_fdv / (t.vc_raised * 1_000_000)
                  : null
                return (
                  <tr key={t.ticker} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{t.ticker}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.name}</td>
                    <td className="px-4 py-3">{t.category}</td>
                    <td className="px-4 py-3 text-right">{formatMillions(t.vc_raised)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(t.starting_fdv)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {fdvVcMultiple != null ? (
                        <>
                          {fdvVcMultiple.toFixed(1)}x
                          {fdvVcMultiple < 1.0 && <span className="ml-1 text-xs text-chart-4" title="VC raised exceeded TGE FDV">{"\u26A0"}</span>}
                        </>
                      ) : "\u2014"}
                    </td>
                    <td className={`px-4 py-3 text-right ${t.fdv_change >= 0 ? "text-green" : "text-red"}`}>
                      {t.fdv_change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(t.fdv_change).toFixed(2)}%
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
      <div className="mt-2 space-y-1">
        <p className="text-xs text-muted-foreground">
          {"\u26A0"} FDV/VC &lt; 1.0x indicates VC raised exceeded TGE FDV — verify data accuracy.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Note: FDV/VC multiple reflects TGE FDV relative to total VC raised. This is NOT investor ROI — VCs typically invest at earlier valuations with significant discounts.
        </p>
      </div>
      <NoVcDataTokens tokens={tokens} />
    </div>
  )
}

function NoVcDataTokens({ tokens }: { readonly tokens: readonly TGEToken[] }) {
  const [showAll, setShowAll] = useState(false)
  const noVcTokens = useMemo(() => {
    return getAnalyticsTokens(tokens)
      .filter((t) => t.vc_total_raised == null || t.vc_total_raised === 0)
      .sort((a, b) => (b.fdv_change_pct ?? 0) - (a.fdv_change_pct ?? 0))
  }, [tokens])

  if (noVcTokens.length === 0) return null

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowAll((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{showAll ? "\u25B2" : "\u25BC"}</span>
        <span>{noVcTokens.length} tokens without VC data</span>
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
              {noVcTokens.map((t) => (
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
