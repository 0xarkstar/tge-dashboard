"use client"

import { useMemo } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts"
import type { TGEToken } from "@/lib/types"
import { CHART_THEME } from "@/lib/constants"

interface TimelineChartProps {
  readonly tokens: readonly TGEToken[]
}

export function TimelineChart({ tokens }: TimelineChartProps) {
  const timelineData = useMemo(() => {
    return tokens
      .filter(
        (t) =>
          t.tge_date != null &&
          t.fdv_change_pct != null &&
          t.status === "launched"
      )
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
          FDV change vs TGE launch date for {timelineData.length} tokens
        </p>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis
                dataKey="timestamp"
                name="TGE Date"
                stroke={CHART_THEME.axis}
                fontSize={11}
                tickFormatter={(ts: number) => {
                  const d = new Date(ts)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
                type="number"
                domain={["dataMin", "dataMax"]}
              />
              <YAxis
                dataKey="fdv_change"
                name="FDV Change"
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
                formatter={((value: number, name: string) => {
                  if (name === "TGE Date") {
                    return [new Date(value).toLocaleDateString(), name]
                  }
                  return [`${value.toFixed(2)}%`, "FDV Change"]
                }) as never}
                labelFormatter={((_label: string, payload: Array<{ payload?: { ticker?: string } }>) => {
                  const item = payload?.[0]?.payload
                  return item?.ticker ?? ""
                }) as never}
              />
              <ReferenceLine y={0} stroke={CHART_THEME.reference} strokeDasharray="3 3" />
              <Scatter
                data={timelineData}
                fill={CHART_THEME.scatter}
                fillOpacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Ticker</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">FDV Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {timelineData.map((t) => (
              <tr key={t.ticker} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-2 text-muted-foreground">{t.date}</td>
                <td className="px-4 py-2 font-medium">{t.ticker}</td>
                <td className="px-4 py-2 text-muted-foreground">{t.name}</td>
                <td className="px-4 py-2">{t.category}</td>
                <td className={`px-4 py-2 text-right ${t.fdv_change >= 0 ? "text-green" : "text-red"}`}>
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
