"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { DashboardStats } from "@/lib/types"
import { CATEGORY_COLORS, CHART_THEME } from "@/lib/constants"
import type { Category } from "@/lib/types"

interface CategoryChartProps {
  readonly stats: DashboardStats
}

interface ChartDataItem {
  readonly name: string
  readonly absChange: number
  readonly originalChange: number
  readonly count: number
  readonly fill: string
}

function buildChartData(stats: DashboardStats): readonly ChartDataItem[] {
  return Object.entries(stats.by_category)
    .map(([name, cat]) => ({
      name,
      absChange: Math.abs(cat.median_change),
      originalChange: cat.median_change,
      count: cat.count,
      fill: CATEGORY_COLORS[name as Category] ?? "oklch(0.6 0.05 0)",
    }))
    .sort((a, b) => b.originalChange - a.originalChange)
}

export function CategoryChart({ stats }: CategoryChartProps) {
  const data = buildChartData(stats)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold">
        Category Performance (Median FDV Change %)
      </h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis
              type="number"
              tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
              tickFormatter={(v: number) => `${v}%`}
              axisLine={{ stroke: CHART_THEME.grid }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
              axisLine={{ stroke: CHART_THEME.grid }}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_THEME.tooltipBg,
                border: `1px solid ${CHART_THEME.tooltipBorder}`,
                borderRadius: "0.5rem",
                color: CHART_THEME.tooltipText,
              }}
              formatter={((_value: number, _name: string, props: { payload: ChartDataItem }) => {
                const v = props.payload.originalChange
                return [`${v >= 0 ? "+" : ""}${v.toFixed(1)}%`, "Median Change"]
              }) as never}
            />
            <Bar dataKey="absChange">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
