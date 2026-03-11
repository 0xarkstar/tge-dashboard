import { Category as CategoryEnum } from "./types"
import type { Category, FdvTier } from "./types"

/** Derived from Zod enum — single source of truth */
export const CATEGORIES: readonly Category[] = CategoryEnum.options

export const CATEGORY_COLORS: Record<Category, string> = {
  DeFi: "oklch(0.7 0.15 250)",
  Infra: "oklch(0.7 0.18 145)",
  AI: "oklch(0.7 0.15 310)",
  Gaming: "oklch(0.7 0.15 60)",
  L1: "oklch(0.65 0.2 27)",
  L2: "oklch(0.7 0.12 200)",
  Consumer: "oklch(0.75 0.14 80)",
  Social: "oklch(0.65 0.15 280)",
  RWA: "oklch(0.7 0.1 170)",
  DeSci: "oklch(0.65 0.18 340)",
  "Perp DEX": "oklch(0.75 0.12 220)",
  Stablecoin: "oklch(0.7 0.08 100)",
  Data: "oklch(0.65 0.14 240)",
  Other: "oklch(0.6 0.05 0)",
}

export const FDV_TIER_BOUNDARIES: Record<Exclude<FdvTier, "small">, number> = {
  mega: 958_000_000,
  large: 500_000_000,
  mid: 210_000_000,
}

export const FDV_TIER_LABELS: Record<FdvTier, string> = {
  mega: "≥$958M",
  large: "$500M–$958M",
  mid: "$210M–$500M",
  small: "<$210M",
}

export const DATA_URL = {
  tokens:
    "https://raw.githubusercontent.com/0xarkstar/tge-dashboard/main/data/tokens.json",
  stats:
    "https://raw.githubusercontent.com/0xarkstar/tge-dashboard/main/data/stats.json",
}

export const CHART_THEME = {
  grid: "oklch(0.3 0 0)",
  axis: "oklch(0.65 0 0)",
  tooltipBg: "oklch(0.178 0 0)",
  tooltipBorder: "oklch(0.3 0 0)",
  tooltipText: "oklch(0.985 0 0)",
  green: "oklch(0.7 0.18 145)",
  red: "oklch(0.6 0.2 27)",
  reference: "oklch(0.5 0 0)",
  scatter: "oklch(0.7 0.15 250)",
  h1: "oklch(0.7 0.15 250)",
  h2: "oklch(0.7 0.15 310)",
} as const

/** Tokens excluded from analytics due to extreme outlier status */
export const OUTLIER_TICKERS = ["WLFI", "ASTER", "ESPORTS"] as const

/** Shared tooltip style for all Recharts charts */
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "oklch(0.178 0 0)",
  border: "1px solid oklch(0.3 0 0)",
  borderRadius: "8px",
  color: "oklch(0.985 0 0)",
} as const

export const SITE_CONFIG = {
  name: "2025 TGE Performance Dashboard",
  description:
    "Track VC-backed token generation events and their market performance in 2025.",
  github: "https://github.com/0xarkstar/tge-dashboard",
}
