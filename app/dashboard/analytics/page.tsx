import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { AnalyticsView } from "@/components/analytics-view"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  let nickname = "User"

  if (profileError || !profile) {
    nickname = user.user_metadata?.nickname || user.email?.split("@")[0] || "User"

    // Create profile if it doesn't exist
    await supabase
      .from("profiles")
      .insert({
        id: user.id,
        nickname: nickname,
        email: user.email!,
      })
      .select()
  } else {
    nickname = profile.nickname || user.user_metadata?.nickname || user.email?.split("@")[0] || "User"

    // Update profile if nickname is still default but user has a nickname in metadata
    if (nickname === "User" && user.user_metadata?.nickname) {
      nickname = user.user_metadata.nickname
      await supabase.from("profiles").update({ nickname }).eq("id", user.id)
    }
  }

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav nickname={nickname} unreadCount={unreadCount || 0} />
      <AnalyticsView userId={user.id} />
    </div>
  )
}
