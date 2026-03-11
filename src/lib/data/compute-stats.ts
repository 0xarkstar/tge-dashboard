import type { TGEToken, DashboardStats, CategoryStats, TierStats, Category, FdvTier } from "@/lib/types"

export const OUTLIER_TICKERS = ["WLFI"] as const

function excludeOutliers(tokens: readonly TGEToken[]): readonly TGEToken[] {
  return tokens.filter((t) => !OUTLIER_TICKERS.includes(t.ticker as typeof OUTLIER_TICKERS[number]))
}

function launchedOnly(tokens: readonly TGEToken[]): readonly TGEToken[] {
  return tokens.filter((t) => t.status === "launched")
}

export function computeMedian(values: readonly number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

function computeAverage(values: readonly number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function computeCategoryStats(tokens: readonly TGEToken[]): Record<string, CategoryStats> {
  const launched = launchedOnly(excludeOutliers(tokens))
  const byCategory = new Map<string, TGEToken[]>()

  for (const token of launched) {
    const existing = byCategory.get(token.category) ?? []
    byCategory.set(token.category, [...existing, token])
  }

  const result: Record<string, CategoryStats> = {}

  for (const [category, categoryTokens] of byCategory) {
    const changes = categoryTokens
      .map((t) => t.fdv_change_pct)
      .filter((v): v is number => v != null)

    const vcRaised = categoryTokens
      .map((t) => t.vc_total_raised)
      .filter((v): v is number => v != null)

    const greenCount = categoryTokens.filter((t) => t.performance_status === "green").length

    result[category] = {
      count: categoryTokens.length,
      median_change: round2(computeMedian(changes)),
      avg_change: round2(computeAverage(changes)),
      pct_green: round2((greenCount / categoryTokens.length) * 100),
      total_vc_raised: vcRaised.reduce((sum, v) => sum + v, 0),
    }
  }

  return result
}

export function computeTierStats(tokens: readonly TGEToken[]): Record<string, TierStats> {
  const launched = launchedOnly(excludeOutliers(tokens))
  const byTier = new Map<string, TGEToken[]>()

  for (const token of launched) {
    const existing = byTier.get(token.fdv_tier) ?? []
    byTier.set(token.fdv_tier, [...existing, token])
  }

  const tierLabels: Record<string, string> = {
    mega: "\u2265$958M",
    large: "$500M\u2013$958M",
    mid: "$210M\u2013$500M",
    small: "<$210M",
  }

  const result: Record<string, TierStats> = {}

  for (const [tier, tierTokens] of byTier) {
    const changes = tierTokens
      .map((t) => t.fdv_change_pct)
      .filter((v): v is number => v != null)

    const startingFdvs = tierTokens.map((t) => t.starting_fdv)
    const greenCount = tierTokens.filter((t) => t.performance_status === "green").length

    result[tier] = {
      range_label: tierLabels[tier] ?? tier,
      count: tierTokens.length,
      median_starting_fdv: round2(computeMedian(startingFdvs)),
      median_change: round2(computeMedian(changes)),
      pct_green: round2((greenCount / tierTokens.length) * 100),
    }
  }

  return result
}

export function computeDashboardStats(tokens: readonly TGEToken[]): DashboardStats {
  const filtered = excludeOutliers(tokens)
  const launched = launchedOnly(filtered)

  const changes = launched
    .map((t) => t.fdv_change_pct)
    .filter((v): v is number => v != null)

  const greenCount = launched.filter((t) => t.performance_status === "green").length
  const redCount = launched.filter((t) => t.performance_status === "red").length

  const vcRaised = filtered
    .map((t) => t.vc_total_raised)
    .filter((v): v is number => v != null)

  const vcCoverage = filtered.filter((t) => t.vc_total_raised != null && t.vc_total_raised > 0).length

  return {
    total_tokens: tokens.length,
    launched_tokens: launched.length,
    green_count: greenCount,
    red_count: redCount,
    green_pct: round2((greenCount / Math.max(launched.length, 1)) * 100),
    median_fdv_change: round2(computeMedian(changes)),
    total_vc_raised: vcRaised.reduce((sum, v) => sum + v, 0),
    vc_data_coverage: vcCoverage,
    by_category: computeCategoryStats(tokens),
    by_fdv_tier: computeTierStats(tokens),
    outliers: [...OUTLIER_TICKERS],
    last_updated: new Date().toISOString(),
  }
}

export function getTopPerformers(tokens: readonly TGEToken[], n = 10): readonly TGEToken[] {
  const launched = launchedOnly(excludeOutliers(tokens))
  return [...launched]
    .filter((t) => t.fdv_change_pct != null)
    .sort((a, b) => (b.fdv_change_pct ?? 0) - (a.fdv_change_pct ?? 0))
    .slice(0, n)
}

export function getBottomPerformers(tokens: readonly TGEToken[], n = 10): readonly TGEToken[] {
  const launched = launchedOnly(excludeOutliers(tokens))
  return [...launched]
    .filter((t) => t.fdv_change_pct != null)
    .sort((a, b) => (a.fdv_change_pct ?? 0) - (b.fdv_change_pct ?? 0))
    .slice(0, n)
}

export function filterByCategory(tokens: readonly TGEToken[], category: Category): readonly TGEToken[] {
  return tokens.filter((t) => t.category === category)
}

export function filterByTier(tokens: readonly TGEToken[], tier: FdvTier): readonly TGEToken[] {
  return tokens.filter((t) => t.fdv_tier === tier)
}
