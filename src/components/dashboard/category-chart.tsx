"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from "recharts"
import type { DashboardStats } from "@/lib/types"
import { CATEGORY_COLORS } from "@/lib/constants"
import { useChartTheme, chartTooltipStyle } from "@/lib/hooks/use-chart-theme"
import type { Category } from "@/lib/types"
import { ChartContainer } from "@/components/shared/chart-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CategoryChartProps {
  readonly stats: DashboardStats
}

interface ChartDataItem {
  readonly name: string
  readonly originalChange: number
  readonly count: number
  readonly fill: string
}

function buildChartData(stats: DashboardStats): readonly ChartDataItem[] {
  return Object.entries(stats.by_category)
    .map(([name, cat]) => ({
      name,
      originalChange: cat.median_change,
      count: cat.count,
      fill: CATEGORY_COLORS[name as Category] ?? "oklch(0.6 0.05 0)",
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.originalChange - a.originalChange)
}

export function CategoryChart({ stats }: CategoryChartProps) {
  const ct = useChartTheme()
  const data = buildChartData(stats)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Category Performance (Median FDV Change %)</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
      <ChartContainer height="h-[400px]">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <XAxis
            type="number"
            tick={{ fill: ct.axis, fontSize: 12 }}
            tickFormatter={(v: number) => `${v}%`}
            axisLine={{ stroke: ct.grid }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: ct.axis, fontSize: 12 }}
            axisLine={{ stroke: ct.grid }}
            width={75}
          />
          <Tooltip
            contentStyle={chartTooltipStyle(ct)}
            formatter={((_value, _name, props) => {
              const v = (props as { payload: ChartDataItem }).payload.originalChange
              return [`${v >= 0 ? "+" : ""}${v.toFixed(1)}%`, "Median Change"] as [string, string]
            })}
          />
          <ReferenceLine x={0} stroke={ct.reference} strokeDasharray="3 3" />
          <Bar dataKey="originalChange">
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      </CardContent>
    </Card>
  )
}
