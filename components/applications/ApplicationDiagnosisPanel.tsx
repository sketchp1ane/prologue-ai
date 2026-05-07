"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCcw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import {
  AppCard,
  AppCardContent,
  AppCardHeader,
} from "@/components/app/AppCard";
import { Button } from "@/components/ui/button";
import type { Diagnosis } from "@/src/lib/ai/schemas/diagnosis";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";
import { cn } from "@/src/lib/utils";

type DiagnosisInitialState = "invalid" | "missing" | "valid";

type DiagnosisResumePrerequisite =
  | {
      createResumeHref: string;
      status: "resume_missing";
    }
  | {
      resumeHref: string;
      resumeTitle: string;
      status: "resume_unparsed";
    }
  | {
      status: "ready";
    };

type ApplicationDiagnosisPanelProps = {
  applicationId: string;
  dictionary: Pick<AppDictionary, "common" | "workspace">;
  initialDiagnosis: Diagnosis | null;
  initialState: DiagnosisInitialState;
  resumePrerequisite: DiagnosisResumePrerequisite;
};

const VERDICT_STYLES = {
  strong_match: {
    className: "border-primary/20 bg-primary/10 text-primary",
    icon: CheckCircle2,
  },
  possible_match: {
    className: "border-border bg-secondary/50 text-foreground",
    icon: Sparkles,
  },
  weak_match: {
    className: "border-border bg-card text-muted-foreground",
    icon: AlertTriangle,
  },
} satisfies Record<
  Diagnosis["hrThreeSecondVerdict"],
  {
    className: string;
    icon: LucideIcon;
  }
>;

const GAP_STYLES = {
  high: "border-border bg-card text-foreground",
  medium: "border-border bg-secondary/30 text-foreground",
  low: "border-border bg-secondary/20 text-muted-foreground",
} satisfies Record<Diagnosis["gaps"][number]["severity"], string>;

