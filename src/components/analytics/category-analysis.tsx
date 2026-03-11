"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"
import type { TGEToken } from "@/lib/types"
import { computeCategoryStats } from "@/lib/data/compute-stats"

interface CategoryAnalysisProps {
  readonly tokens: readonly TGEToken[]
}

export function CategoryAnalysis({ tokens }: CategoryAnalysisProps) {
  const categoryStats = useMemo(() => computeCategoryStats(tokens), [tokens])

  const chartData = useMemo(() => {
    return Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        absChange: Math.abs(stats.median_change),
        median_change: stats.median_change,
        avg_change: stats.avg_change,
        count: stats.count,
        pct_green: stats.pct_green,
        total_vc_raised: stats.total_vc_raised,
      }))
      .sort((a, b) => b.median_change - a.median_change)
  }, [categoryStats])

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
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
              <XAxis
                dataKey="category"
                stroke="oklch(0.65 0 0)"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={60}
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
                    key={entry.category}
                    fill={entry.median_change >= 0 ? "oklch(0.7 0.18 145)" : "oklch(0.6 0.2 27)"}
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
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">VC Raised</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {chartData.map((row) => (
              <tr key={row.category} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 font-medium">{row.category}</td>
                <td className="px-4 py-3 text-right">{row.count}</td>
                <td className={`px-4 py-3 text-right ${row.median_change >= 0 ? "text-green" : "text-red"}`}>
                  {row.median_change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(row.median_change).toFixed(2)}%
                </td>
                <td className={`px-4 py-3 text-right ${row.avg_change >= 0 ? "text-green" : "text-red"}`}>
                  {row.avg_change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(row.avg_change).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right">{row.pct_green.toFixed(1)}%</td>
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
    </div>
  )
}
