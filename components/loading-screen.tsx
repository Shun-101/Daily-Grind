"use client"

import { Target } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 animate-pulse">
            <Target className="h-10 w-10 text-primary-foreground animate-spin" style={{ animationDuration: "3s" }} />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold animate-pulse">Loading Daily Grind</h2>
          <p className="text-sm text-muted-foreground">Preparing your productivity dashboard...</p>
        </div>
        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-primary/60 animate-[slideInFromBottom_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  )
}
