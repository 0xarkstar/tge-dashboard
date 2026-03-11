"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { LanguageSelector } from "@/components/shared/language-selector"
import { MobileNav } from "./mobile-nav"
import { useState } from "react"

const NAV_LINKS = [
  { href: "/", labelKey: "nav.dashboard" },
  { href: "/tokens", labelKey: "nav.tokens" },
  { href: "/analytics", labelKey: "nav.analytics" },
  { href: "/about", labelKey: "nav.about" },
] as const

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useI18n()

  const navLinks = NAV_LINKS.map((link) => ({
    href: link.href,
    label: t(link.labelKey as Parameters<typeof t>[0]),
  }))

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">TGE Dashboard 2025</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href))
                    ? "text-foreground border-b-2 border-primary pb-0.5"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-[var(--radius)] p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
      />
    </>
  )
}
