"use client"

import { useMemo } from "react"
import { useTheme } from "next-themes"

export interface ChartTheme {
  readonly grid: string
  readonly axis: string
  readonly tooltipBg: string
  readonly tooltipBorder: string
  readonly tooltipText: string
  readonly green: string
  readonly red: string
  readonly reference: string
  readonly scatter: string
  readonly h1: string
  readonly h2: string
}

const DARK: ChartTheme = {
  grid: "oklch(0.22 0 0)",
  axis: "oklch(0.55 0 0)",
  tooltipBg: "oklch(0.178 0 0)",
  tooltipBorder: "oklch(0.22 0 0)",
  tooltipText: "oklch(0.93 0 0)",
  green: "oklch(0.7 0.18 145)",
  red: "oklch(0.6 0.2 27)",
  reference: "oklch(0.5 0 0)",
  scatter: "oklch(0.7 0.15 250)",
  h1: "oklch(0.7 0.15 250)",
  h2: "oklch(0.7 0.15 310)",
}

const LIGHT: ChartTheme = {
  grid: "oklch(0.88 0.005 80)",
  axis: "oklch(0.4 0 0)",
  tooltipBg: "oklch(0.96 0.005 80)",
  tooltipBorder: "oklch(0.88 0.005 80)",
  tooltipText: "oklch(0.25 0 0)",
  green: "oklch(0.5 0.14 155)",
  red: "oklch(0.55 0.16 27)",
  reference: "oklch(0.65 0 0)",
  scatter: "oklch(0.5 0.12 250)",
  h1: "oklch(0.5 0.12 250)",
  h2: "oklch(0.55 0.12 310)",
}

export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme()
  return useMemo(() => (resolvedTheme === "light" ? LIGHT : DARK), [resolvedTheme])
}

export function chartTooltipStyle(theme: ChartTheme) {
  return {
    backgroundColor: theme.tooltipBg,
    border: `1px solid ${theme.tooltipBorder}`,
    borderRadius: "8px",
    color: theme.tooltipText,
  } as const
}
