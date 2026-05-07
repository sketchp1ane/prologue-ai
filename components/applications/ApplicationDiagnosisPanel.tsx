"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  ListChecks,
  Loader2,
  RefreshCcw,
  Sparkles,
  Target,
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
    accent: "oklch(0.47 0.08 155)",
    badgeClassName:
      "border-emerald-200/80 bg-emerald-50/70 text-emerald-900",
    levelClassName: "border-emerald-200/70 bg-card text-emerald-800",
    progressClassName: "bg-emerald-700/70",
    icon: CheckCircle2,
  },
  possible_match: {
    accent: "oklch(0.58 0.09 76)",
    badgeClassName: "border-amber-200/80 bg-amber-50/70 text-amber-900",
    levelClassName: "border-amber-200/70 bg-card text-amber-800",
    progressClassName: "bg-amber-700/70",
    icon: Sparkles,
  },
  weak_match: {
    accent: "oklch(0.53 0.1 20)",
    badgeClassName: "border-rose-200/80 bg-rose-50/70 text-rose-900",
    levelClassName: "border-rose-200/70 bg-card text-rose-800",
    progressClassName: "bg-rose-700/70",
    icon: AlertTriangle,
  },
} satisfies Record<
  Diagnosis["hrThreeSecondVerdict"],
  {
    accent: string;
    badgeClassName: string;
    levelClassName: string;
    progressClassName: string;
    icon: LucideIcon;
  }
>;

const GAP_STYLES = {
  high: {
    chip: "border-rose-200/80 bg-rose-50/70 text-rose-900",
    rail: "bg-rose-700/60",
  },
  medium: {
    chip: "border-amber-200/80 bg-amber-50/70 text-amber-900",
    rail: "bg-amber-700/60",
  },
  low: {
    chip: "border-emerald-200/80 bg-emerald-50/70 text-emerald-900",
    rail: "bg-emerald-700/55",
  },
} satisfies Record<
  Diagnosis["gaps"][number]["severity"],
  {
    chip: string;
    rail: string;
  }
>;

const PRIORITY_STYLES = {
  high: "border-rose-200/80 bg-rose-50/70 text-rose-900",
  medium: "border-amber-200/80 bg-amber-50/70 text-amber-900",
  low: "border-border bg-secondary/40 text-muted-foreground",
} satisfies Record<Diagnosis["rewriteTargets"][number]["priority"], string>;

const SCORE_TRACK = "oklch(0.94 0 0)";

const DIAGNOSIS_NAV_SECTIONS = [
  {
    icon: Sparkles,
    id: "summary",
    labelKey: "summarySection",
  },
  {
    icon: Target,
    id: "scores",
    labelKey: "radarScores",
  },
  {
    icon: CheckCircle2,
    id: "strengths",
    labelKey: "strengths",
  },
  {
    icon: AlertTriangle,
    id: "gaps",
    labelKey: "gaps",
  },
  {
    icon: ListChecks,
    id: "actions",
    labelKey: "recommendedActions",
  },
  {
    icon: Sparkles,
    id: "rewriteTargets",
    labelKey: "rewriteTargets",
  },
  {
    icon: AlertTriangle,
    id: "warnings",
    labelKey: "warnings",
  },
] as const;

type DiagnosisNavSection = (typeof DIAGNOSIS_NAV_SECTIONS)[number];
type DiagnosisSectionId = DiagnosisNavSection["id"];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    if (hasEnteredView) {
      return;
    }

    const element = ref.current;

    if (!element) {
      return;
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      const frameId = requestAnimationFrame(() => setHasEnteredView(true));

      return () => cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setHasEnteredView(true);
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasEnteredView]);

  return [ref, hasEnteredView] as const;
}

