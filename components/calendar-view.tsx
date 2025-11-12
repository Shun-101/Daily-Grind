"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Task, ClassSchedule } from "@/lib/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns"

interface CalendarViewProps {
  userId: string
}

type ViewMode = "month" | "week"

export function CalendarView({ userId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [tasks, setTasks] = useState<Task[]>([])
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [userId, currentDate])

  const fetchData = async () => {
    const supabase = createClient()

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .not("due_date", "is", null)
      .order("due_date", { ascending: true })

    const { data: schedulesData } = await supabase.from("class_schedules").select("*").eq("user_id", userId)

    setTasks(tasksData || [])
    setSchedules(schedulesData || [])
    setLoading(false)
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => task.due_date && isSameDay(parseISO(task.due_date), date))
  }

  const getSchedulesForDate = (date: Date) => {
    const dayOfWeek = date.getDay()
    return schedules.filter((schedule) => schedule.day_of_week === dayOfWeek)
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const dateFormat = "d"
    const rows = []
    let days = []
    let day = startDate

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat)
        const cloneDay = day
        const dayTasks = getTasksForDate(cloneDay)
        const daySchedules = getSchedulesForDate(cloneDay)
        const isCurrentMonth = isSameMonth(day, monthStart)
        const isCurrentDay = isToday(day)

        days.push(
          <Popover key={day.toString()}>
            <PopoverTrigger asChild>
              <div
                className={`min-h-32 cursor-pointer border-r border-b p-2 transition-all hover:bg-muted/50 hover:shadow-md ${
                  !isCurrentMonth ? "bg-muted/30" : ""
                } ${isCurrentDay ? "bg-primary/5" : ""}`}
              >
                <div className={`mb-2 text-sm font-medium ${isCurrentDay ? "text-primary" : ""}`}>{formattedDate}</div>
                <div className="space-y-1">
                  {daySchedules.slice(0, 2).map((schedule) => (
                    <div
                      key={schedule.id}
                      className="truncate rounded px-1 py-0.5 text-xs"
                      style={{ backgroundColor: schedule.color + "20", color: schedule.color }}
                    >
                      {schedule.course_code || schedule.course_name}
                    </div>
                  ))}
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className={`truncate rounded bg-muted px-1 py-0.5 text-xs ${
                        task.status === "completed" ? "line-through opacity-50" : ""
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length + daySchedules.length > 4 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayTasks.length + daySchedules.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            </PopoverTrigger>
            {(dayTasks.length > 0 || daySchedules.length > 0) && (
              <PopoverContent className="w-80" side="top">
                <div className="space-y-3">
                  <div>
                    <h4 className="mb-2 font-semibold">{format(cloneDay, "EEEE, MMMM d")}</h4>
                  </div>
                  {daySchedules.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Classes</p>
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="rounded-lg p-2 text-sm"
                          style={{ backgroundColor: schedule.color + "20", borderLeft: `3px solid ${schedule.color}` }}
                        >
                          <div className="font-medium">{schedule.course_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.start_time} - {schedule.end_time}
                          </div>
                          {schedule.location && (
                            <div className="text-xs text-muted-foreground">{schedule.location}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {dayTasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Tasks</p>
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`rounded-lg border bg-card p-2 text-sm ${task.status === "completed" ? "opacity-50" : ""}`}
                        >
                          <div className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}>
                            {task.title}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            )}
          </Popover>,
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>,
      )
      days = []
    }

    return (
      <div>
        <div className="grid grid-cols-7 border-b border-l border-t">
          {daysOfWeek.map((day) => (
            <div key={day} className="border-r bg-muted/50 p-2 text-center text-sm font-semibold">
              {day}
            </div>
          ))}
        </div>
        <div className="border-l">{rows}</div>
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)

    const days = []
    let day = weekStart

    while (day <= weekEnd) {
      const cloneDay = day
      const dayTasks = getTasksForDate(cloneDay)
      const daySchedules = getSchedulesForDate(cloneDay)
      const isCurrentDay = isToday(day)

      days.push(
        <div key={day.toString()} className="flex-1 border-r p-4">
          <div className={`mb-3 text-center ${isCurrentDay ? "text-primary" : ""}`}>
            <div className="text-sm font-medium">{format(day, "EEE")}</div>
            <div className={`text-2xl font-bold ${isCurrentDay ? "text-primary" : ""}`}>{format(day, "d")}</div>
          </div>
          <div className="space-y-2">
            {daySchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="rounded-lg p-2 text-sm"
                style={{ backgroundColor: schedule.color + "20", borderLeft: `3px solid ${schedule.color}` }}
              >
                <div className="font-medium">{schedule.course_name}</div>
                <div className="text-xs text-muted-foreground">
                  {schedule.start_time} - {schedule.end_time}
                </div>
                {schedule.location && <div className="text-xs text-muted-foreground">{schedule.location}</div>}
              </div>
            ))}
            {dayTasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-lg border bg-card p-2 text-sm ${task.status === "completed" ? "opacity-50" : ""}`}
              >
                <div className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}>{task.title}</div>
                <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="mt-1 text-xs">
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>,
      )
      day = addDays(day, 1)
    }

    return <div className="flex border-l border-t">{days}</div>
  }

  const handlePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, -1))
    } else {
      setCurrentDate(addWeeks(currentDate, -1))
    }
  }

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <Card className="hover-lift">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar
              </CardTitle>
              <CardDescription>View your tasks and class schedule</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("week")}
                disabled={viewMode === "week"}
                className="transition-all hover:scale-105"
              >
                Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("month")}
                disabled={viewMode === "month"}
                className="transition-all hover:scale-105"
              >
                Month
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {viewMode === "month" ? format(currentDate, "MMMM yyyy") : format(currentDate, "MMMM d, yyyy")}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="transition-all hover:scale-105 bg-transparent"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="transition-all hover:scale-110 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="transition-all hover:scale-110 bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {viewMode === "month" ? renderMonthView() : renderWeekView()}
        </CardContent>
      </Card>
    </div>
  )
}
