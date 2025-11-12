import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  let nickname = "User"

  // If profile doesn't exist, create it
  if (profileError || !profile) {
    nickname = user.user_metadata?.nickname || user.email?.split("@")[0] || "User"

    await supabase.from("profiles").insert({
      id: user.id,
      nickname: nickname,
      email: user.email!,
    })

    console.log("[v0] Created profile with nickname:", nickname)
  } else {
    // Use nickname from profile, or fallback to user metadata if profile has default "User"
    nickname = profile.nickname

    // If profile has default "User" but user_metadata has a nickname, update it
    if (nickname === "User" && user.user_metadata?.nickname) {
      nickname = user.user_metadata.nickname

      await supabase.from("profiles").update({ nickname: nickname }).eq("id", user.id)

      console.log("[v0] Updated profile nickname to:", nickname)
    }
  }

  // Fetch unread notifications count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav nickname={nickname} unreadCount={unreadCount || 0} />
      <DashboardContent userId={user.id} nickname={nickname} />
    </div>
  )
}
