"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { Flame, CheckCircle2, Clock, Plus, Target } from "lucide-react"
import type { Task, Habit, HabitCompletion } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from "date-fns"

interface AnalyticsViewProps {
  userId: string
}

export function AnalyticsView({ userId }: AnalyticsViewProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false)
  const { toast } = useToast()

  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    const supabase = createClient()

    // Fetch all tasks
    const { data: tasksData } = await supabase.from("tasks").select("*").eq("user_id", userId)

    // Fetch habits
    const { data: habitsData } = await supabase.from("habits").select("*").eq("user_id", userId)

    // Fetch habit completions from last 30 days
    const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd")
    const { data: completionsData } = await supabase
      .from("habit_completions")
      .select("*")
      .eq("user_id", userId)
      .gte("completed_date", thirtyDaysAgo)

    setTasks(tasksData || [])
    setHabits(habitsData || [])
    setHabitCompletions(completionsData || [])
    setLoading(false)
  }

  const handleAddHabit = async () => {
    if (!newHabit.name.trim()) {
      toast({
        title: "Error",
        description: "Habit name is required",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("habits").insert({
      user_id: userId,
      name: newHabit.name,
      description: newHabit.description,
      current_streak: 0,
      longest_streak: 0,
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create habit",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Habit created successfully",
      })
      setNewHabit({ name: "", description: "" })
      setIsAddHabitOpen(false)
      fetchData()
    }
  }

  const handleToggleHabit = async (habitId: string) => {
    const supabase = createClient()
    const today = format(new Date(), "yyyy-MM-dd")

    // Check if already completed today
    const existingCompletion = habitCompletions.find((c) => c.habit_id === habitId && c.completed_date === today)

    if (existingCompletion) {
      // Remove completion
      const { error } = await supabase.from("habit_completions").delete().eq("id", existingCompletion.id)

      if (!error) {
        // Update streak
        const habit = habits.find((h) => h.id === habitId)
        if (habit) {
          await supabase
            .from("habits")
            .update({
              current_streak: Math.max(0, habit.current_streak - 1),
            })
            .eq("id", habitId)
        }
        fetchData()
      }
    } else {
      // Add completion
      const { error } = await supabase.from("habit_completions").insert({
        habit_id: habitId,
        user_id: userId,
        completed_date: today,
      })

      if (!error) {
        // Update streak
        const habit = habits.find((h) => h.id === habitId)
        if (habit) {
          const newStreak = habit.current_streak + 1
          await supabase
            .from("habits")
            .update({
              current_streak: newStreak,
              longest_streak: Math.max(newStreak, habit.longest_streak),
              last_completed_date: today,
            })
            .eq("id", habitId)
        }
        fetchData()
      }
    }
  }

  const isHabitCompletedToday = (habitId: string) => {
    const today = format(new Date(), "yyyy-MM-dd")
    return habitCompletions.some((c) => c.habit_id === habitId && c.completed_date === today)
  }

  // Calculate analytics data
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const pendingTasks = tasks.filter((t) => t.status === "pending").length
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Task status distribution
  const taskStatusData = [
    { name: "Completed", value: completedTasks, fill: "#10b981" }, // Green
    { name: "In Progress", value: inProgressTasks, fill: "#3b82f6" }, // Blue
    { name: "Pending", value: pendingTasks, fill: "#f59e0b" }, // Amber
  ]

  // Task priority distribution
  const highPriority = tasks.filter((t) => t.priority === "high").length
  const mediumPriority = tasks.filter((t) => t.priority === "medium").length
  const lowPriority = tasks.filter((t) => t.priority === "low").length

  const taskPriorityData = [
    { name: "High", value: highPriority, fill: "#ef4444" }, // Red
    { name: "Medium", value: mediumPriority, fill: "#f59e0b" }, // Amber
    { name: "Low", value: lowPriority, fill: "#10b981" }, // Green
  ]

  // Weekly completion trend
  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const weeklyData = weekDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd")
    const completedOnDay = tasks.filter(
      (t) => t.completed_at && format(parseISO(t.completed_at), "yyyy-MM-dd") === dayStr,
    ).length
    return {
      day: format(day, "EEE"),
      completed: completedOnDay,
    }
  })

  const maxStreak = Math.max(...habits.map((h) => h.current_streak), 0)
  const totalHabits = habits.length

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your productivity and progress</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">{completedTasks} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxStreak}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">To be completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Overview of your task statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completed: { label: "Completed", color: "#10b981" },
                inProgress: { label: "In Progress", color: "#3b82f6" },
                pending: { label: "Pending", color: "#f59e0b" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
            <CardDescription>Breakdown by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                high: { label: "High", color: "#ef4444" },
                medium: { label: "Medium", color: "#f59e0b" },
                low: { label: "Low", color: "#10b981" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskPriorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {taskPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Completion Trend</CardTitle>
            <CardDescription>Tasks completed this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completed: { label: "Completed", color: "#8b5cf6" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Habit Tracker */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Habit Tracker
              </CardTitle>
              <CardDescription>Build productive habits and maintain your streak</CardDescription>
            </div>
            <Dialog open={isAddHabitOpen} onOpenChange={setIsAddHabitOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Habit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Habit</DialogTitle>
                  <DialogDescription>Add a new habit to track</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="habit_name">Habit Name</Label>
                    <Input
                      id="habit_name"
                      placeholder="e.g., Study for 2 hours"
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="habit_description">Description (Optional)</Label>
                    <Input
                      id="habit_description"
                      placeholder="Why is this habit important?"
                      value={newHabit.description}
                      onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddHabitOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddHabit}>Create Habit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Flame className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No habits tracked yet</p>
              <p className="text-sm">Create your first habit to start building streaks</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {habits.map((habit) => {
                const isCompleted = isHabitCompletedToday(habit.id)
                return (
                  <Card key={habit.id} className={isCompleted ? "border-primary" : ""}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{habit.name}</h4>
                            {habit.description && <p className="text-sm text-muted-foreground">{habit.description}</p>}
                          </div>
                          <Button
                            size="sm"
                            variant={isCompleted ? "default" : "outline"}
                            onClick={() => handleToggleHabit(habit.id)}
                          >
                            {isCompleted ? "Done" : "Mark"}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="font-medium">{habit.current_streak} day streak</span>
                          </div>
                          <Badge variant="secondary">Best: {habit.longest_streak}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
