import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Database,
  FileText,
} from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { RouteToast } from "@/components/app/RouteToast";
import { ResumeBulletGroupsView } from "@/components/resumes/ResumeBulletGroupsView";
import { ResumeDetailIconActions } from "@/components/resumes/ResumeDetailIconActions";
import { ParsedResumeView } from "@/components/resumes/ResumeParsedView";
import { ResumeTitleInlineEditor } from "@/components/resumes/ResumeTitleInlineEditor";
import { Button } from "@/components/ui/button";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { isPrismaClientInitializationError } from "@/src/lib/db/errors";
import type { AppLocale } from "@/src/lib/i18n/config";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";
import {
  getParsedResumeDisplay,
  groupResumeBullets,
} from "@/src/lib/resumes/detail-view";
import { getUserResumeDetail } from "@/src/lib/resumes/service";
import {
  RESUME_PDF_MAX_BYTES,
  RESUME_SOURCE_TEXT_MAX_LENGTH,
  RESUME_TITLE_MAX_LENGTH,
} from "@/src/lib/validations/resume";

import {
  deleteResumeAction,
  renameResumeAction,
  replaceResumeSourceAction,
  updateParsedResumeAction,
} from "../actions";

type ResumeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

function readMessage(
  params: Record<string, string | string[] | undefined> | undefined,
  key: "error" | "success"
) {
  const value = params?.[key];

  return typeof value === "string" ? value : null;
}

function statusLabel(status: string) {
  return status.toLowerCase().replaceAll("_", " ");
}

function fill(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, value),
    template
  );
}

async function loadResumeDetail(userId: string, id: string) {
  try {
    return {
      resume: await getUserResumeDetail(userId, id),
      status: "ready" as const,
    };
  } catch (error) {
    if (isPrismaClientInitializationError(error)) {
      return {
        resume: null,
        status: "database-unavailable" as const,
      };
    }

    throw error;
  }
}

export default async function ResumeDetailPage({
  params,
  searchParams,
}: ResumeDetailPageProps) {
  const [{ id }, userId, query] = await Promise.all([
    params,
    requireCurrentUserId(),
    searchParams,
  ]);
  const resumeData = await loadResumeDetail(userId, id);
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const copy = dictionary.workspace.resumeDetail;

  if (resumeData.status === "database-unavailable") {
    return (
      <>
        <PageHeader
          title={copy.unavailableTitle}
          description={copy.unavailableDescription}
        >
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/resumes">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {copy.resumes}
            </Link>
          </Button>
        </PageHeader>
        <EmptyState
          icon={Database}
          title={copy.databaseUnavailableTitle}
          description={copy.databaseUnavailableDescription}
          secondaryAction={{
            href: `/resumes/${id}`,
            label: copy.retryResume,
          }}
          statusLabel={copy.databaseStatus}
        />
      </>
    );
  }

  const resume = resumeData.resume;

  if (!resume) {
    notFound();
  }

  const parsedResume = getParsedResumeDisplay(resume.parsedJson);
  const bulletGroups = groupResumeBullets(resume.bullets);
  const hasSourceText = Boolean(resume.sourceText?.trim());
  const hasFile = Boolean(resume.filePath?.trim());
  const hasStoredParsedJson = Boolean(resume.parsedJson);
  const error = readMessage(query, "error");
  const success = readMessage(query, "success");

  return (
    <div className="[&_[data-slot=button][data-variant=outline]]:border-[0.5px]">
      <PageHeader
        title={
          <ResumeTitleInlineEditor
            action={renameResumeAction}
            copy={copy.actions}
            resumeId={resume.id}
            title={resume.title}
            titleMaxLength={RESUME_TITLE_MAX_LENGTH}
          />
        }
        description={fill(copy.description, {
          date: formatDate(resume.updatedAt, locale),
        })}
      >
        <ResumeDetailIconActions
          actionsCopy={copy.actions}
          backHref="/resumes"
          backLabel={copy.backToResumes}
          bulletCount={resume.bullets.length}
          createdAtLabel={formatDate(resume.createdAt, locale)}
          deleteAction={deleteResumeAction}
          detailCopy={{
            bulletRecords: copy.bulletRecords,
            deleteDescription: copy.deleteDescription,
            deleteResume: copy.deleteResume,
            deleteTitle: copy.deleteTitle,
            detailsDescription: copy.detailsDescription,
            detailsTitle: copy.detailsTitle,
            parsedJson: copy.parsedJson,
            source: copy.source,
            status: copy.status,
          }}
          dictionary={dictionary}
          hasFile={hasFile}
          hasParsedJson={hasStoredParsedJson}
          hasSourceText={hasSourceText}
          parsedJsonLabel={
            parsedResume.status === "valid"
              ? dictionary.common.valid
              : parsedResume.status === "invalid"
                ? dictionary.common.invalid
                : dictionary.common.missing
          }
          pdfMaxBytes={RESUME_PDF_MAX_BYTES}
          replaceAction={replaceResumeSourceAction}
          replaceCopy={copy.replaceSource}
          resumeId={resume.id}
          sourceLabel={
            hasSourceText
              ? copy.pastedText
              : hasFile
                ? copy.privatePdf
                : copy.noSourceText
          }
          sourceTextMaxLength={RESUME_SOURCE_TEXT_MAX_LENGTH}
          status={resume.status}
          statusLabel={
            copy.statusLabels[
              resume.status as keyof typeof copy.statusLabels
            ] ?? statusLabel(resume.status)
          }
          updatedAtLabel={formatDate(resume.updatedAt, locale)}
        />
      </PageHeader>

      <RouteToast error={error} success={success} />

      <div className="space-y-5">
        {parsedResume.status === "valid" ? (
          <ParsedResumeView
            key={resume.updatedAt.toISOString()}
            action={updateParsedResumeAction}
            dictionary={dictionary}
            initialActionState={{
              message: "",
              status: "idle",
            }}
            resume={parsedResume.data}
            resumeId={resume.id}
          />
        ) : parsedResume.status === "invalid" ? (
          <AppCard padding="lg">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-medium text-foreground">
                  {copy.invalidParsedTitle}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {copy.invalidParsedDescription}
                </p>
              </div>
            </div>
          </AppCard>
        ) : (
          <AppCard padding="lg">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-medium text-foreground">
                  {copy.missingParsedTitle}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {copy.missingParsedDescription}
                </p>
              </div>
            </div>
          </AppCard>
        )}

        <ResumeBulletGroupsView dictionary={dictionary} groups={bulletGroups} />
      </div>
    </div>
  );
}
