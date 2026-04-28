import { ApplicationStage } from "@prisma/client";
import { Briefcase, Plus } from "lucide-react";
import Link from "next/link";

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

type StageMeta = {
  dot: string;
  bar: string;
  caption: string;
};

const STAGE_META: Record<ApplicationStage, StageMeta> = {
  [ApplicationStage.PREPARING]: {
    dot: "bg-zinc-300",
    bar: "bg-zinc-200",
    caption: "Drafting tailored materials",
  },
  [ApplicationStage.APPLIED]: {
    dot: "bg-zinc-400",
    bar: "bg-zinc-300",
    caption: "Submitted, awaiting response",
  },
  [ApplicationStage.COMMUNICATING]: {
    dot: "bg-zinc-500",
    bar: "bg-zinc-400",
    caption: "Recruiter or hiring-manager outreach",
  },
  [ApplicationStage.INTERVIEWING]: {
    dot: "bg-zinc-700",
    bar: "bg-zinc-600",
    caption: "Active interview loops",
  },
  [ApplicationStage.OFFER]: {
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    caption: "Offer in hand",
  },
  [ApplicationStage.ARCHIVED]: {
    dot: "bg-zinc-300",
    bar: "bg-zinc-200",
    caption: "Closed — no longer active",
  },
};

const PIPELINE_STAGES: ApplicationStage[] = [
  ApplicationStage.PREPARING,
  ApplicationStage.APPLIED,
  ApplicationStage.COMMUNICATING,
  ApplicationStage.INTERVIEWING,
  ApplicationStage.OFFER,
];

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

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your application pipeline at a glance."
        action={{
          href: "/applications/new",
          icon: Plus,
          label: "New Application",
        }}
      />

      <PipelineRibbon
        total={stats.total}
        active={activePipeline}
        interviewing={stats.interviewing}
        offers={stats.offer}
        grouped={groupedApplications}
      />

      <section aria-labelledby="pipeline-heading" className="mt-10">
        <header className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2
              id="pipeline-heading"
              className="text-base font-medium text-foreground"
            >
              Pipeline
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Applications grouped by stage. Update the stage on any card to
              move it.
            </p>
          </div>
        </header>

        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {APPLICATION_STAGE_ORDER.map((stage) => {
            const apps = groupedApplications[stage];
            return apps.length > 0 ? (
              <StageSection
                key={stage}
                stage={stage}
                apps={apps}
                stageOptions={stageOptions}
              />
            ) : (
              <EmptyStageRow key={stage} stage={stage} />
            );
          })}
        </div>
      </section>
    </>
  );
}

/* ---------------- Pipeline Ribbon ---------------- */

