import { Briefcase, Plus } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { ApplicationBoard } from "@/components/applications/ApplicationBoard";
import { getApplicationDashboardStats } from "@/src/lib/applications/stages";
import { listUserApplications } from "@/src/lib/applications/service";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { cn } from "@/src/lib/utils";

export default async function DashboardPage() {
  const userId = await requireCurrentUserId();
  const applications = await listUserApplications(userId);
  const stats = getApplicationDashboardStats(applications);

  if (applications.length === 0) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Track each application from first paste to final outcome."
          action={{
            href: "/applications/new",
            icon: Plus,
            label: "New Application",
          }}
        />
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Paste a job description to create your first tracked application."
          action={{
            href: "/applications/new",
            icon: Plus,
            label: "Create application",
          }}
        />
      </>
    );
  }

  const activePipeline =
    stats.applied + stats.communicating + stats.interviewing;

  const summaryStats = [
    { label: "Total", value: stats.total, hint: "applications" },
    { label: "Active pipeline", value: activePipeline, hint: "in progress" },
    { label: "Interviewing", value: stats.interviewing, hint: "this stage" },
    { label: "Offers", value: stats.offer, hint: "received" },
  ];
  const boardApplications = applications.map((application) => ({
    companyName: application.companyName,
    id: application.id,
    location: application.location,
    roleTitle: application.roleTitle,
    stage: application.stage,
    updatedAt: application.updatedAt.toISOString(),
  }));
  const boardKey = boardApplications
    .map(
      (application) =>
        `${application.id}:${application.stage}:${application.updatedAt}`
    )
    .join("|");

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your current application board, grouped by stage."
        action={{
          href: "/applications/new",
          icon: Plus,
          label: "New Application",
        }}
      />

      <AppCard padding="none" className="mb-8 overflow-hidden">
        <div className="grid grid-cols-2 divide-y divide-border sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {summaryStats.map((stat, idx) => (
            <div
              key={stat.label}
              className={cn(
                "px-5 py-5 sm:px-6 sm:py-6",
                idx === 1 && "border-l border-border sm:border-l-0"
              )}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.hint}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AppCard>

      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-base font-medium text-foreground">
            Application board
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Move applications across stages as they progress.
          </p>
        </div>
      </div>

      <ApplicationBoard key={boardKey} applications={boardApplications} />
    </>
  );
}
