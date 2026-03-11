"use client"

import { useLiveTokens } from "@/lib/hooks/use-live-data"
import { TokenTable } from "@/components/tokens/token-table"
import { useI18n } from "@/lib/i18n"

export default function TokensPage() {
  const { tokens, isLoading, error } = useLiveTokens()
  const { t } = useI18n()

  if (isLoading && tokens.length === 0) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">{t("tokens.title")}</h1>
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">{t("tokens.loading")}</div>
          </div>
        </div>
      </main>
    )
  }

  if (error && tokens.length === 0) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">{t("tokens.title")}</h1>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {t("tokens.error")}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("tokens.title")}</h1>
          <p className="mt-1 text-muted-foreground">
            {t("tokens.tracked", { n: String(tokens.length) })}
          </p>
        </div>
        <TokenTable tokens={tokens} />
      </div>
    </main>
  )
}