function PipelineRibbon({
  total,
  active,
  interviewing,
  offers,
  grouped,
}: {
  total: number;
  active: number;
  interviewing: number;
  offers: number;
  grouped: Record<ApplicationStage, ApplicationListItem[]>;
}) {
  const segments = PIPELINE_STAGES.map((stage) => ({
    stage,
    count: grouped[stage].length,
    label: getApplicationStageLabel(stage),
    meta: STAGE_META[stage],
  }));

  const visibleSegments = segments.filter((s) => s.count > 0);
  const segmentTotal = visibleSegments.reduce((sum, s) => sum + s.count, 0);

  return (
    <section
      aria-label="Pipeline overview"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="grid gap-y-8 px-6 py-7 sm:grid-cols-[auto_1fr] sm:gap-x-12 sm:px-8 sm:py-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Pipeline
          </p>
          <div className="mt-1.5 flex items-baseline gap-2.5">
            <span className="text-[44px] font-semibold leading-none tracking-tight text-foreground tabular-nums">
              {total}
            </span>
            <span className="text-sm text-muted-foreground">
              {total === 1 ? "application tracked" : "applications tracked"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-10 gap-y-5 sm:justify-end">
          <RibbonStat label="Active" value={active} hint="in progress" />
          <RibbonStat
            label="Interviewing"
            value={interviewing}
            hint="this stage"
          />
          <RibbonStat
            label="Offers"
            value={offers}
            hint="received"
            accent="emerald"
          />
        </div>
      </div>

      <div
        className="flex h-1.5 w-full overflow-hidden border-t border-border bg-secondary/50"
        role="img"
        aria-label={`Stage distribution: ${visibleSegments
          .map((s) => `${s.count} ${s.label}`)
          .join(", ")}`}
      >
        {segmentTotal === 0 ? (
          <div className="h-full w-full" />
        ) : (
          visibleSegments.map((s) => (
            <div
              key={s.stage}
              className={cn("h-full", s.meta.bar)}
              style={{ flexGrow: s.count }}
              title={`${s.label}: ${s.count}`}
            />
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border bg-secondary/20 px-6 py-3.5 sm:px-8">
        {segments.map((s) => (
          <span
            key={s.stage}
            className="flex items-center gap-2 text-xs"
            aria-label={`${s.label}: ${s.count}`}
          >
            <span
              aria-hidden="true"
              className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.meta.dot)}
            />
            <span className="font-medium tabular-nums text-foreground">
              {s.count}
            </span>
            <span className="text-muted-foreground">{s.label}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

function RibbonStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  accent?: "emerald";
}) {
  return (
    <div className="min-w-[6rem]">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-2xl font-semibold leading-none tracking-tight tabular-nums",
            accent === "emerald" ? "text-emerald-600" : "text-foreground"
          )}
        >
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
    </div>
  );
}

/* ---------------- Stage Section (non-empty) ---------------- */

function StageSection({
  stage,
  apps,
  stageOptions,
}: {
  stage: ApplicationStage;
  apps: ApplicationListItem[];
  stageOptions: ReturnType<typeof getApplicationStageOptions>;
}) {
  const meta = STAGE_META[stage];
  const label = getApplicationStageLabel(stage);

  return (
    <section
      aria-labelledby={`stage-${stage}`}
      className="grid gap-x-10 gap-y-5 px-6 py-6 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)]"
    >
      <header className="flex items-start gap-3 lg:flex-col lg:gap-3 lg:pt-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn("h-1.5 w-1.5 shrink-0 rounded-full", meta.dot)}
          />
          <h3
            id={`stage-${stage}`}
            className="text-sm font-medium tracking-tight text-foreground"
          >
            {label}
          </h3>
          <span className="text-xs font-normal tabular-nums text-muted-foreground">
            {apps.length}
          </span>
        </div>
        <p className="hidden text-xs leading-relaxed text-muted-foreground lg:block">
          {meta.caption}
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {apps.map((application) => (
          <li key={application.id}>
            <ApplicationCard
              application={application}
              stageOptions={stageOptions}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Empty Stage Row ---------------- */

function EmptyStageRow({ stage }: { stage: ApplicationStage }) {
  const meta = STAGE_META[stage];
  const label = getApplicationStageLabel(stage);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-6 py-3.5 sm:px-8">
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full opacity-70", meta.dot)}
      />
      <span className="text-sm font-medium text-foreground/70">{label}</span>
      <span className="text-xs text-muted-foreground">{meta.caption}</span>
      <span className="ml-auto text-[11px] uppercase tracking-wider text-muted-foreground/70">
        Empty
      </span>
    </div>
  );
}

/* ---------------- Application Card ---------------- */

function ApplicationCard({
  application,
  stageOptions,
}: {
  application: ApplicationListItem;
  stageOptions: ReturnType<typeof getApplicationStageOptions>;
}) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-border bg-background p-4 transition hover:border-foreground/25 hover:shadow-sm">
      <Link
        href={`/applications/${application.id}`}
        className="block focus:outline-none"
      >
        <p className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {application.companyName}
        </p>
        <h4 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-foreground">
          {application.roleTitle}
        </h4>
      </Link>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {application.location && (
          <>
            <span className="truncate">{application.location}</span>
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
          </>
        )}
        <span className="shrink-0">
          {formatRelativeDate(application.updatedAt)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-end border-t border-border/80 pt-2.5">
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
