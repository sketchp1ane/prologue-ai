import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { ApplicationContextRail } from "@/components/applications/ApplicationContextRail";
import { ApplicationDiagnosisPanel } from "@/components/applications/ApplicationDiagnosisPanel";
import { Button } from "@/components/ui/button";
import {
  diagnosisSchema,
  type Diagnosis,
} from "@/src/lib/ai/schemas/diagnosis";
import { jdExtractSchema, type JdExtract } from "@/src/lib/ai/schemas/jd-extract";
import { resumeParseSchema } from "@/src/lib/ai/schemas/resume-parse";
import { getApplicationStageOptions } from "@/src/lib/applications/stages";
import { getUserApplication } from "@/src/lib/applications/service";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import type { AppLocale } from "@/src/lib/i18n/config";
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

      <ApplicationContextRail
        applicationId={application.id}
        currentResumeId={application.resume?.id ?? null}
        currentStage={application.stage}
        details={{
          companyName: application.companyName,
          createdAtLabel: formatDate(application.createdAt, locale),
          hasLocation: Boolean(application.location),
          locationLabel: application.location || dictionary.common.notSpecified,
          roleTitle: application.roleTitle,
          updatedAtLabel: formatDate(application.updatedAt, locale),
        }}
        dictionary={dictionary}
        extract={extract}
        jdText={application.jdText}
        resumePreview={
          application.resume
            ? {
                href: `/resumes/${application.resume.id}`,
                status: application.resume.status.toLowerCase(),
                title: application.resume.title,
                updatedAtLabel: `${dictionary.common.updated} ${formatDate(
                  application.resume.updatedAt,
                  locale
                )}`,
              }
            : null
        }
        resumeSelectLabel={fill(copy.updateAttachedResumeFor, {
          company: application.companyName,
          role: application.roleTitle,
        })}
        resumes={resumes.map((resume) => ({
          id: resume.id,
          status: resume.status.toLowerCase(),
          title: resume.title,
          updatedAtLabel: `${dictionary.common.updated} ${formatDate(
            resume.updatedAt,
            locale
          )}`,
        }))}
        stageLabel={fill(copy.updateStageFor, {
          company: application.companyName,
          role: application.roleTitle,
        })}
        stageOptions={stageOptions}
      >
        <div>
          <ApplicationDiagnosisPanel
            applicationId={application.id}
            dictionary={dictionary}
            initialDiagnosis={
              diagnosis.status === "valid" ? diagnosis.data : null
            }
            initialState={diagnosis.status}
            resumePrerequisite={resumePrerequisite}
          />
        </div>
      </ApplicationContextRail>
    </>
  );
}
