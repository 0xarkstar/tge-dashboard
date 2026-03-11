"use client"

import { type ReactNode } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Tab {
  readonly id: string
  readonly label: string
  readonly content: ReactNode
}

interface AnalyticsTabsProps {
  readonly tabs: readonly Tab[]
}

export function AnalyticsTabs({ tabs }: AnalyticsTabsProps) {
  return (
    <Tabs defaultValue={tabs[0]?.id}>
      <TabsList className="h-auto w-full justify-start rounded-none border-b border-border bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
