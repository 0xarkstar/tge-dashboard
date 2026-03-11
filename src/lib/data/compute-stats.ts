import type { TGEToken, DashboardStats, CategoryStats, TierStats, Category, FdvTier } from "@/lib/types"
import { FDV_TIER_LABELS, OUTLIER_TICKERS } from "@/lib/constants"

export { OUTLIER_TICKERS }

function excludeOutliers(tokens: readonly TGEToken[]): readonly TGEToken[] {
  return tokens.filter((t) => !OUTLIER_TICKERS.includes(t.ticker as typeof OUTLIER_TICKERS[number]))
}

function launchedOnly(tokens: readonly TGEToken[]): readonly TGEToken[] {
  return tokens.filter((t) => t.status === "launched")
}

/** Exclude outliers and filter to launched tokens — use for all analytics computations */
export function getAnalyticsTokens(tokens: readonly TGEToken[]): readonly TGEToken[] {
  return launchedOnly(excludeOutliers(tokens))
}

export function computeMedian(values: readonly number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

function computeAverage(values: readonly number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function round2(n: number): number {
  return Number(n.toFixed(2))
}

export function computeCategoryStats(tokens: readonly TGEToken[]): Record<string, CategoryStats> {
  const launched = getAnalyticsTokens(tokens)
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
      // ?? 0 maps empty-sample medians/averages to 0; UI should check `count` for sample size context
      median_change: round2(computeMedian(changes) ?? 0),
      avg_change: round2(computeAverage(changes) ?? 0),
      pct_green: categoryTokens.length > 0 ? round2((greenCount / categoryTokens.length) * 100) : 0,
      total_vc_raised: vcRaised.reduce((sum, v) => sum + v, 0),
    }
  }

  return result
}

export function computeTierStats(tokens: readonly TGEToken[]): Record<string, TierStats> {
  const launched = getAnalyticsTokens(tokens)
  const byTier = new Map<string, TGEToken[]>()

  for (const token of launched) {
    const existing = byTier.get(token.fdv_tier) ?? []
    byTier.set(token.fdv_tier, [...existing, token])
  }

  const result: Record<string, TierStats> = {}

  for (const [tier, tierTokens] of byTier) {
    const changes = tierTokens
      .map((t) => t.fdv_change_pct)
      .filter((v): v is number => v != null)

    const startingFdvs = tierTokens.map((t) => t.starting_fdv)
    const greenCount = tierTokens.filter((t) => t.performance_status === "green").length

    result[tier] = {
      range_label: FDV_TIER_LABELS[tier as keyof typeof FDV_TIER_LABELS] ?? tier,
      count: tierTokens.length,
      // ?? 0 maps empty-sample medians to 0; UI should check `count` for sample size context
      median_starting_fdv: round2(computeMedian(startingFdvs) ?? 0),
      median_change: round2(computeMedian(changes) ?? 0),
      pct_green: tierTokens.length > 0 ? round2((greenCount / tierTokens.length) * 100) : 0,
    }
  }

  return result
}

export function computeDashboardStats(tokens: readonly TGEToken[]): DashboardStats {
  const filtered = excludeOutliers(tokens)
  const launched = getAnalyticsTokens(tokens)

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
    median_fdv_change: round2(computeMedian(changes) ?? 0),
    total_vc_raised: vcRaised.reduce((sum, v) => sum + v, 0),
    vc_data_coverage: vcCoverage,
    by_category: computeCategoryStats(tokens),
    by_fdv_tier: computeTierStats(tokens),
    outliers: [...OUTLIER_TICKERS],
    last_updated: new Date().toISOString(),
  }
}

export function getTopPerformers(tokens: readonly TGEToken[], n = 10): readonly TGEToken[] {
  const launched = getAnalyticsTokens(tokens)
  return [...launched]
    .filter((t) => t.fdv_change_pct != null)
    .sort((a, b) => (b.fdv_change_pct ?? 0) - (a.fdv_change_pct ?? 0))
    .slice(0, n)
}

export function getBottomPerformers(tokens: readonly TGEToken[], n = 10): readonly TGEToken[] {
  const launched = getAnalyticsTokens(tokens)
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
