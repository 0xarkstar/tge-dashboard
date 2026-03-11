"use client"

import { Github } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants"
import { useI18n } from "@/lib/i18n"

interface SiteFooterProps {
  readonly lastUpdated?: string
}

export function SiteFooter({ lastUpdated }: SiteFooterProps) {
  const { t } = useI18n()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p>{t("footer.data")}</p>
        {lastUpdated ? <p>{t("footer.updated", { date: lastUpdated })}</p> : null}
        <a
          href={SITE_CONFIG.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <Github className="h-4 w-4" />
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  )
}
