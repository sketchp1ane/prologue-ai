import { Briefcase, Database, Plus } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { ApplicationBoard } from "@/components/applications/ApplicationBoard";
import { getApplicationDashboardStats } from "@/src/lib/applications/stages";
import { listUserApplications } from "@/src/lib/applications/service";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { isPrismaClientInitializationError } from "@/src/lib/db/errors";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";
import { cn } from "@/src/lib/utils";

async function loadDashboardApplications(userId: string) {
  try {
    return {
      applications: await listUserApplications(userId),
      status: "ready" as const,
    };
  } catch (error) {
    if (isPrismaClientInitializationError(error)) {
      return {
        applications: [],
        status: "database-unavailable" as const,
      };
    }

    throw error;
  }
}

export default async function DashboardPage() {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const dashboardData = await loadDashboardApplications(userId);
  const { applications } = dashboardData;
  const stats = getApplicationDashboardStats(applications);

  if (dashboardData.status === "database-unavailable") {
    return (
      <>
        <PageHeader
          title={dictionary.workspace.dashboard.title}
          description={dictionary.workspace.dashboard.unavailableDescription}
          action={{
            href: "/applications/new",
            icon: Plus,
            label: dictionary.appShell.actions.newApplication,
          }}
        />
        <EmptyState
          icon={Database}
          title={dictionary.workspace.dashboard.databaseUnavailableTitle}
          description={dictionary.workspace.dashboard.databaseUnavailableDescription}
          secondaryAction={{
            href: "/dashboard",
            label: dictionary.workspace.dashboard.retryDashboard,
          }}
          statusLabel={dictionary.workspace.dashboard.databaseStatus}
        />
      </>
    );
  }

  if (applications.length === 0) {
    return (
      <>
        <PageHeader
          title={dictionary.workspace.dashboard.title}
          description={dictionary.workspace.dashboard.unavailableDescription}
          action={{
            href: "/applications/new",
            icon: Plus,
            label: dictionary.appShell.actions.newApplication,
          }}
        />
        <EmptyState
          icon={Briefcase}
          title={dictionary.workspace.dashboard.emptyTitle}
          description={dictionary.workspace.dashboard.emptyDescription}
          action={{
            href: "/applications/new",
            icon: Plus,
            label: dictionary.appShell.actions.createApplication,
          }}
        />
      </>
    );
  }

  const activePipeline =
    stats.applied + stats.communicating + stats.interviewing;

  const summaryStats = [
    {
      label: dictionary.workspace.dashboard.stats.total,
      value: stats.total,
      hint: dictionary.workspace.dashboard.stats.applications,
    },
    {
      label: dictionary.workspace.dashboard.stats.activePipeline,
      value: activePipeline,
      hint: dictionary.workspace.dashboard.stats.inProgress,
    },
    {
      label: dictionary.workspace.dashboard.stats.interviewing,
      value: stats.interviewing,
      hint: dictionary.workspace.dashboard.stats.thisStage,
    },
    {
      label: dictionary.workspace.dashboard.stats.offers,
      value: stats.offer,
      hint: dictionary.workspace.dashboard.stats.received,
    },
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
        title={dictionary.workspace.dashboard.title}
        description={dictionary.workspace.dashboard.description}
        action={{
          href: "/applications/new",
          icon: Plus,
          label: dictionary.appShell.actions.newApplication,
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
            {dictionary.workspace.dashboard.boardTitle}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {dictionary.workspace.dashboard.boardDescription}
          </p>
        </div>
      </div>

      <ApplicationBoard
        key={boardKey}
        applications={boardApplications}
        dictionary={dictionary}
        locale={locale}
        stageLabels={dictionary.applicationStages}
      />
    </>
  );
}
