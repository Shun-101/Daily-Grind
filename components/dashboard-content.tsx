"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { Plus, CheckCircle2, Circle, Clock, AlertCircle, Flame, CalendarIcon, Trash2 } from "lucide-react"
import type { Task, Habit, Notification } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface DashboardContentProps {
  userId: string
  nickname: string
}

export function DashboardContent({ userId, nickname }: DashboardContentProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const { toast } = useToast()

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
  })

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient()

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })

      if (tasksError) {
        console.error("[v0] Error fetching tasks:", tasksError)
      }

      // Fetch habits
      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .limit(3)

      if (habitsError) {
        console.error("[v0] Error fetching habits:", habitsError)
      }

      // Fetch recent notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5)

      if (notificationsError) {
        console.error("[v0] Error fetching notifications:", notificationsError)
      }

      setTasks(tasksData || [])
      setHabits(habitsData || [])
      setNotifications(notificationsData || [])
    } catch (error) {
      console.error("[v0] Error in fetchData:", error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
          status: "pending",
        })
        .select()

      if (error) {
        console.error("[v0] Error creating task:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to create task",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Task created successfully",
        })
        setNewTask({ title: "", description: "", priority: "medium", due_date: "" })
        setIsAddTaskOpen(false)
        if (data && data.length > 0) {
          setTasks([data[0], ...tasks])
        }
      }
    } catch (error) {
      console.error("[v0] Error in handleAddTask:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const supabase = createClient()
      const newStatus = currentStatus === "completed" ? "pending" : "completed"
      const { error } = await supabase
        .from("tasks")
        .update({
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", taskId)

      if (error) {
        console.error("[v0] Error toggling task:", error)
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        })
      } else {
        setTasks(
          tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: newStatus as any,
                  completed_at: newStatus === "completed" ? new Date().toISOString() : null,
                }
              : t,
          ),
        )
      }
    } catch (error) {
      console.error("[v0] Error in handleToggleTask:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) {
        console.error("[v0] Error deleting task:", error)
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        })
      } else {
        setTasks(tasks.filter((t) => t.id !== taskId))
        toast({
          title: "Success",
          description: "Task deleted successfully",
        })
      }
    } catch (error) {
      console.error("[v0] Error in handleDeleteTask:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const upcomingTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === "completed") return false
    const dueDate = new Date(task.due_date)
    return dueDate >= now && dueDate <= tomorrow
  })

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === "completed") return false
    const dueDate = new Date(task.due_date)
    return dueDate < now
  })

  const pendingTasks = tasks.filter((t) => t.status !== "completed")
  const completedTasks = tasks.filter((t) => t.status === "completed")
  const maxStreak = Math.max(...habits.map((h) => h.current_streak), 0)
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-muted rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Welcome Section */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {nickname}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your productivity today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover-lift animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">Tasks to complete</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxStreak}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      {tasks.length > 0 && (
        <Card className="hover-lift animate-in fade-in duration-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <CardDescription>Overall task completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{completionPercentage}% Complete</span>
              <span className="text-xs text-muted-foreground">
                {completedTasks.length} of {tasks.length} tasks
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks Section */}
        <Card className="lg:col-span-2 hover-lift animate-in fade-in slide-in-from-left duration-700 delay-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Manage your assignments and to-dos</CardDescription>
              </div>
              <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>Add a new task to your list</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Task description (optional)"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTask}>Create Task</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="font-medium text-muted-foreground">No tasks yet!</p>
                  <p className="text-sm text-muted-foreground">
                    Click "Add Task" to create your first task and start tracking your productivity.
                  </p>
                </div>
              ) : (
                tasks.map((task) => {
                  const dueDate = task.due_date ? new Date(task.due_date) : null
                  const isOverdue = dueDate && dueDate < now && task.status !== "completed"
                  const isDueSoon = dueDate && dueDate >= now && dueDate <= tomorrow && task.status !== "completed"

                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => handleToggleTask(task.id, task.status)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task.title}
                          </p>
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              Overdue
                            </Badge>
                          )}
                          {isDueSoon && (
                            <Badge variant="secondary" className="text-xs">
                              Due Soon
                            </Badge>
                          )}
                        </div>
                        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                        {task.due_date && (
                          <p
                            className={`text-xs ${isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}
                          >
                            Due: {format(new Date(task.due_date), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="hover-lift animate-in fade-in slide-in-from-right duration-700 delay-500">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Stay updated with your activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="space-y-1 rounded-lg border p-3">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.created_at), "MMM dd, h:mm a")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
