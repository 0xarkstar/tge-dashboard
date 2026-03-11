"use client"

import { useI18n } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

const LOCALES: readonly { readonly value: Locale; readonly label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ko", label: "KO" },
]

export function LanguageSelector() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="inline-flex rounded-md border border-border">
      {LOCALES.map((l) => (
        <button
          key={l.value}
          type="button"
          onClick={() => setLocale(l.value)}
          className={`px-2.5 py-1 text-xs font-medium transition-colors first:rounded-l-md last:rounded-r-md ${
            locale === l.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
          aria-label={`Switch to ${l.label}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
