import Link from "next/link";
import { ArrowRight, Briefcase, Calendar, MapPin, Plus } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { ApplicationStageBadge } from "@/components/applications/ApplicationStageBadge";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { listUserApplications } from "@/src/lib/applications/service";
import type { AppLocale } from "@/src/lib/i18n/config";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";

function formatDate(date: Date, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function ApplicationsPage() {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const applications = await listUserApplications(userId);

  if (applications.length === 0) {
    return (
      <>
        <PageHeader
          title={dictionary.workspace.applications.title}
          description={dictionary.workspace.applications.description}
          action={{
            href: "/applications/new",
            icon: Plus,
            label: dictionary.appShell.actions.newApplication,
          }}
        />
        <EmptyState
          icon={Briefcase}
          title={dictionary.workspace.applications.emptyTitle}
          description={dictionary.workspace.applications.emptyDescription}
          action={{
            href: "/applications/new",
            icon: Plus,
            label: dictionary.appShell.actions.newApplication,
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={dictionary.workspace.applications.title}
        description={dictionary.workspace.applications.description}
        action={{
          href: "/applications/new",
          icon: Plus,
          label: dictionary.appShell.actions.newApplication,
        }}
      />

      <div className="space-y-3">
        {applications.map((application) => (
          <Link
            key={application.id}
            href={`/applications/${application.id}`}
            className="group block"
          >
            <AppCard hover padding="none">
              <div className="flex items-start gap-3 p-3.5 sm:gap-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/40 sm:h-11 sm:w-11">
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {application.companyName.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate font-medium text-foreground">
                        {application.roleTitle}
                      </h2>
                      <p className="truncate text-sm text-muted-foreground">
                        {application.companyName}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 self-start">
                      <ApplicationStageBadge
                        label={dictionary.applicationStages[application.stage]}
                        stage={application.stage}
                      />
                      <ArrowRight
                        className="h-4 w-4 text-muted-foreground/70 transition group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {dictionary.common.updated}{" "}
                      {formatDate(application.updatedAt, locale)}
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
