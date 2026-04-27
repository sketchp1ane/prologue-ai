import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import {
  RESUME_SOURCE_TEXT_MAX_LENGTH,
  RESUME_TITLE_MAX_LENGTH,
} from "@/src/lib/validations/resume";

import { createResumeAction } from "../actions";

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
  const params = await searchParams;
  const error = readError(params);

  return (
    <>
      <PageHeader
        title="Paste Resume"
        description="Create a resume record from text only. PDF upload and parsing are intentionally not part of this slice."
        secondaryAction={{
          href: "/resumes",
          label: "Back to resumes",
        }}
      />
      {error && (
        <div className="mb-5 rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive shadow-sm">
          {error}
        </div>
      )}
      <AppCard padding="lg">
        <form action={createResumeAction} className="space-y-6">
          <div className="flex items-start gap-4 border-b border-border pb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-medium text-foreground">
                Resume source
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Store the pasted text exactly as provided so it can be parsed in
                a later AI slice.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-foreground"
            >
              Resume title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={RESUME_TITLE_MAX_LENGTH}
              placeholder="Frontend resume"
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="sourceText"
              className="text-sm font-medium text-foreground"
            >
              Pasted resume text
            </label>
            <textarea
              id="sourceText"
              name="sourceText"
              required
              maxLength={RESUME_SOURCE_TEXT_MAX_LENGTH}
              placeholder="Paste your resume text here."
              rows={18}
              className="min-h-[28rem] w-full resize-y rounded-xl border border-input bg-background px-3 py-3 font-mono text-sm leading-6 text-foreground outline-none transition placeholder:font-sans focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <p className="text-xs text-muted-foreground">
              Maximum {RESUME_SOURCE_TEXT_MAX_LENGTH.toLocaleString()} characters.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/resumes">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Link>
            </Button>
            <Button type="submit" className="rounded-xl">
              Create Resume
            </Button>
          </div>
        </form>
      </AppCard>
    </>
  );
}
