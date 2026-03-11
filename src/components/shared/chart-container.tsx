"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ResponsiveContainer } from "recharts"

interface ChartContainerProps {
  readonly children: ReactNode
  readonly height?: string
  readonly className?: string
}

/**
 * Wraps Recharts ResponsiveContainer with reliable dimension measurement.
 * Fixes the width(-1)/height(-1) issue in SSG + client hydration scenarios
 * by deferring chart render until the container has measurable dimensions.
 */
export function ChartContainer({ children, height = "h-80", className = "" }: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  const checkDimensions = useCallback(() => {
    const el = containerRef.current
    if (!el) return false
    const { width, height } = el.getBoundingClientRect()
    return width > 0 && height > 0
  }, [])

  useEffect(() => {
    if (checkDimensions()) {
      setReady(true)
      return
    }

    // Wait for next animation frame + microtask to ensure layout is computed
    let rafId: number
    let attempts = 0
    const maxAttempts = 10

    function tryMount() {
      if (checkDimensions()) {
        setReady(true)
        return
      }
      attempts++
      if (attempts < maxAttempts) {
        rafId = requestAnimationFrame(tryMount)
      } else {
        // Fallback: mount anyway after several frames
        setReady(true)
      }
    }

    rafId = requestAnimationFrame(tryMount)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [checkDimensions])

  return (
    <div ref={containerRef} className={`${height} w-full ${className}`} style={{ minWidth: "1px" }}>
      {ready && (
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      )}
    </div>
  )
}