function useAnimatedNumber(
  value: number,
  duration = 800,
  enabled = true,
  delay = 0
) {
  const target = clampScore(value);
  const [displayedValue, setDisplayedValue] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      previousValueRef.current = target;
      const frameId = requestAnimationFrame(() => setDisplayedValue(target));

      return () => cancelAnimationFrame(frameId);
    }

    let timeoutId = 0;
    let frameId = 0;

    timeoutId = window.setTimeout(() => {
      const startValue = previousValueRef.current;
      const startedAt = performance.now();

      function tick(now: number) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const nextValue = startValue + (target - startValue) * easedProgress;

        setDisplayedValue(Math.round(nextValue));

        if (progress < 1) {
          frameId = requestAnimationFrame(tick);
          return;
        }

        previousValueRef.current = target;
        setDisplayedValue(target);
      }

      frameId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(frameId);
    };
  }, [delay, duration, enabled, target]);

  return displayedValue;
}

function useAnimatedProgress(value: number, enabled = true) {
  const target = clampScore(value);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let firstFrameId = 0;
    let secondFrameId = 0;

    if (prefersReducedMotion) {
      firstFrameId = requestAnimationFrame(() => setProgress(target));

      return () => cancelAnimationFrame(firstFrameId);
    }

    firstFrameId = requestAnimationFrame(() => {
      setProgress(0);
      secondFrameId = requestAnimationFrame(() => setProgress(target));
    });

    return () => {
      cancelAnimationFrame(firstFrameId);
      cancelAnimationFrame(secondFrameId);
    };
  }, [enabled, target]);

  return progress;
}

function getScoreScale(score: number) {
  return clampScore(score) / 100;
}

function useActiveDiagnosisSection() {
  const [activeSection, setActiveSection] =
    useState<DiagnosisSectionId>("summary");
  const sectionRefs = useRef<
    Partial<Record<DiagnosisSectionId, HTMLDivElement | null>>
  >({});

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              first.boundingClientRect.top - second.boundingClientRect.top
          );
        const nextSection = visibleEntries[0]?.target.getAttribute(
          "data-diagnosis-section"
        ) as DiagnosisSectionId | null;

        if (nextSection) {
          setActiveSection(nextSection);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0, 0.2, 0.6],
      }
    );

    DIAGNOSIS_NAV_SECTIONS.forEach((section) => {
      const element = sectionRefs.current[section.id];

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  function getSectionRef(id: DiagnosisSectionId) {
    return (node: HTMLDivElement | null) => {
      sectionRefs.current[id] = node;
    };
  }

  function scrollToSection(id: DiagnosisSectionId) {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return {
    activeSection,
    getSectionRef,
    scrollToSection,
  };
}

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
  const score = clampScore(diagnosis.overallScore);
  const [summaryRef, hasSummaryEnteredView] = useInViewOnce<HTMLElement>();
  const { activeSection, getSectionRef, scrollToSection } =
    useActiveDiagnosisSection();

  return (
    <div className="flex flex-col gap-7">
      <DiagnosisSectionNav
        activeSection={activeSection}
        copy={copy}
        onSelect={scrollToSection}
      />

      <div
        id="diagnosis-section-summary"
        ref={getSectionRef("summary")}
        className="scroll-mt-28"
        data-diagnosis-section="summary"
      >
        <section
          ref={summaryRef}
          className="diagnosis-reveal rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
        >
          <div className="grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-center">
            <div className="flex items-center gap-4 lg:flex-col lg:justify-center lg:gap-3 lg:text-center">
              <ScoreRing
                accent={verdict.accent}
                enabled={hasSummaryEnteredView}
                label={copy.overallScore}
                score={score}
              />
              <div className="min-w-0 lg:w-full">
                <AnimatedScoreBar
                  className={verdict.progressClassName}
                  enabled={hasSummaryEnteredView}
                  score={score}
                />
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {copy.verdictLevelLabels[diagnosis.verdictLevel]}
                </p>
              </div>
            </div>

            <div className="min-w-0 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                    verdict.badgeClassName
                  )}
                >
                  <VerdictIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.verdictLabels[diagnosis.hrThreeSecondVerdict]}
                </div>
                <div
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                    verdict.levelClassName
                  )}
                >
                  {copy.verdictLevelLabels[diagnosis.verdictLevel]}
                </div>
              </div>
              <p className="mt-4 max-w-4xl text-base font-medium leading-7 text-foreground sm:text-[1.05rem] sm:leading-8">
                {diagnosis.summary}
              </p>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {copy.description}
              </p>
            </div>
          </div>
        </section>
      </div>

      <DiagnosisSectionFrame
        id="scores"
        refCallback={getSectionRef("scores")}
      >
        <RadarScores dictionary={dictionary} scores={diagnosis.radarScores} />
      </DiagnosisSectionFrame>
      <DiagnosisSectionFrame
        id="strengths"
        refCallback={getSectionRef("strengths")}
      >
        <StrengthsList
          emptyLabel={copy.noStrengthsReturned}
          title={copy.strengths}
          items={diagnosis.strengths}
        />
      </DiagnosisSectionFrame>
      <DiagnosisSectionFrame id="gaps" refCallback={getSectionRef("gaps")}>
        <GapsList
          dictionary={dictionary}
          gaps={diagnosis.gaps}
          title={copy.gaps}
        />
      </DiagnosisSectionFrame>
      <DiagnosisSectionFrame
        id="actions"
        refCallback={getSectionRef("actions")}
      >
        <RecommendedActionsList
          emptyLabel={copy.noRecommendedActionsReturned}
          title={copy.recommendedActions}
          items={diagnosis.recommendedActions}
        />
      </DiagnosisSectionFrame>
      <DiagnosisSectionFrame
        id="rewriteTargets"
        refCallback={getSectionRef("rewriteTargets")}
      >
        <RewriteTargetsList
          dictionary={dictionary}
          targets={diagnosis.rewriteTargets}
          title={copy.rewriteTargets}
        />
      </DiagnosisSectionFrame>
      <DiagnosisSectionFrame
        id="warnings"
        refCallback={getSectionRef("warnings")}
      >
        <WarningsList
          emptyLabel={copy.noWarningsReturned}
          title={copy.warnings}
          items={diagnosis.warnings}
        />
      </DiagnosisSectionFrame>
    </div>
  );
}

