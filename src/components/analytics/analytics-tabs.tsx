"use client"

import { useState, type ReactNode } from "react"

interface Tab {
  readonly id: string
  readonly label: string
  readonly content: ReactNode
}

interface AnalyticsTabsProps {
  readonly tabs: readonly Tab[]
}

export function AnalyticsTabs({ tabs }: AnalyticsTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "")

  const activeContent = tabs.find((t) => t.id === activeTab)?.content

  return (
    <div>
      <div className="flex overflow-x-auto border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div key={activeTab}>{activeContent}</div>
    </div>
  )
}
