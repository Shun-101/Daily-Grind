"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Plus, Clock, MapPin, User, Trash2, Edit } from "lucide-react"
import type { ClassSchedule } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ScheduleManagerProps {
  userId: string
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
]

export function ScheduleManager({ userId }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    course_name: "",
    course_code: "",
    instructor: "",
    location: "",
    day_of_week: "1",
    start_time: "",
    end_time: "",
    color: COLORS[0],
  })

  useEffect(() => {
    fetchSchedules()
  }, [userId])

  const fetchSchedules = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("class_schedules")
      .select("*")
      .eq("user_id", userId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true })

    setSchedules(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      course_name: "",
      course_code: "",
      instructor: "",
      location: "",
      day_of_week: "1",
      start_time: "",
      end_time: "",
      color: COLORS[0],
    })
  }

  const handleAdd = async () => {
    if (!formData.course_name.trim() || !formData.start_time || !formData.end_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("class_schedules").insert({
      user_id: userId,
      course_name: formData.course_name,
      course_code: formData.course_code || null,
      instructor: formData.instructor || null,
      location: formData.location || null,
      day_of_week: Number.parseInt(formData.day_of_week),
      start_time: formData.start_time,
      end_time: formData.end_time,
      color: formData.color,
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add class schedule",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Class schedule added successfully",
      })
      resetForm()
      setIsAddOpen(false)
      fetchSchedules()
    }
  }

  const handleEdit = async () => {
    if (!editingSchedule || !formData.course_name.trim() || !formData.start_time || !formData.end_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from("class_schedules")
      .update({
        course_name: formData.course_name,
        course_code: formData.course_code || null,
        instructor: formData.instructor || null,
        location: formData.location || null,
        day_of_week: Number.parseInt(formData.day_of_week),
        start_time: formData.start_time,
        end_time: formData.end_time,
        color: formData.color,
      })
      .eq("id", editingSchedule.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update class schedule",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Class schedule updated successfully",
      })
      resetForm()
      setIsEditOpen(false)
      setEditingSchedule(null)
      fetchSchedules()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    const { error } = await supabase.from("class_schedules").delete().eq("id", deleteId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete class schedule",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Class schedule deleted successfully",
      })
      fetchSchedules()
    }
    setDeleteId(null)
  }

  const openEditDialog = (schedule: ClassSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      course_name: schedule.course_name,
      course_code: schedule.course_code || "",
      instructor: schedule.instructor || "",
      location: schedule.location || "",
      day_of_week: schedule.day_of_week.toString(),
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      color: schedule.color,
    })
    setIsEditOpen(true)
  }

  const groupedSchedules = schedules.reduce(
    (acc, schedule) => {
      const day = schedule.day_of_week
      if (!acc[day]) acc[day] = []
      acc[day].push(schedule)
      return acc
    },
    {} as Record<number, ClassSchedule[]>,
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading schedules...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Class Schedule
              </CardTitle>
              <CardDescription>Manage your course schedule and get notifications before each class</CardDescription>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Class Schedule</DialogTitle>
                  <DialogDescription>Add a new class to your schedule</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course_name">
                        Course Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="course_name"
                        placeholder="Introduction to Computer Science"
                        value={formData.course_name}
                        onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course_code">Course Code</Label>
                      <Input
                        id="course_code"
                        placeholder="CS101"
                        value={formData.course_code}
                        onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      placeholder="Dr. Smith"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Room 301, Building A"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="day_of_week">
                      Day of Week <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.day_of_week}
                      onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">
                        Start Time <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">
                        End Time <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`h-8 w-8 rounded-full border-2 ${formData.color === color ? "border-foreground" : "border-transparent"}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd}>Add Class</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No classes scheduled yet</p>
              <p className="text-sm">Add your first class to get started with schedule management</p>
            </div>
          ) : (
            <div className="space-y-6">
              {DAYS_OF_WEEK.map((day, dayIndex) => {
                const daySchedules = groupedSchedules[dayIndex] || []
                if (daySchedules.length === 0) return null

                return (
                  <div key={dayIndex}>
                    <h3 className="mb-3 text-lg font-semibold">{day}</h3>
                    <div className="space-y-3">
                      {daySchedules.map((schedule) => (
                        <Card key={schedule.id} className="border-l-4" style={{ borderLeftColor: schedule.color }}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{schedule.course_name}</h4>
                                  {schedule.course_code && (
                                    <Badge variant="secondary" className="text-xs">
                                      {schedule.course_code}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {schedule.start_time} - {schedule.end_time}
                                  </div>
                                  {schedule.instructor && (
                                    <div className="flex items-center gap-1">
                                      <User className="h-4 w-4" />
                                      {schedule.instructor}
                                    </div>
                                  )}
                                  {schedule.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {schedule.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(schedule)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(schedule.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Class Schedule</DialogTitle>
            <DialogDescription>Update your class information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_course_name">
                  Course Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit_course_name"
                  placeholder="Introduction to Computer Science"
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_course_code">Course Code</Label>
                <Input
                  id="edit_course_code"
                  placeholder="CS101"
                  value={formData.course_code}
                  onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_instructor">Instructor</Label>
              <Input
                id="edit_instructor"
                placeholder="Dr. Smith"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_location">Location</Label>
              <Input
                id="edit_location"
                placeholder="Room 301, Building A"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_day_of_week">
                Day of Week <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.day_of_week}
                onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_start_time">
                  Start Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit_start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_end_time">
                  End Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit_end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 ${formData.color === color ? "border-foreground" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this class from your schedule. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
