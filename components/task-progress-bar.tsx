"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface TaskProgressBarProps {
  completed: number
  total: number
}

export function TaskProgressBar({ completed, total }: TaskProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <Card className="hover-lift animate-in fade-in duration-700">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
        <CardDescription>Overall task completion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{percentage}% Complete</span>
          <span className="text-xs text-muted-foreground">
            {completed} of {total} tasks
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </CardContent>
    </Card>
  )
}
