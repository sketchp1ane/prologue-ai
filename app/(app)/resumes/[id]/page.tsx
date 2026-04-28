import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";

import {
  AppCard,
  AppCardContent,
  AppCardHeader,
} from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { getUserResume } from "@/src/lib/resumes/service";
import { RESUME_TITLE_MAX_LENGTH } from "@/src/lib/validations/resume";

import { deleteResumeAction, renameResumeAction } from "../actions";

type ResumeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

function readMessage(
  params: Record<string, string | string[] | undefined> | undefined,
  key: "error" | "success"
) {
  const value = params?.[key];

  return typeof value === "string" ? value : null;
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
  const resume = await getUserResume(userId, id);

  if (!resume) {
    notFound();
  }

  const error = readMessage(query, "error");
  const success = readMessage(query, "success");

  return (
    <>
      <PageHeader
        title={resume.title}
        description={`Updated ${formatDate(resume.updatedAt)}`}
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
      {success && (
        <div className="mb-5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          {success}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <AppCard padding="lg">
          <div className="flex items-start gap-4 border-b border-border pb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-medium text-foreground">
                Pasted source text
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Stored as private raw resume text. Parsing and PDF upload are
                intentionally not enabled yet.
              </p>
            </div>
          </div>
          <pre className="mt-6 max-h-[40rem] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-secondary/20 p-4 font-mono text-sm leading-6 text-foreground">
            {resume.sourceText || "No source text stored."}
          </pre>
        </AppCard>

        <div className="space-y-5">
          <AppCard>
            <AppCardHeader
              title="Resume Details"
              description="Current record state."
            />
            <AppCardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <span className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-xs font-medium text-foreground">
                  {resume.status.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Created</span>
                <span className="text-right text-foreground">
                  {formatDate(resume.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Updated</span>
                <span className="text-right text-foreground">
                  {formatDate(resume.updatedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Source</span>
                <span className="text-foreground">Pasted text</span>
              </div>
            </AppCardContent>
          </AppCard>

          <AppCard>
            <AppCardHeader
              title="Rename"
              description="Keep resume versions easy to scan."
            />
            <AppCardContent>
              <form action={renameResumeAction} className="space-y-3">
                <input type="hidden" name="id" value={resume.id} />
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-foreground"
                >
                  Title
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
                  Save Name
                </Button>
              </form>
            </AppCardContent>
          </AppCard>

          <AppCard>
            <AppCardHeader
              title="Delete"
              description="Remove this resume from your workspace."
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
                  Delete Resume
                </Button>
              </form>
            </AppCardContent>
          </AppCard>

          <Button variant="outline" asChild className="w-full rounded-xl">
            <Link href="/resumes">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to resumes
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
