import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import {
  getResumeListParseState,
  hasResumeParsedJson,
  type ResumeListParseState,
} from "@/src/lib/resumes/list-view";
import { listUserResumes } from "@/src/lib/resumes/service";
import { cn } from "@/src/lib/utils";

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

type ResumeParseStateUi = {
  actionLabel: string | null;
  dotClassName: string;
  icon: LucideIcon;
  label: string;
};

const RESUME_PARSE_STATE_UI = {
  failed: {
    actionLabel: "Retry parse",
    dotClassName: "bg-rose-500",
    icon: AlertCircle,
    label: "Failed",
  },
  not_parsed: {
    actionLabel: "Parse",
    dotClassName: "bg-zinc-300",
    icon: CircleDashed,
    label: "Not parsed",
  },
  parsing: {
    actionLabel: null,
    dotClassName: "bg-amber-500",
    icon: Loader2,
    label: "Parsing",
  },
  ready: {
    actionLabel: "Re-parse",
    dotClassName: "bg-emerald-500",
    icon: CheckCircle2,
    label: "Ready",
  },
} satisfies Record<ResumeListParseState, ResumeParseStateUi>;

function formatCount(count: number, singular: string) {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

function ResumeParseStateBadge({ state }: { state: ResumeListParseState }) {
  const stateUi = RESUME_PARSE_STATE_UI[state];
  const Icon = stateUi.icon;

  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-foreground shadow-xs">
      <span
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", stateUi.dotClassName)}
        aria-hidden="true"
      />
      <Icon
        className={cn("h-3.5 w-3.5", state === "parsing" && "animate-spin")}
        aria-hidden="true"
      />
      {stateUi.label}
    </span>
  );
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
          description="Create and manage resume versions from pasted text or private PDFs."
          action={{
            href: "/resumes/new",
            icon: Plus,
            label: "Add Resume",
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
          description="Paste resume text to create your first private resume record, then parse it from the resume detail page."
          action={{
            href: "/resumes/new",
            icon: Plus,
            label: "Add Resume",
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Resumes"
        description="Create and manage resume versions from pasted text or private PDFs."
        action={{
          href: "/resumes/new",
          icon: Plus,
          label: "Add Resume",
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
        {resumes.map((resume) => {
          const parseState = getResumeListParseState({
            parsedJson: resume.parsedJson,
            status: resume.status,
          });
          const stateUi = RESUME_PARSE_STATE_UI[parseState];
          const detailHref = `/resumes/${resume.id}`;
          const parsedJsonExists = hasResumeParsedJson(resume.parsedJson);

          return (
            <AppCard key={resume.id} hover className="h-full">
              <div className="flex h-full flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <ResumeParseStateBadge state={parseState} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-medium text-foreground">
                    {resume.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Updated {formatDate(resume.updatedAt)}
                  </p>

                  <div className="mt-4 grid gap-2 rounded-xl border border-border bg-secondary/20 p-3 text-sm">
                    <MetaRow
                      label="Source"
                      value={resume.filePath ? "Private PDF" : "Pasted text"}
                    />
                    <MetaRow
                      label="Parsed JSON"
                      value={parsedJsonExists ? "Present" : "Missing"}
                    />
                    <MetaRow
                      label="Bullets"
                      value={formatCount(resume._count.bullets, "record")}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-lg"
                  >
                    <Link href={detailHref}>
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      View
                    </Link>
                  </Button>
                  {stateUi.actionLabel ? (
                    <Button size="sm" asChild className="rounded-lg">
                      <Link href={detailHref}>
                        {parseState === "ready" || parseState === "failed" ? (
                          <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Sparkles className="h-4 w-4" aria-hidden="true" />
                        )}
                        {stateUi.actionLabel}
                      </Link>
                    </Button>
                  ) : (
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground">
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        aria-hidden="true"
                      />
                      Parsing in progress
                    </span>
                  )}
                </div>
              </div>
            </AppCard>
          );
        })}
      </div>
    </>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
