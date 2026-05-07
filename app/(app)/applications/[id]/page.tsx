import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  FileText,
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
import { ApplicationDiagnosisPanel } from "@/components/applications/ApplicationDiagnosisPanel";
import { ApplicationResumeSelect } from "@/components/applications/ApplicationResumeSelect";
import { ApplicationStageSelect } from "@/components/applications/ApplicationStageSelect";
import { Button } from "@/components/ui/button";
import {
  diagnosisSchema,
  type Diagnosis,
} from "@/src/lib/ai/schemas/diagnosis";
import { jdExtractSchema, type JdExtract } from "@/src/lib/ai/schemas/jd-extract";
import { resumeParseSchema } from "@/src/lib/ai/schemas/resume-parse";
import {
  getApplicationStageLabel,
  getApplicationStageOptions,
} from "@/src/lib/applications/stages";
import { getUserApplication } from "@/src/lib/applications/service";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import type { AppLocale } from "@/src/lib/i18n/config";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";
import { listUserResumes } from "@/src/lib/resumes/service";

type ApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: Date, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale, {
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

function parseDiagnosis(value: unknown):
  | { status: "missing"; data: null }
  | { status: "invalid"; data: null }
  | { status: "valid"; data: Diagnosis } {
  if (!value) {
    return {
      data: null,
      status: "missing",
    };
  }

  const parsed = diagnosisSchema.safeParse(value);

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

function fill(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, value),
    template
  );
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const [{ id }, userId] = await Promise.all([
    params,
    requireCurrentUserId(),
  ]);
  const [application, resumes] = await Promise.all([
    getUserApplication(userId, id),
    listUserResumes(userId),
  ]);
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const copy = dictionary.workspace.applicationDetail;

  if (!application) {
    notFound();
  }

  const extract = parseExtract(application.jdExtractJson);
  const diagnosis = parseDiagnosis(application.diagnosisJson);
  const resumePrerequisite = application.resume
    ? resumeParseSchema.safeParse(application.resume.parsedJson).success
      ? { status: "ready" as const }
      : {
          resumeHref: `/resumes/${application.resume.id}`,
          resumeTitle: application.resume.title,
          status: "resume_unparsed" as const,
        }
    : { createResumeHref: "/resumes/new", status: "resume_missing" as const };
  const stageOptions = getApplicationStageOptions(dictionary.applicationStages);

  return (
    <>
      <PageHeader
        title={application.roleTitle}
        description={fill(copy.updatedDescription, {
          company: application.companyName,
          date: formatDate(application.updatedAt, locale),
        })}
      >
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/applications">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {copy.applications}
          </Link>
        </Button>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            {copy.dashboard}
          </Link>
        </Button>
      </PageHeader>

      <AppCard padding="sm" className="mb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {copy.currentStage}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {getApplicationStageLabel(
                application.stage,
                dictionary.applicationStages
              )}
            </p>
          </div>
          <div className="w-full sm:w-64">
            <ApplicationStageSelect
              applicationId={application.id}
              currentStage={application.stage}
              dictionary={dictionary}
              label={fill(copy.updateStageFor, {
                company: application.companyName,
                role: application.roleTitle,
              })}
              options={stageOptions}
            />
          </div>
        </div>
      </AppCard>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <ApplicationDiagnosisPanel
            applicationId={application.id}
            dictionary={dictionary}
            initialDiagnosis={
              diagnosis.status === "valid" ? diagnosis.data : null
            }
            initialState={diagnosis.status}
            resumePrerequisite={resumePrerequisite}
          />

          <AppCard padding="lg">
            <div className="flex items-start gap-4 border-b border-border pb-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
                <Briefcase className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-medium text-foreground">
                  {copy.originalJd}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {copy.originalJdDescription}
                </p>
              </div>
            </div>
            <pre className="mt-6 max-h-[42rem] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-secondary/20 p-4 text-sm leading-6 text-foreground">
              {application.jdText}
            </pre>
          </AppCard>

          <AppCard padding="lg">
            <AppCardHeader
              title={copy.extractedFields}
              description={copy.extractedFieldsDescription}
            />
            <AppCardContent>
              {extract.status === "valid" ? (
                <div className="space-y-5">
                  <DetailGrid dictionary={dictionary} extract={extract.data} />
                  <ListSection
                    dictionary={dictionary}
                    title={copy.requiredSkills}
                    items={extract.data.requiredSkills}
                  />
                  <ListSection
                    dictionary={dictionary}
                    title={copy.preferredSkills}
                    items={extract.data.preferredSkills}
                  />
                  <ListSection
                    dictionary={dictionary}
                    title={copy.responsibilities}
                    items={extract.data.responsibilities}
                  />
                  <ListSection
                    dictionary={dictionary}
                    title={copy.keywords}
                    items={extract.data.keywords}
                  />
                  <ListSection
                    dictionary={dictionary}
                    title={copy.warnings}
                    items={extract.data.warnings}
                  />
                </div>
              ) : extract.status === "invalid" ? (
                <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-6 text-sm text-muted-foreground">
                  {copy.invalidExtract}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-6 text-sm text-muted-foreground">
                  {copy.missingExtract}
                </div>
              )}
            </AppCardContent>
          </AppCard>
        </div>

        <div className="space-y-5">
          <AppCard>
            <AppCardHeader
              title={copy.detailsTitle}
              description={copy.detailsDescription}
            />
            <AppCardContent className="space-y-3 text-sm">
              <MetaRow label={copy.company} value={application.companyName} />
              <MetaRow label={copy.role} value={application.roleTitle} />
              <MetaRow
                label={copy.location}
                value={application.location || dictionary.common.notSpecified}
                icon={application.location ? MapPin : undefined}
              />
              <MetaRow
                label={copy.stage}
                value={getApplicationStageLabel(
                  application.stage,
                  dictionary.applicationStages
                )}
              />
              <MetaRow
                label={dictionary.common.created}
                value={formatDate(application.createdAt, locale)}
              />
              <MetaRow
                label={dictionary.common.updated}
                value={formatDate(application.updatedAt, locale)}
              />
            </AppCardContent>
          </AppCard>

          <AppCard>
            <AppCardHeader
              title={copy.attachedResume}
              description={copy.attachedResumeDescription}
            />
            <AppCardContent className="space-y-4">
              {application.resume ? (
                <Link
                  href={`/resumes/${application.resume.id}`}
                  className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-3 transition hover:border-primary/20"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {application.resume.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {application.resume.status.toLowerCase()} ·{" "}
                      {dictionary.common.updated}{" "}
                      {formatDate(application.resume.updatedAt, locale)}
                    </span>
                  </span>
                </Link>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
                  {copy.noResumeAttached}
                </div>
              )}

              {resumes.length > 0 ? (
                <ApplicationResumeSelect
                  applicationId={application.id}
                  currentResumeId={application.resume?.id ?? null}
                  dictionary={dictionary}
                  label={fill(copy.updateAttachedResumeFor, {
                    company: application.companyName,
                    role: application.roleTitle,
                  })}
                  resumes={resumes.map((resume) => ({
                    id: resume.id,
                    title: resume.title,
                  }))}
                />
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  {copy.noResumesYet}{" "}
                  <Link href="/resumes/new" className="text-foreground underline">
                    {copy.pasteResume}
                  </Link>{" "}
                  {copy.attachOneHere}
                </p>
              )}
            </AppCardContent>
          </AppCard>

          <Button variant="outline" asChild className="w-full rounded-xl">
            <Link href="/applications">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {copy.backToApplications}
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

function DetailGrid({
  dictionary,
  extract,
}: {
  dictionary: Pick<AppDictionary, "common" | "workspace">;
  extract: JdExtract;
}) {
  const copy = dictionary.workspace.applicationDetail;
  const rows = [
    [copy.seniority, extract.seniority],
    [copy.employmentType, extract.employmentType],
    [copy.confidence, `${Math.round(extract.confidence * 100)}%`],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-secondary/20 p-3"
        >
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm text-foreground">
            {value || dictionary.common.notFound}
          </p>
        </div>
      ))}
    </div>
  );
}

function ListSection({
  dictionary,
  items,
  title,
}: {
  dictionary: Pick<AppDictionary, "workspace">;
  items: string[];
  title: string;
}) {
  return (
    <section>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-xs text-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          {dictionary.workspace.applicationDetail.noItemsSaved}
        </p>
      )}
    </section>
  );
}
