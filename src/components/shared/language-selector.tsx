"use client"

import { useI18n } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

const LOCALES: readonly { readonly value: Locale; readonly label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ko", label: "KO" },
]

export function LanguageSelector() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="inline-flex">
      {LOCALES.map((l) => (
        <Button
          key={l.value}
          variant={locale === l.value ? "default" : "ghost"}
          size="sm"
          onClick={() => setLocale(l.value)}
          className="h-7 px-2.5 text-xs rounded-none first:rounded-l-md last:rounded-r-md"
          aria-label={`Switch to ${l.label}`}
        >
          {l.label}
        </Button>
      ))}
    </div>
  )
}
