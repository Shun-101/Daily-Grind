"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Target, LayoutDashboard, Calendar, Clock, TrendingUp, FileText, LogOut, Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEffect, useState } from "react"
import type { Notification } from "@/lib/types"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DashboardNavProps {
  nickname: string
  unreadCount?: number
}

export function DashboardNav({ nickname, unreadCount = 0 }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        setError("Failed to fetch notifications")
        console.error("Notification fetch error:", error)
      } else {
        setNotifications(data || [])
      }
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    { href: "/dashboard/schedule", label: "Schedule", icon: Clock },
    { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/dashboard/reports", label: "Reports", icon: FileText },
  ]

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Daily Grind</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2 transition-all hover:scale-105"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 transition-all hover:scale-110">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs animate-pulse"
                    variant="destructive"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="border-b p-4">
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
              <ScrollArea className="h-[300px]">
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : error ? (
                  <div className="p-4 text-center text-sm text-destructive">{error}</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {notifications.map((notification) => {
                      const isOverdue = notification.type === "task_due"
                      const isDueSoon = notification.type === "task_reminder"
                      const isDeadlineDetected = notification.deadline && new Date(notification.deadline) < new Date()

                      return (
                        <div
                          key={notification.id}
                          className={`rounded-lg p-3 transition-colors hover:bg-muted ${!notification.read ? "bg-muted/50" : ""} ${isOverdue ? "border-l-4 border-destructive" : isDueSoon ? "border-l-4 border-amber-500" : isDeadlineDetected ? "border-l-4 border-red-500" : ""}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{notification.title}</p>
                                {!notification.read && (
                                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(notification.created_at), "MMM dd, h:mm a")}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs whitespace-nowrap">
                                  Overdue
                                </Badge>
                              )}
                              {isDueSoon && (
                                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                  Due Soon
                                </Badge>
                              )}
                              {isDeadlineDetected && (
                                <Badge variant="warning" className="text-xs whitespace-nowrap">
                                  Deadline Missed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
              <div className="border-t p-2">
                <Link href="/dashboard/notifications" className="block">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </Link>
              </div>
            </PopoverContent>
          </Popover>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
                {nickname || "User"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
