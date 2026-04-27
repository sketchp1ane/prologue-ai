import {
  Briefcase,
  Calendar,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";

const applications = [
  {
    id: 1,
    company: "Acme Corp",
    role: "Senior Product Designer",
    status: "Interview",
    statusColor: "bg-green-500",
    appliedDate: "Dec 15, 2024",
    nextStep: "Technical interview on Dec 20",
  },
  {
    id: 2,
    company: "Notion",
    role: "UX Researcher",
    status: "Applied",
    statusColor: "bg-blue-500",
    appliedDate: "Dec 12, 2024",
    nextStep: "Awaiting response",
  },
  {
    id: 3,
    company: "Linear",
    role: "Design Lead",
    status: "Reviewing",
    statusColor: "bg-yellow-500",
    appliedDate: "Dec 10, 2024",
    nextStep: "Application under review",
  },
  {
    id: 4,
    company: "Figma",
    role: "Product Designer",
    status: "Wishlist",
    statusColor: "bg-muted-foreground",
    appliedDate: "Dec 8, 2024",
    nextStep: "Prepare application materials",
  },
  {
    id: 5,
    company: "Stripe",
    role: "Senior UX Designer",
    status: "Interview",
    statusColor: "bg-green-500",
    appliedDate: "Dec 5, 2024",
    nextStep: "Final round scheduled",
  },
];

const statusFilters = ["All", "Wishlist", "Applied", "Reviewing", "Interview", "Offer", "Rejected"];

export default function ApplicationsPage() {
  return (
    <>
      <PageHeader
        title="Job Posts"
        description="Track and manage your job applications."
        action={{
          label: "New Application",
          icon: Plus,
        }}
      />

      {/* Filters Bar */}
      <AppCard className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search applications..."
              className="w-full rounded-xl border border-border bg-secondary/30 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {statusFilters.slice(0, 4).map((filter) => (
              <button
                key={filter}
                type="button"
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === "All"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Filter className="h-3 w-3" />
              More
            </button>
          </div>
        </div>
      </AppCard>

      {/* Applications List */}
      <div className="space-y-3">
        {applications.map((app) => (
          <AppCard key={app.id} hover padding="none">
            <div className="flex items-center gap-4 p-4 sm:p-5">
              {/* Company Avatar */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <span className="text-lg font-semibold text-primary">
                  {app.company.charAt(0)}
                </span>
              </div>

              {/* Main Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-foreground">{app.role}</h3>
                    <p className="text-sm text-muted-foreground">
                      {app.company}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1">
                      <div
                        className={`h-2 w-2 rounded-full ${app.statusColor}`}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {app.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Applied {app.appliedDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3" />
                    {app.nextStep}
                  </span>
                </div>
              </div>
            </div>
          </AppCard>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-6 flex justify-center">
        <Button variant="outline" className="rounded-xl">
          Load More Applications
        </Button>
      </div>
    </>
  );
}
