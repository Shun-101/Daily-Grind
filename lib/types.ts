export interface Profile {
  id: string
  nickname: string
  email: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ClassSchedule {
  id: string
  user_id: string
  course_name: string
  course_code?: string
  instructor?: string
  location?: string
  day_of_week: number // 0 = Sunday, 6 = Saturday
  start_time: string
  end_time: string
  color: string
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description?: string
  current_streak: number
  longest_streak: number
  last_completed_date?: string
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
}

export interface RecurringTask {
  id: string
  user_id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  recurrence_pattern: "daily" | "weekly" | "biweekly" | "monthly"
  recurrence_days?: string // JSON array of days
  start_date: string
  end_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}
