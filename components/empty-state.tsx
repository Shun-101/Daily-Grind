"use client"

import { AlertCircle, Bell } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  icon?: "task" | "notification"
}

export function EmptyState({ title, description, icon = "task" }: EmptyStateProps) {
  const Icon = icon === "task" ? AlertCircle : Bell

  return (
    <div className="py-12 text-center">
      <Icon className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
      <p className="font-medium text-muted-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
