import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  LayoutDashboard,
  MapPin,
  type LucideIcon,
} from "lucide-react";

import {
  AppCard,
  AppCardContent,
  AppCardHeader,
} from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { ApplicationStageSelect } from "@/components/applications/ApplicationStageSelect";
import { Button } from "@/components/ui/button";
import { jdExtractSchema, type JdExtract } from "@/src/lib/ai/schemas/jd-extract";
import {
  getApplicationStageLabel,
  getApplicationStageOptions,
} from "@/src/lib/applications/stages";
import { getUserApplication } from "@/src/lib/applications/service";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";

type ApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function parseExtract(value: unknown):
  | { status: "missing"; data: null }
  | { status: "invalid"; data: null }
  | { status: "valid"; data: JdExtract } {
  if (!value) {
    return {
      data: null,
      status: "missing",
    };
  }

  const parsed = jdExtractSchema.safeParse(value);

  if (!parsed.success) {
    return {
      data: null,
      status: "invalid",
    };
  }

  return {
    data: parsed.data,
    status: "valid",
  };
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const [{ id }, userId] = await Promise.all([
    params,
    requireCurrentUserId(),
  ]);
  const application = await getUserApplication(userId, id);

  if (!application) {
    notFound();
  }

  const extract = parseExtract(application.jdExtractJson);
  const stageOptions = getApplicationStageOptions();

  return (
    <>
      <PageHeader
        title={application.roleTitle}
        description={`${application.companyName} · Updated ${formatDate(
          application.updatedAt
        )}`}
      >
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/applications">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Applications
          </Link>
        </Button>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
        </Button>
      </PageHeader>

      <AppCard padding="sm" className="mb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Current stage
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {getApplicationStageLabel(application.stage)}
            </p>
          </div>
          <div className="w-full sm:w-64">
            <ApplicationStageSelect
              applicationId={application.id}
              currentStage={application.stage}
              label={`Update stage for ${application.companyName} ${application.roleTitle}`}
              options={stageOptions}
            />
          </div>
        </div>
      </AppCard>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <AppCard padding="lg">
            <div className="flex items-start gap-4 border-b border-border pb-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
                <Briefcase className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-medium text-foreground">
                  Original JD
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Stored privately with this application.
                </p>
              </div>
            </div>
            <pre className="mt-6 max-h-[42rem] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-secondary/20 p-4 text-sm leading-6 text-foreground">
              {application.jdText}
            </pre>
          </AppCard>

          <AppCard padding="lg">
            <AppCardHeader
              title="Extracted structured fields"
              description="Saved from the reviewed JD extract."
            />
            <AppCardContent>
              {extract.status === "valid" ? (
                <div className="space-y-5">
                  <DetailGrid extract={extract.data} />
                  <ListSection
                    title="Required skills"
                    items={extract.data.requiredSkills}
                  />
                  <ListSection
                    title="Preferred skills"
                    items={extract.data.preferredSkills}
                  />
                  <ListSection
                    title="Responsibilities"
                    items={extract.data.responsibilities}
                  />
                  <ListSection title="Keywords" items={extract.data.keywords} />
                  <ListSection title="Warnings" items={extract.data.warnings} />
                </div>
              ) : extract.status === "invalid" ? (
                <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-6 text-sm text-muted-foreground">
                  The saved JD extract could not be displayed safely. The
                  original JD text is still available above.
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-6 text-sm text-muted-foreground">
                  No structured JD extract was saved for this application.
                </div>
              )}
            </AppCardContent>
          </AppCard>
        </div>

        <div className="space-y-5">
          <AppCard>
            <AppCardHeader
              title="Application Details"
              description="Current saved metadata."
            />
            <AppCardContent className="space-y-3 text-sm">
              <MetaRow label="Company" value={application.companyName} />
              <MetaRow label="Role" value={application.roleTitle} />
              <MetaRow
                label="Location"
                value={application.location || "Not specified"}
                icon={application.location ? MapPin : undefined}
              />
              <MetaRow
                label="Stage"
                value={getApplicationStageLabel(application.stage)}
              />
              <MetaRow
                label="Created"
                value={formatDate(application.createdAt)}
              />
              <MetaRow
                label="Updated"
                value={formatDate(application.updatedAt)}
              />
            </AppCardContent>
          </AppCard>

          <Button variant="outline" asChild className="w-full rounded-xl">
            <Link href="/applications">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to applications
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-right text-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {value}
      </span>
    </div>
  );
}

function DetailGrid({ extract }: { extract: JdExtract }) {
  const rows = [
    ["Seniority", extract.seniority],
    ["Employment type", extract.employmentType],
    ["Confidence", `${Math.round(extract.confidence * 100)}%`],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-secondary/20 p-3"
        >
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm text-foreground">{value || "Not found"}</p>
        </div>
      ))}
    </div>
  );
}

function ListSection({ items, title }: { items: string[]; title: string }) {
  return (
    <section>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-xs text-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No items saved.</p>
      )}
    </section>
  );
}
