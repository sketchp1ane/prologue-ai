import Link from "next/link";
import { ArrowLeft, FileUp, FileText } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";
import {
  RESUME_SOURCE_TEXT_MAX_LENGTH,
  RESUME_TITLE_MAX_LENGTH,
  RESUME_PDF_MAX_BYTES,
} from "@/src/lib/validations/resume";

import { createPdfResumeAction, createResumeAction } from "../actions";

type NewResumePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readError(params: Record<string, string | string[] | undefined> | undefined) {
  const value = params?.error;

  return typeof value === "string" ? value : null;
}

export default async function NewResumePage({
  searchParams,
}: NewResumePageProps) {
  const [params, userId] = await Promise.all([
    searchParams,
    requireCurrentUserId(),
  ]);
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const copy = dictionary.workspace.resumeCreate;
  const error = readError(params);

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
        secondaryAction={{
          href: "/resumes",
          label: copy.backToResumes,
        }}
      />
      {error && (
        <div className="mb-5 rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive shadow-sm">
          {error}
        </div>
      )}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <AppCard padding="lg">
        <form action={createResumeAction} className="space-y-6">
          <div className="flex items-start gap-4 border-b border-border pb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-medium text-foreground">
                {copy.resumeSource}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {copy.resumeSourceDescription}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-foreground"
            >
              {copy.resumeTitle}
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={RESUME_TITLE_MAX_LENGTH}
              placeholder={copy.resumeTitlePlaceholder}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="sourceText"
              className="text-sm font-medium text-foreground"
            >
              {copy.pastedResumeText}
            </label>
            <textarea
              id="sourceText"
              name="sourceText"
              required
              maxLength={RESUME_SOURCE_TEXT_MAX_LENGTH}
              placeholder={copy.pastedResumePlaceholder}
              rows={18}
              className="min-h-[28rem] w-full resize-y rounded-xl border border-input bg-background px-3 py-3 font-mono text-sm leading-6 text-foreground outline-none transition placeholder:font-sans focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <p className="text-xs text-muted-foreground">
              {copy.maxCharacters.replace(
                "{count}",
                RESUME_SOURCE_TEXT_MAX_LENGTH.toLocaleString()
              )}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/resumes">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {dictionary.common.cancel}
              </Link>
            </Button>
            <Button type="submit" className="rounded-xl">
              {copy.createResume}
            </Button>
          </div>
        </form>
      </AppCard>

      <AppCard padding="lg">
        <form action={createPdfResumeAction} className="space-y-6">
          <div className="flex items-start gap-4 border-b border-border pb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
              <FileUp className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-medium text-foreground">
                {copy.pdfUpload}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {copy.pdfUploadDescription}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="pdf-title"
              className="text-sm font-medium text-foreground"
            >
              {copy.resumeTitle}
            </label>
            <input
              id="pdf-title"
              name="title"
              type="text"
              required
              maxLength={RESUME_TITLE_MAX_LENGTH}
              placeholder={copy.pdfTitlePlaceholder}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="pdfFile"
              className="text-sm font-medium text-foreground"
            >
              {copy.pdfFile}
            </label>
            <input
              id="pdfFile"
              name="pdfFile"
              type="file"
              required
              accept="application/pdf,.pdf"
              className="block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              {copy.pdfHint.replace(
                "{size}",
                String(Math.floor(RESUME_PDF_MAX_BYTES / 1024 / 1024))
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-secondary/20 p-4 text-xs leading-5 text-muted-foreground">
            {copy.privacyNotice}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/resumes">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {dictionary.common.cancel}
              </Link>
            </Button>
            <Button type="submit" className="rounded-xl">
              <FileUp className="h-4 w-4" aria-hidden="true" />
              {copy.uploadPdf}
            </Button>
          </div>
        </form>
      </AppCard>
      </div>
    </>
  );
}