export function ApplicationDiagnosisPanel({
  applicationId,
  dictionary,
  initialDiagnosis,
  initialState,
  resumePrerequisite,
}: ApplicationDiagnosisPanelProps) {
  const copy = dictionary.workspace.applicationDetail.diagnosis;
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis);
  const [state, setState] = useState<DiagnosisInitialState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasDiagnosis = Boolean(diagnosis);
  const canGenerate = resumePrerequisite.status === "ready";
  const showRetry = Boolean(error && !hasDiagnosis && canGenerate);

  function handleGenerate() {
    if (!canGenerate) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/applications/${applicationId}/diagnose`, {
          body: JSON.stringify({ force: hasDiagnosis }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const body = (await response.json()) as {
          data?: {
            diagnosis?: Diagnosis;
          };
          error?: {
            message?: string;
          };
        };

        if (!response.ok || !body.data?.diagnosis) {
          setError(body.error?.message ?? copy.generateFailed);
          return;
        }

        setDiagnosis(body.data.diagnosis);
        setState("valid");
      } catch {
        setError(copy.connectionFailed);
      }
    });
  }

  return (
    <AppCard padding="lg">
      <AppCardHeader
        title={copy.title}
        description={copy.description}
        action={
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isPending || !canGenerate}
            className="rounded-xl"
            variant={hasDiagnosis ? "outline" : "default"}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : hasDiagnosis ? (
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {isPending
              ? copy.generating
              : showRetry
                ? copy.retry
                : hasDiagnosis
                ? copy.regenerate
                : copy.generate}
          </Button>
        }
      />
      <AppCardContent>
        {resumePrerequisite.status !== "ready" && (
          <PrerequisiteNotice
            dictionary={dictionary}
            prerequisite={resumePrerequisite}
          />
        )}

        {error && (
          <div
            className="mb-4 rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive shadow-sm"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {!diagnosis ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-6 text-sm leading-6 text-muted-foreground">
            {state === "invalid"
              ? copy.invalidCached
              : resumePrerequisite.status === "ready"
                ? copy.empty
                : copy.emptyBlocked}
          </div>
        ) : (
          <DiagnosisReport diagnosis={diagnosis} dictionary={dictionary} />
        )}
      </AppCardContent>
    </AppCard>
  );
}

function PrerequisiteNotice({
  dictionary,
  prerequisite,
}: {
  dictionary: Pick<AppDictionary, "workspace">;
  prerequisite: Exclude<DiagnosisResumePrerequisite, { status: "ready" }>;
}) {
  const copy = dictionary.workspace.applicationDetail.diagnosis;

  return (
    <div className="mb-4 rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm leading-6 text-muted-foreground">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
          <FileText className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {prerequisite.status === "resume_missing"
              ? copy.attachResumeFirstTitle
              : copy.parseResumeFirstTitle}
          </p>
          <p className="mt-1">
            {prerequisite.status === "resume_missing"
              ? copy.attachResumeFirstDescription
              : copy.parseResumeFirstDescription}
          </p>
          {prerequisite.status === "resume_missing" ? (
            <Button
              asChild
              className="mt-3 rounded-xl"
              size="sm"
              variant="outline"
            >
              <Link href={prerequisite.createResumeHref}>
                {copy.createResume}
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="mt-3 rounded-xl"
              size="sm"
              variant="outline"
            >
              <Link href={prerequisite.resumeHref}>
                {copy.openResume} {prerequisite.resumeTitle}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DiagnosisReport({
  diagnosis,
  dictionary,
}: {
  diagnosis: Diagnosis;
  dictionary: Pick<AppDictionary, "common" | "workspace">;
}) {
  const copy = dictionary.workspace.applicationDetail.diagnosis;
  const verdict = VERDICT_STYLES[diagnosis.hrThreeSecondVerdict];
  const VerdictIcon = verdict.icon;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[10rem_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-secondary/20 p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            {copy.overallScore}
          </p>
          <p className="mt-2 text-4xl font-semibold text-foreground">
            {Math.round(diagnosis.overallScore)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">/ 100</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap gap-2">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                verdict.className
              )}
            >
              <VerdictIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.verdictLabels[diagnosis.hrThreeSecondVerdict]}
            </div>
            <div className="inline-flex items-center rounded-full border border-border bg-secondary/30 px-3 py-1 text-xs font-medium text-muted-foreground">
              {copy.verdictLevelLabels[diagnosis.verdictLevel]}
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-foreground">
            {diagnosis.summary}
          </p>
        </div>
      </div>

      <RadarScores dictionary={dictionary} scores={diagnosis.radarScores} />
      <ReportList
        emptyLabel={copy.noStrengthsReturned}
        title={copy.strengths}
        items={diagnosis.strengths}
      />
      <GapsList
        dictionary={dictionary}
        gaps={diagnosis.gaps}
        title={copy.gaps}
      />
      <ReportList
        emptyLabel={copy.noRecommendedActionsReturned}
        title={copy.recommendedActions}
        items={diagnosis.recommendedActions}
      />
      <RewriteTargetsList
        dictionary={dictionary}
        targets={diagnosis.rewriteTargets}
        title={copy.rewriteTargets}
      />
      <ReportList
        emptyLabel={copy.noWarningsReturned}
        title={copy.warnings}
        items={diagnosis.warnings}
      />
    </div>
  );
}

function RadarScores({
  dictionary,
  scores,
}: {
  dictionary: Pick<AppDictionary, "workspace">;
  scores: Diagnosis["radarScores"];
}) {
  const copy = dictionary.workspace.applicationDetail.diagnosis;
  const rows = [
    ["skills", scores.skills],
    ["experience", scores.experience],
    ["projects", scores.projects],
    ["keywords", scores.keywords],
    ["seniority", scores.seniority],
  ] as const;

  return (
    <section>
      <h3 className="text-sm font-medium text-foreground">
        {copy.radarScores}
      </h3>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {rows.map(([key, score]) => (
          <div
            key={key}
            className="rounded-xl border border-border bg-secondary/20 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-muted-foreground">
                {copy.radarScoreLabels[key]}
              </p>
              <p className="text-sm font-medium text-foreground">
                {Math.round(score)}
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.round(score)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportList({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: string[];
  title: string;
}) {
  return (
    <section>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="rounded-xl border border-border bg-secondary/20 px-4 py-3 text-sm leading-6 text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
          {emptyLabel}
        </p>
      )}
    </section>
  );
}

function GapsList({
  dictionary,
  gaps,
  title,
}: {
  dictionary: Pick<AppDictionary, "workspace">;
  gaps: Diagnosis["gaps"];
  title: string;
}) {
  const copy = dictionary.workspace.applicationDetail.diagnosis;

  return (
    <section>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {gaps.length > 0 ? (
        <div className="mt-2 space-y-2">
          {gaps.map((gap) => (
            <div
              key={`${gap.label}-${gap.evidence}`}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm leading-6",
                GAP_STYLES[gap.severity]
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{gap.label}</span>
                <span className="rounded-full border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground">
                  {copy.severityLabels[gap.severity]}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">{gap.evidence}</p>
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                {copy.recommendation}
              </p>
              <p className="mt-1 text-foreground">{gap.recommendation}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
          {copy.noGapsReturned}
        </p>
      )}
    </section>
  );
}

function RewriteTargetsList({
  dictionary,
  targets,
  title,
}: {
  dictionary: Pick<AppDictionary, "workspace">;
  targets: Diagnosis["rewriteTargets"];
  title: string;
}) {
  const copy = dictionary.workspace.applicationDetail.diagnosis;

  return (
    <section>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {targets.length > 0 ? (
        <div className="mt-2 space-y-3">
          {targets.map((target) => (
            <div
              key={`${target.resumeBulletId}-${target.originalText}`}
              className="rounded-xl border border-border bg-card p-4 text-sm leading-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-secondary/30 px-2 py-0.5 text-xs text-muted-foreground">
                  {copy.priorityLabels[target.priority]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {copy.displayOnly}
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                {copy.originalBullet}
              </p>
              <p className="mt-1 text-foreground">{target.originalText}</p>
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                {copy.reason}
              </p>
              <p className="mt-1 text-muted-foreground">{target.reason}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
          {copy.noRewriteTargetsReturned}
        </p>
      )}
    </section>
  );
}
