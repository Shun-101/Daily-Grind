"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Server, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>We've sent you a confirmation link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              A confirmation email has been sent to your inbox. Click the link in the email to verify your account.
            </AlertDescription>
          </Alert>

          <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
            <Server className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-semibold">Important for Development:</p>
              <p className="text-sm">
                Make sure your development server is running on{" "}
                <code className="bg-muted px-1 py-0.5 rounded">localhost:3000</code> before clicking the confirmation
                link in your email.
              </p>
              <p className="text-sm">
                If you see a "connection refused" error, start your dev server first, then click the email link again.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>After clicking the confirmation link, you'll be redirected to your dashboard.</p>
            <p>Didn't receive the email? Check your spam folder.</p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Link href="/auth/signin" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