function DiagnosisSectionNav({
  activeSection,
  copy,
  onSelect,
}: {
  activeSection: DiagnosisSectionId;
  copy: Pick<
    AppDictionary["workspace"]["applicationDetail"]["diagnosis"],
    | "gaps"
    | "radarScores"
    | "recommendedActions"
    | "rewriteTargets"
    | "sectionNavigation"
    | "strengths"
    | "summarySection"
    | "warnings"
  >;
  onSelect: (id: DiagnosisSectionId) => void;
}) {
  return (
    <nav
      aria-label={copy.sectionNavigation}
      className="sticky top-20 z-10 -mx-1 overflow-x-auto rounded-2xl border border-border bg-card/95 p-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/85"
    >
      <div className="flex w-max min-w-full justify-center gap-1">
        {DIAGNOSIS_NAV_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "border-border bg-secondary text-foreground shadow-xs"
                  : "border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(section.id)}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {copy[section.labelKey]}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DiagnosisSectionFrame({
  children,
  id,
  refCallback,
}: {
  children: ReactNode;
  id: DiagnosisSectionId;
  refCallback: (node: HTMLDivElement | null) => void;
}) {
  return (
    <div
      id={`diagnosis-section-${id}`}
      ref={refCallback}
      className="scroll-mt-28"
      data-diagnosis-section={id}
    >
      {children}
    </div>
  );
}

function ScoreRing({
  accent,
  enabled,
  label,
  score,
}: {
  accent: string;
  enabled: boolean;
  label: string;
  score: number;
}) {
  const animatedScore = useAnimatedNumber(score, 800, enabled);
  const animatedProgress = useAnimatedProgress(score, enabled);
  const ringOffset = 100 - animatedProgress;

  return (
    <div className="relative grid size-32 shrink-0 place-items-center rounded-full">
      <svg
        className="absolute inset-0 size-full -rotate-90"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          fill="none"
          pathLength="100"
          r="52"
          stroke={SCORE_TRACK}
          strokeWidth="10"
        />
        <circle
          className="diagnosis-ring-progress"
          cx="60"
          cy="60"
          fill="none"
          pathLength="100"
          r="52"
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset="var(--ring-offset)"
          strokeWidth="10"
          style={
            {
              "--ring-offset": ringOffset.toString(),
              stroke: accent,
            } as CSSProperties
          }
        />
      </svg>
      <div className="grid size-[6.2rem] place-items-center rounded-full border border-border bg-card shadow-inner">
        <div className="text-center">
          <p className="text-[11px] font-medium text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-4xl font-semibold leading-none text-foreground tabular-nums">
            {animatedScore}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">/ 100</p>
        </div>
      </div>
    </div>
  );
}

function AnimatedScoreBar({
  className,
  delay = 0,
  duration = 650,
  enabled = true,
  score,
}: {
  className?: string;
  delay?: number;
  duration?: number;
  enabled?: boolean;
  score: number;
}) {
  const animatedProgress = useAnimatedProgress(score, enabled);
  const scoreScale = getScoreScale(animatedProgress);

  return (
    <div className="h-2 overflow-hidden rounded-full bg-secondary ring-1 ring-border/60">
      <div
        className={cn(
          "diagnosis-score-bar-fill h-full rounded-full",
          className ?? "bg-primary"
        )}
        style={
          {
            "--score-delay": `${delay}ms`,
            "--score-duration": `${duration}ms`,
            "--score-scale": scoreScale.toString(),
          } as CSSProperties
        }
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
  const [scoresRef, hasScoresEnteredView] = useInViewOnce<HTMLElement>();
  const rows = [
    ["skills", scores.skills],
    ["experience", scores.experience],
    ["projects", scores.projects],
    ["keywords", scores.keywords],
    ["seniority", scores.seniority],
  ] as const;

  return (
    <section ref={scoresRef} className="diagnosis-reveal">
      <SectionTitle icon={Target} title={copy.radarScores} />
      <div className="mt-3 rounded-2xl border border-border bg-secondary/15 p-4 shadow-sm">
        {rows.map(([key, score], index) => {
          const rowDelay = index * 80;

          return (
            <div
              key={key}
              className="grid gap-2 border-b border-border/70 py-3 last:border-b-0 last:pb-0 sm:grid-cols-[7rem_minmax(0,1fr)_3rem] sm:items-center"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {copy.radarScoreLabels[key]}
              </p>
              <AnimatedScoreBar
                delay={rowDelay}
                duration={650}
                enabled={hasScoresEnteredView}
                score={score}
              />
              <AnimatedNumber
                className="text-sm font-medium text-foreground tabular-nums sm:text-right"
                delay={rowDelay}
                duration={650}
                enabled={hasScoresEnteredView}
                value={score}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AnimatedNumber({
  className,
  delay = 0,
  duration = 800,
  enabled = true,
  value,
}: {
  className?: string;
  delay?: number;
  duration?: number;
  enabled?: boolean;
  value: number;
}) {
  const displayedValue = useAnimatedNumber(value, duration, enabled, delay);

  return <p className={className}>{displayedValue}</p>;
}

function RevealSection({
  children,
  icon,
  title,
}: {
  children: (hasEnteredView: boolean) => ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  const [sectionRef, hasEnteredView] = useInViewOnce<HTMLElement>();

  return (
    <section ref={sectionRef}>
      <SectionTitle icon={icon} title={title} />
      {children(hasEnteredView)}
    </section>
  );
}

function RevealCard({
  as: Comp = "div",
  children,
  className,
  index,
  visible,
}: {
  as?: "div" | "li";
  children: ReactNode;
  className?: string;
  index: number;
  visible: boolean;
}) {
  return (
    <Comp
      className={cn("diagnosis-card-reveal", className)}
      data-visible={visible}
      style={
        {
          "--reveal-delay": `${index * 70}ms`,
        } as CSSProperties
      }
    >
      {children}
    </Comp>
  );
}

function StrengthsList({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: string[];
  title: string;
}) {
  return (
    <RevealSection icon={CheckCircle2} title={title}>
      {(visible) =>
        items.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {items.map((item, index) => (
              <RevealCard
                key={`${item}-${index}`}
                as="li"
                className="flex gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground shadow-sm"
                index={index}
                visible={visible}
              >
                <span
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-700/60"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </RevealCard>
            ))}
          </ul>
        ) : (
          <RevealCard
            className="mt-2 rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-3 text-sm leading-6 text-muted-foreground"
            index={0}
            visible={visible}
          >
            {emptyLabel}
          </RevealCard>
        )
      }
    </RevealSection>
  );
}

function RecommendedActionsList({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: string[];
  title: string;
}) {
  return (
    <RevealSection icon={ListChecks} title={title}>
      {(visible) =>
        items.length > 0 ? (
          <ol className="mt-3 space-y-2">
            {items.map((item, index) => (
              <RevealCard
                key={`${item}-${index}`}
                as="li"
                className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground shadow-sm"
                index={index}
                visible={visible}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/80 bg-amber-50/70 text-xs font-semibold text-amber-900">
                  {index + 1}
                </span>
                <span className="pt-1">{item}</span>
              </RevealCard>
            ))}
          </ol>
        ) : (
          <RevealCard
            className="mt-2 rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-3 text-sm leading-6 text-muted-foreground"
            index={0}
            visible={visible}
          >
            {emptyLabel}
          </RevealCard>
        )
      }
    </RevealSection>
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
    <RevealSection icon={AlertTriangle} title={title}>
      {(visible) =>
        gaps.length > 0 ? (
          <div className="mt-3 space-y-3">
            {gaps.map((gap, index) => {
              const styles = GAP_STYLES[gap.severity];

              return (
                <RevealCard
                  key={`${gap.label}-${gap.evidence}-${index}`}
                  className="relative overflow-hidden rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6 shadow-sm"
                  index={index}
                  visible={visible}
                >
                  <span
                    className={cn("absolute inset-y-0 left-0 w-1", styles.rail)}
                    aria-hidden="true"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">
                      {gap.label}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        styles.chip
                      )}
                    >
                      {copy.severityLabels[gap.severity]}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{gap.evidence}</p>
                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                    {copy.recommendation}
                  </p>
                  <p className="mt-1 text-foreground">{gap.recommendation}</p>
                </RevealCard>
              );
            })}
          </div>
        ) : (
          <RevealCard
            className="mt-2 rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-3 text-sm leading-6 text-muted-foreground"
            index={0}
            visible={visible}
          >
            {copy.noGapsReturned}
          </RevealCard>
        )
      }
    </RevealSection>
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
    <RevealSection icon={Sparkles} title={title}>
      {(visible) =>
        targets.length > 0 ? (
          <div className="mt-3 space-y-3">
            {targets.map((target, index) => (
              <RevealCard
                key={`${target.resumeBulletId}-${target.originalText}-${index}`}
                className="rounded-xl border border-border bg-card p-4 text-sm leading-6 shadow-sm"
                index={index}
                visible={visible}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium",
                      PRIORITY_STYLES[target.priority]
                    )}
                  >
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
              </RevealCard>
            ))}
          </div>
        ) : (
          <RevealCard
            className="mt-2 rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-3 text-sm leading-6 text-muted-foreground"
            index={0}
            visible={visible}
          >
            {copy.noRewriteTargetsReturned}
          </RevealCard>
        )
      }
    </RevealSection>
  );
}

function WarningsList({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: string[];
  title: string;
}) {
  return (
    <RevealSection icon={AlertTriangle} title={title}>
      {(visible) =>
        items.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {items.map((item, index) => (
              <RevealCard
                key={`${item}-${index}`}
                as="li"
                className="flex gap-3 rounded-xl border border-rose-200/70 bg-card px-4 py-3 text-sm leading-6 text-foreground shadow-sm"
                index={index}
                visible={visible}
              >
                <AlertTriangle
                  className="mt-1 h-4 w-4 shrink-0 text-rose-800/80"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </RevealCard>
            ))}
          </ul>
        ) : (
          <RevealCard
            className="mt-2 rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-3 text-sm leading-6 text-muted-foreground"
            index={0}
            visible={visible}
          >
            {emptyLabel}
          </RevealCard>
        )
      }
    </RevealSection>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary/30 text-primary">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
    </div>
  );
}
