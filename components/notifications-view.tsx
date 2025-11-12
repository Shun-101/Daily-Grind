"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Bell, CheckCheck, Trash2 } from "lucide-react"
import type { Notification } from "@/lib/types"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface NotificationsViewProps {
  userId: string
}

export function NotificationsView({ userId }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  const fetchNotifications = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    setNotifications(data || [])
    setLoading(false)
  }

  const handleMarkAsRead = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)

    if (!error) {
      fetchNotifications()
    }
  }

  const handleMarkAllAsRead = async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)

    if (!error) {
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
      fetchNotifications()
    }
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("notifications").delete().eq("id", id)

    if (!error) {
      toast({
        title: "Success",
        description: "Notification deleted",
      })
      fetchNotifications()
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading notifications...</div>
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
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
              </CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark All as Read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No notifications yet</p>
              <p className="text-sm">You'll see updates and reminders here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 rounded-lg border p-4 ${!notification.read ? "bg-muted/50" : ""}`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{notification.title}</p>
                      {!notification.read && <Badge variant="default">New</Badge>}
                      <Badge variant="outline">{notification.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.created_at), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                        Mark as read
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(notification.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
