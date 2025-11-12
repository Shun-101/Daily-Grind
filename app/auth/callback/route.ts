import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/auth/email-confirmed"

  if (code) {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[v0] Error exchanging code for session:", error)
        return NextResponse.redirect(new URL(`/auth/signin?error=${encodeURIComponent(error.message)}`, request.url))
      }

      if (data.user) {
        const emailParam = encodeURIComponent(data.user.email || "")
        const redirectUrl = next.includes("?") ? `${next}&email=${emailParam}` : `${next}?email=${emailParam}`

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, nickname")
          .eq("id", data.user.id)
          .single()

        // If profile doesn't exist, create it
        if (profileError && profileError.code === "PGRST116") {
          const nickname = data.user.user_metadata?.nickname || data.user.email?.split("@")[0] || "User"

          const { error: insertError } = await supabase.from("profiles").insert({
            id: data.user.id,
            nickname: nickname,
            email: data.user.email!,
          })

          if (insertError) {
            console.error("[v0] Error creating profile:", insertError)
          }
        }
        // If profile exists but nickname is "User", update it with the correct nickname
        else if (profile && profile.nickname === "User" && data.user.user_metadata?.nickname) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ nickname: data.user.user_metadata.nickname })
            .eq("id", data.user.id)

          if (updateError) {
            console.error("[v0] Error updating profile nickname:", updateError)
          }
        }

        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    } catch (err) {
      console.error("[v0] Unexpected error in auth callback:", err)
      return NextResponse.redirect(new URL("/auth/signin?error=Authentication failed", request.url))
    }
  }

  return NextResponse.redirect(new URL("/auth/signin?error=No verification code provided", request.url))
}
