import type { ApplicationStage } from "@prisma/client";
import {
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Plus,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { AppCard } from "@/components/app/AppCard";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { ApplicationStageSelect } from "@/components/applications/ApplicationStageSelect";
import {
  APPLICATION_STAGE_ORDER,
  getApplicationDashboardStats,
  getApplicationStageLabel,
  getApplicationStageOptions,
  groupApplicationsByStage,
} from "@/src/lib/applications/stages";
import { listUserApplications } from "@/src/lib/applications/service";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import type {
  ApplicationListItem,
} from "@/src/lib/db/applications";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function DashboardPage() {
  const userId = await requireCurrentUserId();
  const applications = await listUserApplications(userId);
  const groupedApplications = groupApplicationsByStage(applications);
  const stats = getApplicationDashboardStats(applications);
  const stageOptions = getApplicationStageOptions();

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

  const statCards = [
    {
      icon: Briefcase,
      label: "Total applications",
      value: stats.total,
    },
    {
      icon: CheckCircle2,
      label: "Applied",
      value: stats.applied,
    },
    {
      icon: MessageCircle,
      label: "Communicating",
      value: stats.communicating,
    },
    {
      icon: Clock3,
      label: "Interviewing",
      value: stats.interviewing,
    },
    {
      icon: Trophy,
      label: "Offer",
      value: stats.offer,
    },
  ];

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

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat) => (
          <AppCard key={stat.label} padding="sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </AppCard>
        ))}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[78rem] grid-cols-6 gap-4">
          {APPLICATION_STAGE_ORDER.map((stage) => (
            <DashboardColumn
              key={stage}
              applications={groupedApplications[stage]}
              stage={stage}
              stageOptions={stageOptions}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function DashboardColumn({
  applications,
  stage,
  stageOptions,
}: {
  applications: ApplicationListItem[];
  stage: ApplicationStage;
  stageOptions: ReturnType<typeof getApplicationStageOptions>;
}) {
  return (
    <section className="rounded-2xl border border-border bg-secondary/20 p-3">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 className="text-sm font-medium text-foreground">
          {getApplicationStageLabel(stage)}
        </h2>
        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {applications.length}
        </span>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((application) => (
            <DashboardApplicationCard
              key={application.id}
              application={application}
              stageOptions={stageOptions}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-background/70 p-4 text-center text-xs leading-5 text-muted-foreground">
          No applications in this stage.
        </div>
      )}
    </section>
  );
}

function DashboardApplicationCard({
  application,
  stageOptions,
}: {
  application: ApplicationListItem;
  stageOptions: ReturnType<typeof getApplicationStageOptions>;
}) {
  return (
    <AppCard padding="none" className="rounded-xl">
      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <Link
            href={`/applications/${application.id}`}
            className="block text-sm font-medium text-foreground transition hover:text-muted-foreground"
          >
            {application.companyName}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {application.roleTitle}
          </p>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          {application.location && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="truncate">{application.location}</span>
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            Updated {formatDate(application.updatedAt)}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-secondary/20 p-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Current stage</span>
            <span className="truncate text-xs font-medium text-foreground">
              {getApplicationStageLabel(application.stage)}
            </span>
          </div>
          <ApplicationStageSelect
            applicationId={application.id}
            currentStage={application.stage}
            label={`Update stage for ${application.companyName} ${application.roleTitle}`}
            options={stageOptions}
          />
        </div>
      </div>
    </AppCard>
  );
}
