"use client"

import { useLiveTokens } from "@/lib/hooks/use-live-data"
import { TokenTable } from "@/components/tokens/token-table"

export default function TokensPage() {
  const { tokens, isLoading, error } = useLiveTokens()

  if (isLoading && tokens.length === 0) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Token List</h1>
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Loading tokens...</div>
          </div>
        </div>
      </main>
    )
  }

  if (error && tokens.length === 0) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">Token List</h1>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            Failed to load token data. Please try again later.
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Token List</h1>
          <p className="mt-1 text-muted-foreground">
            {tokens.length} tokens tracked across 2025 TGEs
          </p>
        </div>
        <TokenTable tokens={tokens} />
      </div>
    </main>
  )
}
