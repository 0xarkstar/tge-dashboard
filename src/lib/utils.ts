import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

interface FormatNumberOptions {
  readonly compact?: boolean
  readonly decimals?: number
}

export function formatNumber(
  n: number | null | undefined,
  opts: FormatNumberOptions = {},
): string {
  if (n == null) return "N/A"
  const { compact = true, decimals = 1 } = opts

  if (compact) {
    const abs = Math.abs(n)
    if (abs >= 1_000_000_000) {
      return `$${(n / 1_000_000_000).toFixed(decimals)}B`
    }
    if (abs >= 1_000_000) {
      return `$${(n / 1_000_000).toFixed(decimals)}M`
    }
    if (abs >= 1_000) {
      return `$${(n / 1_000).toFixed(decimals)}K`
    }
    return `$${n.toFixed(decimals)}`
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals,
  }).format(n)
}

interface FormatPercentOptions {
  readonly decimals?: number
  readonly showSign?: boolean
}

export function formatPercent(
  n: number | null | undefined,
  opts: FormatPercentOptions = {},
): string {
  if (n == null) return "N/A"
  const { decimals = 1, showSign = true } = opts
  const sign = showSign && n > 0 ? "+" : ""
  return `${sign}${n.toFixed(decimals)}%`
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A"
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatCurrency(n: number | null | undefined): string {
  if (n == null) return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)
}
