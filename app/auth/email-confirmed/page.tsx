"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, ArrowRight, Mail, Sparkles } from "lucide-react"

export default function EmailConfirmedPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || "your email"
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Auto-redirect after 5 seconds if user doesn't click
    const timer = setTimeout(() => {
      // Optional: auto-redirect logic can be added here
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 px-4">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="w-full max-w-md shadow-2xl border-2 border-green-500/20">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 animate-in zoom-in duration-500 delay-150 shadow-lg">
              <CheckCircle2 className="h-12 w-12 text-white animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              Email Confirmed!
            </CardTitle>
            <CardDescription className="text-base animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
              Your account is now active and ready to use
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 p-6 border-2 border-green-500/20 animate-in fade-in scale-in duration-500 delay-700">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-foreground">Verified Email</p>
              </div>
              <p className="text-sm text-muted-foreground break-all">{email}</p>
            </div>

            <Alert className="border-blue-500/30 bg-blue-500/5 animate-in slide-in-from-left duration-500 delay-1000">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-foreground">
                <strong>You're all set!</strong> Sign in to start managing your tasks, building habits, and achieving
                your academic goals.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-muted-foreground animate-in fade-in duration-500 delay-1000">
              <p className="font-medium text-foreground">What you can do now:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Create and manage your tasks
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Add your class schedule
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Track your productivity streaks
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  View analytics and reports
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Link href="/auth/signin" className="w-full">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-green-500 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                Go to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              This page will redirect automatically in a few seconds
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
