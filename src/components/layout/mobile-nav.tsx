"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useEffect, useCallback } from "react"

interface NavLink {
  readonly href: string
  readonly label: string
}

interface MobileNavProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly links: readonly NavLink[]
}

export function MobileNav({ open, onClose, links }: MobileNavProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.classList.add("overflow-hidden")
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.classList.remove("overflow-hidden")
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose()
        }}
        role="button"
        tabIndex={0}
        aria-label="Close menu"
      />

      <nav className="fixed inset-y-0 right-0 w-3/4 max-w-sm border-l border-border bg-background p-6 shadow-lg animate-slide-in-right">
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="rounded-[var(--radius)] p-2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-foreground transition-colors hover:text-primary"
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
