import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  FileText,
  MessageSquare,
  PenLine,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const quickActions = [
  {
    icon: Upload,
    title: "Upload Resume",
    description: "Parse and analyze your resume",
    href: "/resumes",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Target,
    title: "Match JD",
    description: "Compare with job descriptions",
    href: "/applications",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: PenLine,
    title: "Rewrite Bullets",
    description: "Improve resume statements",
    href: "/resumes",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    description: "Practice with AI coach",
    href: "/interviews",
    color: "bg-violet-500/10 text-violet-600",
  },
];

const recentActivity = [
  {
    type: "resume",
    title: "Resume updated",
    description: "Product Designer Resume v3",
    time: "2 hours ago",
    icon: FileText,
  },
  {
    type: "application",
    title: "Applied to Acme Inc",
    description: "Senior Product Designer",
    time: "5 hours ago",
    icon: Briefcase,
  },
  {
    type: "interview",
    title: "Interview scheduled",
    description: "Figma - Design Lead",
    time: "1 day ago",
    icon: Calendar,
  },
  {
    type: "match",
    title: "New JD match found",
    description: "92% match with Linear",
    time: "2 days ago",
    icon: Target,
  },
];

const stats = [
  { label: "Active Applications", value: "12", change: "+3 this week", trend: "up" },
  { label: "Interview Rate", value: "42%", change: "+8% vs last month", trend: "up" },
  { label: "Resume Score", value: "86", change: "Above average", trend: "up" },
  { label: "JDs Analyzed", value: "28", change: "5 this week", trend: "neutral" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">AI Workspace</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your job search
          </p>
        </div>
        <Button asChild className="h-10 gap-2 rounded-full px-5">
          <Link href="/applications">
            <Plus className="h-4 w-4" />
            New Application
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-5 w-5 text-primary" />
                ) : (
                  <BarChart3 className="h-5 w-5 text-primary" />
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <Link
            href="/resumes"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-sm font-medium text-foreground group-hover:text-primary">
                {action.title}
              </h3>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Activity */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <div className="rounded-2xl border border-border bg-card">
            <div className="divide-y divide-border">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resume Score Card */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Resume Health</h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="relative h-20 w-20">
                <svg
                  className="h-20 w-20 -rotate-90"
                  viewBox="0 0 36 36"
                  aria-label="Resume score: 86 out of 100"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-secondary"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="86, 100"
                    strokeWidth="3"
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-foreground">86</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Overall Score</p>
                <p className="text-xs text-muted-foreground">Product Designer Resume v3</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Keyword Coverage</span>
                  <span className="text-xs font-medium text-foreground">78%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-[78%] rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Impact Statements</span>
                  <span className="text-xs font-medium text-foreground">92%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-[92%] rounded-full bg-emerald-500" />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">ATS Compatibility</span>
                  <span className="text-xs font-medium text-foreground">88%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-[88%] rounded-full bg-primary" />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link href="/resumes">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Improve Score
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
