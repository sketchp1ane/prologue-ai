import Link from "next/link";
import { ArrowRight, Briefcase, Calendar, MapPin, Plus } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { listUserApplications } from "@/src/lib/applications/service";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function stageLabel(stage: string) {
  return stage
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function ApplicationsPage() {
  const userId = await requireCurrentUserId();
  const applications = await listUserApplications(userId);

  if (applications.length === 0) {
    return (
      <>
        <PageHeader
          title="Applications"
          description="Create applications from pasted job descriptions."
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
            label: "New Application",
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Applications"
        description="Create applications from pasted job descriptions."
        action={{
          href: "/applications/new",
          icon: Plus,
          label: "New Application",
        }}
      />

      <div className="space-y-3">
        {applications.map((application) => (
          <Link key={application.id} href={`/applications/${application.id}`}>
            <AppCard hover padding="none">
              <div className="flex items-center gap-4 p-4 sm:p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <span className="text-lg font-semibold text-primary">
                    {application.companyName.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate font-medium text-foreground">
                        {application.roleTitle}
                      </h2>
                      <p className="truncate text-sm text-muted-foreground">
                        {application.companyName}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                        {stageLabel(application.stage)}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      Updated {formatDate(application.updatedAt)}
                    </span>
                    {application.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {application.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </AppCard>
          </Link>
        ))}
      </div>
    </>
  );
}
