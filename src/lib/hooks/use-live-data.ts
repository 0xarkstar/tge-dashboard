"use client"

import useSWR from "swr"
import { z } from "zod"
import type { TGEToken, DashboardStats } from "@/lib/types"
import { TGETokenSchema } from "@/lib/types"
import { DATA_URL as URLS } from "@/lib/constants"
import { computeDashboardStats } from "@/lib/data/compute-stats"
import staticTokens from "../../../data/tokens.json"

const LIVE_URL = URLS.tokens
const FALLBACK_URL = "/data/tokens.json"
const REFRESH_INTERVAL = 2 * 60 * 60 * 1000 // 2 hours

async function fetcher(url: string): Promise<TGEToken[]> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw: unknown = await res.json()
    return z.array(TGETokenSchema).parse(raw)
  } catch (err) {
    if (url === LIVE_URL) {
      try {
        const res = await fetch(FALLBACK_URL)
        if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`)
        const raw: unknown = await res.json()
        return z.array(TGETokenSchema).parse(raw)
      } catch {
        return staticTokens as TGEToken[]
      }
    }
    throw err instanceof Error ? err : new Error("Failed to fetch token data")
  }
}

export function useLiveTokens(): {
  tokens: TGEToken[]
  stats: DashboardStats
  isLoading: boolean
  error: Error | undefined
  lastUpdated: string | undefined
} {
  const { data, error, isLoading } = useSWR<TGEToken[]>(LIVE_URL, fetcher, {
    refreshInterval: REFRESH_INTERVAL,
    fallbackData: staticTokens as TGEToken[],
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  const tokens = data ?? (staticTokens as TGEToken[])
  const stats = computeDashboardStats(tokens)
  const lastUpdated = tokens.length > 0
    ? new Date(Math.max(...tokens.map(t => new Date(t.last_updated).getTime()))).toISOString()
    : undefined

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
