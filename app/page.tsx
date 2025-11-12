"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Calendar, Clock, Target, Zap, Flame, BarChart3 } from "lucide-react"
import { useEffect, useRef } from "react"

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in", "fade-in", "slide-in-from-bottom-4")
            entry.target.classList.add("duration-700")
          }
        })
      },
      { threshold: 0.1 },
    )

    const featureCards = document.querySelectorAll(".feature-card")
    featureCards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-300">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Daily Grind</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" className="transition-all hover:scale-105">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-primary to-primary/80 transition-all hover:scale-105 hover:shadow-lg">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <section ref={heroRef} className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mx-auto mb-8 h-64 w-full max-w-2xl overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 to-primary/5 shadow-2xl transition-transform hover:scale-[1.02] duration-500">
            <Image
              src="/student-studying-with-laptop-and-books-productivit.jpg"
              alt="Student productivity workspace"
              width={800}
              height={400}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Master Your Time,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-pulse">
              Ace Your Goals
            </span>
          </h1>
          <p className="text-pretty text-xl text-muted-foreground sm:text-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            Daily Grind is the ultimate productivity tool designed specifically for students. Track tasks, manage your
            schedule, build habits, and watch your academic performance soar.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary/80 sm:w-auto transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              >
                Start Your Journey
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need to Succeed</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed to help students stay organized and productive
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: CheckCircle2,
              color: "green",
              title: "Task Management",
              description:
                "Organize assignments, projects, and to-dos with priority levels and due dates. Never miss a deadline again.",
            },
            {
              icon: Calendar,
              color: "blue",
              title: "Smart Calendar",
              description:
                "View your schedule in weekly or monthly formats. Sync your class schedule and get timely reminders.",
            },
            {
              icon: Clock,
              color: "purple",
              title: "Class Schedule",
              description:
                "Add your course schedule and receive notifications before each class. Stay on top of your academic commitments.",
            },
            {
              icon: Flame,
              color: "orange",
              title: "Streak Tracking",
              description:
                "Build productive habits and maintain your streak. Gamification makes productivity fun and engaging.",
            },
            {
              icon: BarChart3,
              color: "indigo",
              title: "Analytics Dashboard",
              description:
                "Visualize your productivity with interactive charts and reports. Track your progress over time.",
            },
            {
              icon: Target,
              color: "pink",
              title: "Printable Reports",
              description:
                "Generate professional reports of your tasks and schedules. Perfect for planning and reflection.",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="feature-card opacity-0 transition-all hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-6">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-${feature.color}-500/10 transition-transform hover:scale-110 hover:rotate-12 duration-300`}
                >
                  <feature.icon className={`h-6 w-6 text-${feature.color}-500`} />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="overflow-hidden">
            <div className="h-48 w-full bg-gradient-to-br from-green-500/20 to-green-500/5">
              <Image
                src="/student-completing-tasks-checklist-success.jpg"
                alt="Task completion"
                width={400}
                height={300}
                className="h-full w-full object-cover opacity-80"
              />
            </div>
            <CardContent className="pt-6">
              <h3 className="mb-2 text-2xl font-bold">Stay Organized</h3>
              <p className="text-muted-foreground">Keep all your assignments, deadlines, and schedules in one place</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="h-48 w-full bg-gradient-to-br from-blue-500/20 to-blue-500/5">
              <Image
                src="/analytics-charts-graphs-productivity-metrics.jpg"
                alt="Analytics and insights"
                width={400}
                height={300}
                className="h-full w-full object-cover opacity-80"
              />
            </div>
            <CardContent className="pt-6">
              <h3 className="mb-2 text-2xl font-bold">Track Progress</h3>
              <p className="text-muted-foreground">Visualize your productivity with beautiful charts and insights</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="h-48 w-full bg-gradient-to-br from-purple-500/20 to-purple-500/5">
              <Image
                src="/student-celebrating-achievement-success-streak.jpg"
                alt="Achievement and streaks"
                width={400}
                height={300}
                className="h-full w-full object-cover opacity-80"
              />
            </div>
            <CardContent className="pt-6">
              <h3 className="mb-2 text-2xl font-bold">Build Habits</h3>
              <p className="text-muted-foreground">Develop consistent study habits with streak tracking and rewards</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-2xl animate-in fade-in zoom-in duration-700 hover:scale-[1.01] transition-transform">
          <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
            <div className="rounded-full bg-white/10 p-4 animate-pulse">
              <Zap className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to Transform Your Productivity?
            </h2>
            <p className="max-w-2xl text-lg text-primary-foreground/90 sm:text-xl">
              Join thousands of students who are already using Daily Grind to achieve their academic goals.
            </p>
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg transition-all hover:scale-110 hover:shadow-2xl active:scale-95"
              >
                Get Started Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">Daily Grind</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              &copy; 2025 Daily Grind. A tool for enhancing student time management and academic productivity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
