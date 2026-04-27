import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import {
  AppCard,
  AppCardContent,
  AppCardHeader,
} from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";

const stats = [
  {
    label: "Active Applications",
    value: "12",
    change: "+3 this week",
    trend: "up",
    icon: Briefcase,
  },
  {
    label: "Interview Scheduled",
    value: "4",
    change: "2 this week",
    trend: "up",
    icon: Clock,
  },
  {
    label: "Resume Score",
    value: "86%",
    change: "+5% improved",
    trend: "up",
    icon: Target,
  },
  {
    label: "Response Rate",
    value: "32%",
    change: "Above average",
    trend: "up",
    icon: TrendingUp,
  },
];

const recentApplications = [
  {
    company: "Acme Corp",
    role: "Senior Product Designer",
    status: "Interview",
    statusColor: "bg-green-500",
    date: "2 days ago",
  },
  {
    company: "Notion",
    role: "UX Researcher",
    status: "Applied",
    statusColor: "bg-blue-500",
    date: "3 days ago",
  },
  {
    company: "Linear",
    role: "Design Lead",
    status: "Reviewing",
    statusColor: "bg-yellow-500",
    date: "5 days ago",
  },
  {
    company: "Figma",
    role: "Product Designer",
    status: "Wishlist",
    statusColor: "bg-muted-foreground",
    date: "1 week ago",
  },
];

const quickActions = [
  {
    icon: FileText,
    label: "Upload Resume",
    description: "Parse and analyze your resume",
    href: "/resumes",
  },
  {
    icon: Sparkles,
    label: "JD Extract",
    description: "Analyze a job description",
    href: "/jd-extract",
  },
  {
    icon: Plus,
    label: "New Application",
    description: "Track a new job application",
    href: "/applications",
  },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Welcome back, John"
        description="Here&apos;s what&apos;s happening with your job search."
        action={{
          label: "New Application",
          icon: Plus,
          href: "/applications",
        }}
      />

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <AppCard key={stat.label} hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {stat.trend === "up" && (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  )}
                  {stat.change}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </AppCard>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <AppCard padding="none">
            <AppCardHeader
              title="Recent Applications"
              description="Your latest job applications"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-1 text-xs"
                >
                  <Link href="/applications">
                    View all
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </Button>
              }
              className="px-5 pt-5 sm:px-6 sm:pt-6"
            />
            <AppCardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={`${app.company}-${app.role}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 p-3 transition-colors hover:bg-secondary/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <span className="text-sm font-semibold text-primary">
                          {app.company.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {app.company}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {app.date}
                      </span>
                      <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1">
                        <div
                          className={`h-2 w-2 rounded-full ${app.statusColor}`}
                        />
                        <span className="text-xs font-medium text-foreground">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AppCardContent>
          </AppCard>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <AppCard padding="none">
            <AppCardHeader
              title="Quick Actions"
              className="px-5 pt-5 sm:px-6 sm:pt-6"
            />
            <AppCardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3 transition-colors hover:bg-secondary/40"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {action.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </AppCardContent>
          </AppCard>

          {/* Weekly Progress */}
          <AppCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">
                Weekly Progress
              </h3>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Applications sent
                  </span>
                  <span className="font-medium text-foreground">7/10</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-[70%] rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Resume improvements
                  </span>
                  <span className="font-medium text-foreground">3/5</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-[60%] rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Interview prep
                  </span>
                  <span className="font-medium text-foreground">2/3</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-[66%] rounded-full bg-primary" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">
                On track to hit weekly goals
              </span>
            </div>
          </AppCard>
        </div>
      </div>
    </>
  );
}
