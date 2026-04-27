import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Plus } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { listUserResumes } from "@/src/lib/resumes/service";

type ResumesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
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

export default async function ResumesPage({ searchParams }: ResumesPageProps) {
  const [userId, params] = await Promise.all([
    requireCurrentUserId(),
    searchParams,
  ]);
  const resumes = await listUserResumes(userId);
  const error = readMessage(params, "error");
  const success = readMessage(params, "success");

  if (resumes.length === 0) {
    return (
      <>
        <PageHeader
          title="Resumes"
          description="Create and manage resume versions from pasted text."
          action={{
            href: "/resumes/new",
            icon: Plus,
            label: "Paste Resume",
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
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Paste resume text to create your first private resume record. PDF upload and AI parsing will come in a later slice."
          action={{
            href: "/resumes/new",
            icon: Plus,
            label: "Paste Resume",
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Resumes"
        description="Create and manage resume versions from pasted text."
        action={{
          href: "/resumes/new",
          icon: Plus,
          label: "Paste Resume",
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {resumes.map((resume) => (
          <Link key={resume.id} href={`/resumes/${resume.id}`}>
            <AppCard hover className="h-full">
              <div className="flex h-full flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {resume.status.toLowerCase()}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-medium text-foreground">
                    {resume.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Updated {formatDate(resume.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                  <span>View source text</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </AppCard>
          </Link>
        ))}
      </div>
    </>
  );
}
