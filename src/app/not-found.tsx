"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export default function NotFound() {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">{t("notFound.title")}</h1>
      <h2 className="mt-4 text-2xl font-semibold">{t("notFound.heading")}</h2>
      <p className="mt-2 text-muted-foreground">
        {t("notFound.description")}
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link href="/" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          {t("notFound.dashboard")}
        </Link>
        <Link href="/tokens" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors">
          {t("notFound.browseTokens")}
        </Link>
      </div>
    </div>
  )
}
