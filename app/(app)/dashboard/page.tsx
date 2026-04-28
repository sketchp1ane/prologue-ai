import { ApplicationStage } from "@prisma/client";
import { Briefcase, Plus } from "lucide-react";
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
import type { ApplicationListItem } from "@/src/lib/db/applications";
import { cn } from "@/src/lib/utils";

type StageTheme = {
  dot: string;
  accent: string;
  countBg: string;
};

const STAGE_THEME: Record<ApplicationStage, StageTheme> = {
  [ApplicationStage.PREPARING]: {
    dot: "bg-zinc-400",
    accent: "bg-zinc-300",
    countBg: "bg-zinc-100 text-zinc-700",
  },
  [ApplicationStage.APPLIED]: {
    dot: "bg-blue-500",
    accent: "bg-blue-400",
    countBg: "bg-blue-50 text-blue-700",
  },
  [ApplicationStage.COMMUNICATING]: {
    dot: "bg-amber-500",
    accent: "bg-amber-400",
    countBg: "bg-amber-50 text-amber-700",
  },
  [ApplicationStage.INTERVIEWING]: {
    dot: "bg-purple-500",
    accent: "bg-purple-400",
    countBg: "bg-purple-50 text-purple-700",
  },
  [ApplicationStage.OFFER]: {
    dot: "bg-emerald-500",
    accent: "bg-emerald-400",
    countBg: "bg-emerald-50 text-emerald-700",
  },
  [ApplicationStage.ARCHIVED]: {
    dot: "bg-zinc-300",
    accent: "bg-zinc-200",
    countBg: "bg-zinc-100 text-zinc-600",
  },
};

function formatRelativeDate(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
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

  const activePipeline =
    stats.applied + stats.communicating + stats.interviewing;

  const summaryStats = [
    { label: "Total", value: stats.total, hint: "applications" },
    { label: "Active pipeline", value: activePipeline, hint: "in progress" },
    { label: "Interviewing", value: stats.interviewing, hint: "this stage" },
    { label: "Offers", value: stats.offer, hint: "received" },
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

      <div className="-mx-2 overflow-x-auto px-2 pb-2">
        <div className="grid min-w-[78rem] grid-cols-6 gap-5">
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
  const theme = STAGE_THEME[stage];

  return (
    <section className="flex min-w-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-1 pb-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn("h-1.5 w-1.5 shrink-0 rounded-full", theme.dot)}
            aria-hidden="true"
          />
          <h3 className="truncate text-sm font-medium text-foreground">
            {getApplicationStageLabel(stage)}
          </h3>
        </div>
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
            theme.countBg
          )}
        >
          {applications.length}
        </span>
      </div>

      <div className={cn("mb-3 h-px w-full", theme.accent)} aria-hidden="true" />

      {applications.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {applications.map((application) => (
            <li key={application.id}>
              <DashboardApplicationCard
                application={application}
                stageOptions={stageOptions}
                theme={theme}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border/70 px-3 py-6 text-center text-[11px] leading-5 text-muted-foreground/80">
          Empty
        </div>
      )}
    </section>
  );
}

function DashboardApplicationCard({
  application,
  stageOptions,
  theme,
}: {
  application: ApplicationListItem;
  stageOptions: ReturnType<typeof getApplicationStageOptions>;
  theme: StageTheme;
}) {
  return (
    <article className="group relative rounded-xl border border-border bg-card p-3.5 shadow-sm transition hover:border-foreground/20 hover:shadow-md">
      <div className="space-y-0.5">
        <Link
          href={`/applications/${application.id}`}
          className="block text-sm font-medium leading-tight text-foreground transition hover:text-muted-foreground"
        >
          {application.companyName}
        </Link>
        <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">
          {application.roleTitle}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {application.location && (
          <>
            <span className="truncate">{application.location}</span>
            <span aria-hidden="true" className="text-muted-foreground/50">
              ·
            </span>
          </>
        )}
        <span className="shrink-0">
          Updated {formatRelativeDate(application.updatedAt)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3">
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", theme.dot)}
          aria-hidden="true"
        />
        <ApplicationStageSelect
          applicationId={application.id}
          currentStage={application.stage}
          label={`Update stage for ${application.companyName} ${application.roleTitle}`}
          options={stageOptions}
        />
      </div>
    </article>
  );
}
