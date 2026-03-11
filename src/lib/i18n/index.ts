"use client"

import { createContext, useContext } from "react"
import { en } from "./translations/en"
import { ko } from "./translations/ko"

export type Locale = "en" | "ko"

// Structure type widens literal strings to `string` for cross-locale compatibility
type DeepStringify<T> = T extends string
  ? string
  : T extends Record<string, unknown>
    ? { readonly [K in keyof T]: DeepStringify<T[K]> }
    : T

type TranslationTree = DeepStringify<typeof en>

// Flatten nested keys: { nav: { dashboard: "..." } } => "nav.dashboard"
type FlattenKeys<T, Prefix extends string = ""> = T extends Record<string, unknown>
  ? { [K in keyof T & string]: FlattenKeys<T[K], Prefix extends "" ? K : `${Prefix}.${K}`> }[keyof T & string]
  : Prefix

export type TranslationKey = FlattenKeys<typeof en>

const translations: Record<Locale, TranslationTree> = { en, ko }

function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split(".")
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== "object") return path
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === "string" ? current : path
}

export function translate(locale: Locale, key: TranslationKey, params?: Record<string, string | number>): string {
  let value = getNestedValue(translations[locale], key)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v))
    }
  }
  return value
}

interface I18nContextValue {
  readonly locale: Locale
  readonly setLocale: (locale: Locale) => void
  readonly t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
})

export function useI18n() {
  return useContext(I18nContext)
}
