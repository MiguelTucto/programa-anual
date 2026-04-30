'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Dashboard } from '@/components/dashboard'
import type { Activity } from '@/lib/types'

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [viewingActivity, setViewingActivity] = useState<Activity & {
    programId: string
    generalObjectiveId: string
    specificObjectiveId: string
  } | null>(null)

  return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-background to-secondary/20">
          <Header />
          <main className="flex-1 overflow-hidden">
            <Dashboard
                viewingActivity={viewingActivity}
                onActivitySelected={(activity) => {
                  if (activity) {
                    setViewingActivity(activity)
                  } else {
                    setViewingActivity(null)
                  }
                }}
            />
          </main>
        </div>
      </div>
  )
}
