"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { FileText, Printer, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import type { Task, ClassSchedule, Habit } from "@/lib/types"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

interface ReportsViewProps {
  userId: string
  nickname: string
}

type ReportType = "tasks" | "schedule" | "habits" | "summary"
type DateRange = "week" | "month" | "all"

export function ReportsView({ userId, nickname }: ReportsViewProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState<ReportType>("summary")
  const [dateRange, setDateRange] = useState<DateRange>("week")

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    const supabase = createClient()

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    const { data: schedulesData } = await supabase
      .from("class_schedules")
      .select("*")
      .eq("user_id", userId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true })

    const { data: habitsData } = await supabase.from("habits").select("*").eq("user_id", userId)

    setTasks(tasksData || [])
    setSchedules(schedulesData || [])
    setHabits(habitsData || [])
    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const getFilteredTasks = () => {
    if (dateRange === "all") return tasks

    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (dateRange === "week") {
      startDate = startOfWeek(now)
      endDate = endOfWeek(now)
    } else {
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
    }

    return tasks.filter((task) => {
      if (!task.created_at) return false
      const taskDate = new Date(task.created_at)
      return taskDate >= startDate && taskDate <= endDate
    })
  }

  const filteredTasks = getFilteredTasks()
  const completedTasks = filteredTasks.filter((t) => t.status === "completed")
  const pendingTasks = filteredTasks.filter((t) => t.status === "pending")
  const inProgressTasks = filteredTasks.filter((t) => t.status === "in_progress")
  const completionRate = filteredTasks.length > 0 ? Math.round((completedTasks.length / filteredTasks.length) * 100) : 0

  const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Controls - Hidden when printing */}
      <div className="space-y-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and print professional reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Options</CardTitle>
            <CardDescription>Customize your report before printing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary Report</SelectItem>
                    <SelectItem value="tasks">Tasks Report</SelectItem>
                    <SelectItem value="schedule">Schedule Report</SelectItem>
                    <SelectItem value="habits">Habits Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content - Optimized for printing */}
      <div className="space-y-6 rounded-lg border bg-card p-8 text-card-foreground print:border-0 print:bg-white print:p-0 print:text-black">
        {/* Report Header */}
        <div className="border-b border-border pb-6 print:border-gray-300">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Daily Grind Report</h1>
              <p className="mt-2 text-muted-foreground print:text-gray-600">
                Generated for {nickname} on {format(new Date(), "MMMM dd, yyyy")}
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary print:bg-gray-900">
              <FileText className="h-8 w-8 text-primary-foreground print:text-white" />
            </div>
          </div>
        </div>

        {/* Summary Report */}
        {(reportType === "summary" || reportType === "tasks") && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Task Summary</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4 print:border-gray-300 print:bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground print:text-gray-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Total Tasks
                </div>
                <div className="mt-2 text-2xl font-bold">{filteredTasks.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 print:border-gray-300 print:bg-green-50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground print:text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Completed
                </div>
                <div className="mt-2 text-2xl font-bold text-green-600">{completedTasks.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 print:border-gray-300 print:bg-blue-50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground print:text-gray-600">
                  <Clock className="h-4 w-4 text-blue-500" />
                  In Progress
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-600">{inProgressTasks.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 print:border-gray-300 print:bg-orange-50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground print:text-gray-600">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Pending
                </div>
                <div className="mt-2 text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
              </div>
            </div>

            {reportType === "tasks" && (
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold">Task Details</h3>
                <div className="overflow-hidden rounded-lg border border-border print:border-gray-300">
                  <table className="w-full">
                    <thead className="bg-muted print:bg-gray-100">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold">Title</th>
                        <th className="p-3 text-left text-sm font-semibold">Status</th>
                        <th className="p-3 text-left text-sm font-semibold">Priority</th>
                        <th className="p-3 text-left text-sm font-semibold">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((task, index) => (
                        <tr
                          key={task.id}
                          className={index % 2 === 0 ? "bg-muted/30 print:bg-gray-50" : "bg-card print:bg-white"}
                        >
                          <td className="p-3 text-sm">{task.title}</td>
                          <td className="p-3 text-sm">
                            <Badge
                              variant={
                                task.status === "completed"
                                  ? "default"
                                  : task.status === "in_progress"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="print:border print:border-gray-400"
                            >
                              {task.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            <Badge
                              variant={task.priority === "high" ? "destructive" : "secondary"}
                              className="print:border print:border-gray-400"
                            >
                              {task.priority}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            {task.due_date ? format(new Date(task.due_date), "MMM dd, yyyy") : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Report */}
        {(reportType === "summary" || reportType === "schedule") && schedules.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Class Schedule</h2>
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day, dayIndex) => {
                const daySchedules = schedules.filter((s) => s.day_of_week === dayIndex)
                if (daySchedules.length === 0) return null

                return (
                  <div key={dayIndex}>
                    <h3 className="mb-2 text-lg font-semibold">{day}</h3>
                    <div className="overflow-hidden rounded-lg border border-border print:border-gray-300">
                      <table className="w-full">
                        <thead className="bg-muted print:bg-gray-100">
                          <tr>
                            <th className="p-3 text-left text-sm font-semibold">Course</th>
                            <th className="p-3 text-left text-sm font-semibold">Time</th>
                            <th className="p-3 text-left text-sm font-semibold">Instructor</th>
                            <th className="p-3 text-left text-sm font-semibold">Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          {daySchedules.map((schedule, index) => (
                            <tr
                              key={schedule.id}
                              className={index % 2 === 0 ? "bg-muted/30 print:bg-gray-50" : "bg-card print:bg-white"}
                            >
                              <td className="p-3 text-sm">
                                <div className="font-medium">{schedule.course_name}</div>
                                {schedule.course_code && (
                                  <div className="text-xs text-muted-foreground print:text-gray-500">
                                    {schedule.course_code}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-sm">
                                {schedule.start_time} - {schedule.end_time}
                              </td>
                              <td className="p-3 text-sm">{schedule.instructor || "-"}</td>
                              <td className="p-3 text-sm">{schedule.location || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Habits Report */}
        {(reportType === "summary" || reportType === "habits") && habits.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Habit Tracking</h2>
            <div className="overflow-hidden rounded-lg border border-border print:border-gray-300">
              <table className="w-full">
                <thead className="bg-muted print:bg-gray-100">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold">Habit</th>
                    <th className="p-3 text-left text-sm font-semibold">Current Streak</th>
                    <th className="p-3 text-left text-sm font-semibold">Longest Streak</th>
                    <th className="p-3 text-left text-sm font-semibold">Last Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit, index) => (
                    <tr
                      key={habit.id}
                      className={index % 2 === 0 ? "bg-muted/30 print:bg-gray-50" : "bg-card print:bg-white"}
                    >
                      <td className="p-3 text-sm">
                        <div className="font-medium">{habit.name}</div>
                        {habit.description && (
                          <div className="text-xs text-muted-foreground print:text-gray-500">{habit.description}</div>
                        )}
                      </td>
                      <td className="p-3 text-sm font-semibold">{habit.current_streak} days</td>
                      <td className="p-3 text-sm">{habit.longest_streak} days</td>
                      <td className="p-3 text-sm">
                        {habit.last_completed_date
                          ? format(new Date(habit.last_completed_date), "MMM dd, yyyy")
                          : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Footer */}
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground print:border-gray-300 print:text-gray-600">
          <p>This report was generated by Daily Grind - Student Productivity Tool</p>
          <p className="mt-1">For more information, visit your dashboard</p>
        </div>
      </div>
    </div>
  )
}
