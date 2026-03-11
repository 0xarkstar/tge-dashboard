import type { Category, FdvTier } from "./types"

export const CATEGORIES: readonly Category[] = [
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
] as const

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
    "https://raw.githubusercontent.com/{owner}/{repo}/data/data/tokens.json",
  stats:
    "https://raw.githubusercontent.com/{owner}/{repo}/data/data/stats.json",
}

export const SITE_CONFIG = {
  name: "2025 TGE Performance Dashboard",
  description:
    "Track 118 VC-backed token generation events and their market performance in 2025.",
  github: "https://github.com/{owner}/{repo}",
}
