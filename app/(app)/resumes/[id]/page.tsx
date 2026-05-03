import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  FileText,
  Trash2,
} from "lucide-react";

import {
  AppCard,
  AppCardContent,
  AppCardHeader,
} from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { ResumeBulletGroupsView } from "@/components/resumes/ResumeBulletGroupsView";
import { ResumeParseControl } from "@/components/resumes/ResumeParseControl";
import { ParsedResumeView } from "@/components/resumes/ResumeParsedView";
import { Button } from "@/components/ui/button";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import type { AppLocale } from "@/src/lib/i18n/config";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";
import {
  getParsedResumeDisplay,
  groupResumeBullets,
} from "@/src/lib/resumes/detail-view";
import { getUserResumeDetail } from "@/src/lib/resumes/service";
import { RESUME_TITLE_MAX_LENGTH } from "@/src/lib/validations/resume";

import { deleteResumeAction, renameResumeAction } from "../actions";

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

export default async function ResumeDetailPage({
  params,
  searchParams,
}: ResumeDetailPageProps) {
  const [{ id }, userId, query] = await Promise.all([
    params,
    requireCurrentUserId(),
    searchParams,
  ]);
  const resume = await getUserResumeDetail(userId, id);
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const copy = dictionary.workspace.resumeDetail;

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
    <>
      <PageHeader
        title={resume.title}
        description={fill(copy.description, {
          date: formatDate(resume.updatedAt, locale),
        })}
      >
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/resumes">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {copy.resumes}
          </Link>
        </Button>
      </PageHeader>

      {error && (
        <div className="mb-5 rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive shadow-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          {success}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          {parsedResume.status === "valid" ? (
            <ParsedResumeView dictionary={dictionary} resume={parsedResume.data} />
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

          <AppCard padding="lg">
            <details open>
              <summary className="flex cursor-pointer list-none items-start gap-4 border-b border-border pb-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-foreground">
                    {copy.sourceTitle}
                  </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {copy.sourceDescription}
                  </p>
                </div>
              </summary>
              <pre className="mt-6 max-h-[40rem] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-secondary/20 p-4 font-mono text-sm leading-6 text-foreground">
                {resume.sourceText ||
                  (hasFile
                    ? copy.pdfStored
                    : copy.noSourceTextStored)}
              </pre>
            </details>
          </AppCard>
        </div>

        <div className="space-y-5">
          <AppCard>
            <AppCardHeader
              title={copy.detailsTitle}
              description={copy.detailsDescription}
            />
            <AppCardContent className="space-y-3 text-sm">
              <MetaRow
                label={copy.status}
                value={
                  copy.statusLabels[
                    resume.status as keyof typeof copy.statusLabels
                  ] ?? statusLabel(resume.status)
                }
              />
              <MetaRow
                label={dictionary.common.created}
                value={formatDate(resume.createdAt, locale)}
              />
              <MetaRow
                label={dictionary.common.updated}
                value={formatDate(resume.updatedAt, locale)}
              />
              <MetaRow
                label={copy.source}
                value={
                  hasSourceText
                    ? copy.pastedText
                    : hasFile
                      ? copy.privatePdf
                      : copy.noSourceText
                }
              />
              <MetaRow
                label={copy.parsedJson}
                value={
                  parsedResume.status === "valid"
                    ? dictionary.common.valid
                    : parsedResume.status === "invalid"
                      ? dictionary.common.invalid
                      : dictionary.common.missing
                }
              />
              <MetaRow
                label={copy.bulletRecords}
                value={resume.bullets.length.toString()}
              />
            </AppCardContent>
          </AppCard>

          <AppCard>
            <AppCardHeader
              title={
                resume.status === "FAILED" ? copy.parseFailed : copy.parseTitle
              }
              description={copy.parseDescription}
            />
            <AppCardContent>
              <ResumeParseControl
                hasFile={hasFile}
                hasParsedJson={hasStoredParsedJson}
                hasSourceText={hasSourceText}
                dictionary={dictionary}
                resumeId={resume.id}
                status={resume.status}
              />
            </AppCardContent>
          </AppCard>

          <AppCard>
            <AppCardHeader
              title={copy.renameTitle}
              description={copy.renameDescription}
            />
            <AppCardContent>
              <form action={renameResumeAction} className="space-y-3">
                <input type="hidden" name="id" value={resume.id} />
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-foreground"
                >
                  {copy.titleLabel}
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  maxLength={RESUME_TITLE_MAX_LENGTH}
                  defaultValue={resume.title}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
                <Button type="submit" className="w-full rounded-xl">
                  {copy.saveName}
                </Button>
              </form>
            </AppCardContent>
          </AppCard>

          <AppCard>
            <AppCardHeader
              title={copy.deleteTitle}
              description={copy.deleteDescription}
            />
            <AppCardContent>
              <form action={deleteResumeAction} className="space-y-3">
                <input type="hidden" name="id" value={resume.id} />
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {copy.deleteResume}
                </Button>
              </form>
            </AppCardContent>
          </AppCard>

          <Button variant="outline" asChild className="w-full rounded-xl">
            <Link href="/resumes">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {copy.backToResumes}
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}
