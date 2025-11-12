"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target, Loader2, CheckCircle2, Mail, AlertCircle, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number"
    }
    return null
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (nickname.trim().length < 2) {
      setError("Nickname must be at least 2 characters long")
      setLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/email-confirmed`,
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-8">
        <div className="animate-in fade-in zoom-in duration-700">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 animate-in zoom-in duration-500 delay-150">
                <CheckCircle2 className="h-10 w-10 text-white animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-bold animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                Check Your Email
              </CardTitle>
              <CardDescription className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
                We've sent you a confirmation link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center border-2 border-primary/20 animate-in fade-in scale-in duration-500 delay-700">
                <Mail className="mx-auto mb-3 h-12 w-12 text-primary animate-float" />
                <p className="text-sm text-muted-foreground">
                  We sent a confirmation email to <strong className="text-foreground block mt-1">{email}</strong>
                </p>
              </div>
              <Alert className="animate-in slide-in-from-left duration-500 delay-1000">
                <AlertDescription className="text-sm">
                  <strong>Important:</strong> Click the confirmation link in your email to activate your account. The
                  link will redirect you back to Daily Grind where you can sign in.
                </AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm text-muted-foreground animate-in fade-in duration-500 delay-1000">
                <p>• Check your spam folder if you don't see the email</p>
                <p>• The confirmation link expires in 24 hours</p>
                <p>• After confirming, return here to sign in</p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/auth/signin" className="w-full">
                <Button variant="outline" className="w-full bg-transparent transition-all hover:scale-105">
                  Go to Sign In
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary animate-in zoom-in duration-500">
              <Target className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription>Start your productivity journey with Daily Grind</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-shake">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="How should we call you?"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-all focus:scale-[1.01] focus:shadow-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-all focus:scale-[1.01] focus:shadow-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10 transition-all focus:scale-[1.01] focus:shadow-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with 1 uppercase letter and 1 number
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10 transition-all focus:scale-[1.01] focus:shadow-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-6 flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/signin" className="font-medium text-primary hover:underline transition-all">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
