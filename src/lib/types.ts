import { z } from "zod"

export const Category = z.enum([
  "DeFi",
  "Infra",
  "AI",
  "Gaming",
  "L1",
  "L2",
  "Consumer",
  "Social",
  "RWA",
  "DeSci",
  "Perp DEX",
  "Stablecoin",
  "Data",
  "Other",
])

export const FdvTier = z.enum(["mega", "large", "mid", "small"])

export const TGETokenSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  coingecko_id: z.string().nullable().optional(),
  category: Category,
  chain: z.string(),
  half: z.enum(["H1", "H2"]),
  tge_date: z.string().nullable().optional(),
  starting_fdv: z.number(),
  starting_mc: z.number(),
  initial_circ_ratio: z.number().min(0).max(1).nullable().optional(),
  current_fdv: z.number().nullable().optional(),
  current_mc: z.number().nullable().optional(),
  volume_24h: z.number().nullable().optional(),
  current_price: z.number().nullable().optional(),
  vc_total_raised: z.number().nullable().optional(),
  lead_investors: z.array(z.string()),
  vc_data_source: z.string().nullable().optional(),
  fdv_change_pct: z.number().nullable().optional(),
  fdv_tier: FdvTier,
  performance_status: z.enum(["green", "red"]),
  is_illiquid: z.boolean(),
  ath: z.number().nullable().optional(),
  atl: z.number().nullable().optional(),
  data_source: z.enum(["live", "static"]).optional(),
  status: z.enum(["launched", "pending", "delisted"]),
  last_updated: z.string(),
})

export const CategoryStatsSchema = z.object({
  count: z.number(),
  median_change: z.number(),
  avg_change: z.number(),
  pct_green: z.number(),
  total_vc_raised: z.number(),
})

export const TierStatsSchema = z.object({
  range_label: z.string(),
  count: z.number(),
  median_starting_fdv: z.number(),
  median_change: z.number(),
  pct_green: z.number(),
})

export const DashboardStatsSchema = z.object({
  total_tokens: z.number(),
  launched_tokens: z.number(),
  green_count: z.number(),
  red_count: z.number(),
  green_pct: z.number(),
  median_fdv_change: z.number(),
  total_vc_raised: z.number(),
  vc_data_coverage: z.number(),
  by_category: z.record(z.string(), CategoryStatsSchema),
  by_fdv_tier: z.record(z.string(), TierStatsSchema),
  outliers: z.array(z.string()),
  last_updated: z.string(),
})

export type Category = z.infer<typeof Category>
export type FdvTier = z.infer<typeof FdvTier>
export type TGEToken = z.infer<typeof TGETokenSchema>
export type CategoryStats = z.infer<typeof CategoryStatsSchema>
export type TierStats = z.infer<typeof TierStatsSchema>
export type DashboardStats = z.infer<typeof DashboardStatsSchema>
