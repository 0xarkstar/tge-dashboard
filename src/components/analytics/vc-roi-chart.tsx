"use client"

import { useMemo } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts"
import type { TGEToken } from "@/lib/types"

interface VcRoiChartProps {
  readonly tokens: readonly TGEToken[]
}

function formatMillions(value: number): string {
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}B`
  return `$${value.toFixed(0)}M`
}

export function VcRoiChart({ tokens }: VcRoiChartProps) {
  const vcTokens = useMemo(() => {
    return tokens
      .filter(
        (t) =>
          t.vc_total_raised != null &&
          t.vc_total_raised > 0 &&
          t.fdv_change_pct != null &&
          t.status === "launched"
      )
      .map((t) => ({
        ticker: t.ticker,
        name: t.name,
        vc_raised: (t.vc_total_raised ?? 0) / 1_000_000,
        fdv_change: t.fdv_change_pct ?? 0,
        category: t.category,
      }))
  }, [tokens])

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
        <p className="text-sm text-muted-foreground mb-4">
          {vcTokens.length} tokens with VC funding data
        </p>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
              <XAxis
                dataKey="vc_raised"
                name="VC Raised"
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickFormatter={(v: number) => formatMillions(v)}
                label={{
                  value: "VC Raised ($M)",
                  position: "insideBottom",
                  offset: -10,
                  style: { fill: "oklch(0.65 0 0)", fontSize: 12 },
                }}
              />
              <YAxis
                dataKey="fdv_change"
                name="FDV Change"
                stroke="oklch(0.65 0 0)"
                fontSize={12}
                tickFormatter={(v: number) => `${v}%`}
                label={{
                  value: "FDV Change %",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "oklch(0.65 0 0)", fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.178 0 0)",
                  border: "1px solid oklch(0.3 0 0)",
                  borderRadius: "8px",
                  color: "oklch(0.985 0 0)",
                }}
                formatter={((value: number, name: string) => {
                  if (name === "VC Raised") return [`$${value.toFixed(1)}M`, name]
                  return [`${value.toFixed(2)}%`, "FDV Change"]
                }) as never}
                labelFormatter={((_label: string, payload: Array<{ payload?: { ticker?: string } }>) => {
                  const item = payload?.[0]?.payload
                  return item?.ticker ?? ""
                }) as never}
              />
              <ReferenceLine y={0} stroke="oklch(0.5 0 0)" strokeDasharray="3 3" />
              <Scatter
                data={vcTokens}
                fill="oklch(0.7 0.15 250)"
                fillOpacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Ticker</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">VC Raised</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">FDV Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...vcTokens]
              .sort((a, b) => b.vc_raised - a.vc_raised)
              .map((t) => (
                <tr key={t.ticker} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{t.ticker}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.name}</td>
                  <td className="px-4 py-3">{t.category}</td>
                  <td className="px-4 py-3 text-right">${t.vc_raised.toFixed(0)}M</td>
                  <td className={`px-4 py-3 text-right ${t.fdv_change >= 0 ? "text-green" : "text-red"}`}>
                    {t.fdv_change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(t.fdv_change).toFixed(2)}%
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
