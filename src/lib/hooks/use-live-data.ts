"use client"

import useSWR from "swr"
import type { TGEToken, DashboardStats } from "@/lib/types"
import { computeDashboardStats } from "@/lib/data/compute-stats"
import staticTokens from "../../../data/tokens.json"

const DATA_URL =
  "https://raw.githubusercontent.com/OWNER/tge-dashboard/data/data/tokens.json"
const FALLBACK_URL = "/data/tokens.json"
const REFRESH_INTERVAL = 2 * 60 * 60 * 1000 // 2 hours

async function fetcher(url: string): Promise<TGEToken[]> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as TGEToken[]
  } catch {
    if (url === DATA_URL) {
      const res = await fetch(FALLBACK_URL)
      if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`)
      return (await res.json()) as TGEToken[]
    }
    throw new Error("Failed to fetch token data")
  }
}

export function useLiveTokens(): {
  tokens: TGEToken[]
  stats: DashboardStats
  isLoading: boolean
  error: Error | undefined
  lastUpdated: string | undefined
} {
  const { data, error, isLoading } = useSWR<TGEToken[]>(DATA_URL, fetcher, {
    refreshInterval: REFRESH_INTERVAL,
    fallbackData: staticTokens as TGEToken[],
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  const tokens = data ?? (staticTokens as TGEToken[])
  const stats = computeDashboardStats(tokens)
  const lastUpdated = tokens.length > 0 ? tokens[0].last_updated : undefined

  return { tokens, stats, isLoading, error, lastUpdated }
}

export function useToken(ticker: string): {
  token: TGEToken | undefined
  isLoading: boolean
  error: Error | undefined
} {
  const { tokens, isLoading, error } = useLiveTokens()
  const token = tokens.find(
    (t) => t.ticker.toLowerCase() === ticker.toLowerCase()
  )
  return { token, isLoading, error }
}
