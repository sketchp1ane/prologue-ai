"use client";

import type { ApplicationStage } from "@prisma/client";
import Link from "next/link";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
  Paperclip,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  AppCard,
  AppCardContent,
  AppCardHeader,
} from "@/components/app/AppCard";
import { ApplicationJdDrawers } from "@/components/applications/ApplicationJdDrawers";
import { ApplicationResumeSelect } from "@/components/applications/ApplicationResumeSelect";
import { ApplicationStageSelect } from "@/components/applications/ApplicationStageSelect";
import { Button } from "@/components/ui/button";
import type { JdExtract } from "@/src/lib/ai/schemas/jd-extract";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";
import { cn } from "@/src/lib/utils";

type StageOption = {
  label: string;
  value: ApplicationStage;
};

type ExtractState =
  | { status: "missing"; data: null }
  | { status: "invalid"; data: null }
  | { status: "valid"; data: JdExtract };

type ResumeOption = {
  id: string;
  status: string;
  title: string;
  updatedAtLabel: string;
};

type ResumePreview = {
  href: string;
  status: string;
  title: string;
  updatedAtLabel: string;
} | null;

type ApplicationContextRailProps = {
  applicationId: string;
  children: ReactNode;
  currentResumeId: string | null;
  currentStage: ApplicationStage;
  details: {
    companyName: string;
    createdAtLabel: string;
    hasLocation: boolean;
    locationLabel: string;
    roleTitle: string;
    updatedAtLabel: string;
  };
  dictionary: Pick<
    AppDictionary,
    "applicationStages" | "common" | "workspace"
  >;
  extract: ExtractState;
  jdText: string;
  resumePreview: ResumePreview;
  resumeSelectLabel: string;
  resumes: ResumeOption[];
  stageLabel: string;
  stageOptions: StageOption[];
};

type RailSection = "details" | "jd" | "resume" | "stage";

export function ApplicationContextRail({
  applicationId,
  children,
  currentResumeId,
  currentStage,
  details,
  dictionary,
  extract,
  jdText,
  resumePreview,
  resumeSelectLabel,
  resumes,
  stageLabel,
  stageOptions,
}: ApplicationContextRailProps) {
  const copy = dictionary.workspace.applicationDetail;
  const [expanded, setExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<RailSection | null>(null);
  const railScrollRef = useRef<HTMLDivElement | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const sectionRefs = useRef<Record<RailSection, HTMLDivElement | null>>({
    details: null,
    jd: null,
    resume: null,
    stage: null,
  });
  const shortcuts: Array<{
    icon: LucideIcon;
    id: RailSection;
    label: string;
  }> = [
    {
      icon: BriefcaseBusiness,
      id: "stage",
      label: copy.currentStage,
    },
    {
      icon: MapPin,
      id: "details",
      label: copy.detailsTitle,
    },
    {
      icon: FileText,
      id: "jd",
      label: copy.jdMaterials,
    },
    {
      icon: Paperclip,
      id: "resume",
      label: copy.attachedResume,
    },
  ];

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  function handleShortcut(section: RailSection) {
    setExpanded(true);
    setActiveSection(section);

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setActiveSection(null);
    }, 1200);

    window.requestAnimationFrame(() => {
      const railScroll = railScrollRef.current;
      const target = sectionRefs.current[section];

      if (!railScroll || !target) {
        return;
      }

      railScroll.scrollTo({
        behavior: "smooth",
        top: Math.max(target.offsetTop - 12, 0),
      });
    });
  }

  return (
    <div
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_4.5rem] lg:items-start"
    >
      <div className="min-w-0">{children}</div>

      <aside className="lg:sticky lg:top-24 lg:flex lg:justify-end lg:self-start">
        <div
          className={cn(
            "context-rail-shell relative hidden max-h-[calc(100dvh-7rem)] shrink-0 overflow-hidden rounded-2xl border border-border bg-card outline-none lg:flex lg:flex-col",
            expanded
              ? "h-[calc(100dvh-7rem)] w-[22rem] shadow-xl shadow-foreground/10"
              : "h-[17.75rem] w-[4.5rem] shadow-sm"
          )}
          data-state={expanded ? "open" : "closed"}
        >
          <div
            className="context-rail-collapsed absolute inset-0 flex flex-col items-center px-3 py-3"
            aria-hidden={expanded}
          >
            <p className="sr-only">{copy.contextRailTitle}</p>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mb-4 rounded-xl"
              aria-label={
                expanded ? copy.collapseContextRail : copy.expandContextRail
              }
              title={
                expanded ? copy.collapseContextRail : copy.expandContextRail
              }
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <div className="flex flex-col items-center gap-4">
              {shortcuts.map((shortcut) => {
                const Icon = shortcut.icon;

                return (
                  <Button
                    key={shortcut.id}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-xl",
                      activeSection === shortcut.id &&
                        "bg-secondary text-foreground"
                    )}
                    aria-label={shortcut.label}
                    title={shortcut.label}
                    onClick={() => handleShortcut(shortcut.id)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                );
              })}
            </div>
          </div>

          <div
            className="context-rail-expanded absolute inset-0 flex min-h-0 flex-col"
            aria-hidden={!expanded}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                {copy.contextRailTitle}
              </p>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-xl"
                aria-label={copy.collapseContextRail}
                title={copy.collapseContextRail}
                onClick={() => setExpanded(false)}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div
              ref={railScrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
            >
              <div className="space-y-5">
                <RailSectionCard
                  active={activeSection === "stage"}
                  refCallback={(node) => {
                    sectionRefs.current.stage = node;
                  }}
                >
                  <AppCard>
                    <AppCardHeader title={copy.currentStage} />
                    <AppCardContent>
                      <ApplicationStageSelect
                        applicationId={applicationId}
                        currentStage={currentStage}
                        dictionary={dictionary}
                        label={stageLabel}
                        options={stageOptions}
                      />
                    </AppCardContent>
                  </AppCard>
                </RailSectionCard>

                <RailSectionCard
                  active={activeSection === "details"}
                  refCallback={(node) => {
                    sectionRefs.current.details = node;
                  }}
                >
                  <ApplicationDetailsCard
                    details={details}
                    dictionary={dictionary}
                  />
                </RailSectionCard>

                <RailSectionCard
                  active={activeSection === "jd"}
                  refCallback={(node) => {
                    sectionRefs.current.jd = node;
                  }}
                >
                  <JdMaterialsCard
                    dictionary={dictionary}
                    extract={extract}
                    jdText={jdText}
                  />
                </RailSectionCard>

                <RailSectionCard
                  active={activeSection === "resume"}
                  refCallback={(node) => {
                    sectionRefs.current.resume = node;
                  }}
                >
                  <AttachedResumeCard
                    applicationId={applicationId}
                    currentResumeId={currentResumeId}
                    dictionary={dictionary}
                    resumePreview={resumePreview}
                    resumes={resumes}
                    resumeSelectLabel={resumeSelectLabel}
                  />
                </RailSectionCard>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:hidden">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-foreground">
              {copy.contextRailTitle}
            </p>
          </div>

          <AppCard>
            <AppCardHeader title={copy.currentStage} />
            <AppCardContent>
              <ApplicationStageSelect
                applicationId={applicationId}
                currentStage={currentStage}
                dictionary={dictionary}
                label={stageLabel}
                options={stageOptions}
              />
            </AppCardContent>
          </AppCard>

          <ApplicationDetailsCard details={details} dictionary={dictionary} />

          <JdMaterialsCard
            dictionary={dictionary}
            extract={extract}
            jdText={jdText}
          />

          <AttachedResumeCard
            applicationId={applicationId}
            currentResumeId={currentResumeId}
            dictionary={dictionary}
            resumePreview={resumePreview}
            resumes={resumes}
            resumeSelectLabel={resumeSelectLabel}
          />
        </div>
      </aside>
    </div>
  );
}

function RailSectionCard({
  active,
  children,
  refCallback,
}: {
  active: boolean;
  children: ReactNode;
  refCallback: (node: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={refCallback}
      className={cn(
        "rounded-2xl transition-[box-shadow,transform] duration-300",
        active && "shadow-[0_0_0_2px_hsl(var(--foreground)/0.08)]"
      )}
    >
      {children}
    </div>
  );
}

function ApplicationDetailsCard({
  details,
  dictionary,
}: {
  details: ApplicationContextRailProps["details"];
  dictionary: ApplicationContextRailProps["dictionary"];
}) {
  const copy = dictionary.workspace.applicationDetail;

  return (
    <AppCard>
      <AppCardHeader
        title={copy.detailsTitle}
        description={copy.detailsDescription}
      />
      <AppCardContent className="space-y-3 text-sm">
        <MetaRow label={copy.company} value={details.companyName} />
        <MetaRow label={copy.role} value={details.roleTitle} />
        <MetaRow
          label={copy.location}
          value={details.locationLabel}
          icon={details.hasLocation ? MapPin : undefined}
        />
        <MetaRow
          label={dictionary.common.created}
          value={details.createdAtLabel}
        />
        <MetaRow
          label={dictionary.common.updated}
          value={details.updatedAtLabel}
        />
      </AppCardContent>
    </AppCard>
  );
}

function JdMaterialsCard({
  dictionary,
  extract,
  jdText,
}: {
  dictionary: ApplicationContextRailProps["dictionary"];
  extract: ExtractState;
  jdText: string;
}) {
  const copy = dictionary.workspace.applicationDetail;

  return (
    <AppCard>
      <AppCardHeader
        title={copy.jdMaterials}
        description={copy.jdMaterialsDescription}
      />
      <AppCardContent>
        <ApplicationJdDrawers
          dictionary={dictionary}
          extract={extract}
          jdText={jdText}
        />
      </AppCardContent>
    </AppCard>
  );
}

function AttachedResumeCard({
  applicationId,
  currentResumeId,
  dictionary,
  resumePreview,
  resumes,
  resumeSelectLabel,
}: {
  applicationId: string;
  currentResumeId: string | null;
  dictionary: ApplicationContextRailProps["dictionary"];
  resumePreview: ResumePreview;
  resumes: ResumeOption[];
  resumeSelectLabel: string;
}) {
  const copy = dictionary.workspace.applicationDetail;

  return (
    <AppCard>
      <AppCardHeader
        title={copy.attachedResume}
        description={copy.attachedResumeDescription}
        action={
          resumes.length > 0 ? (
            <ApplicationResumeSelect
              applicationId={applicationId}
              currentResumeId={currentResumeId}
              dictionary={dictionary}
              label={resumeSelectLabel}
              resumes={resumes}
            />
          ) : undefined
        }
      />
      <AppCardContent className="space-y-4">
        {resumePreview ? (
          <Link
            href={resumePreview.href}
            className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-3 transition hover:border-primary/20"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
              <FileText className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {resumePreview.title}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {resumePreview.status} · {resumePreview.updatedAtLabel}
              </span>
            </span>
          </Link>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
            {copy.noResumeAttached}
          </div>
        )}

        {resumes.length === 0 && (
          <p className="text-sm leading-6 text-muted-foreground">
            {copy.noResumesYet}{" "}
            <Link href="/resumes/new" className="text-foreground underline">
              {copy.pasteResume}
            </Link>{" "}
            {copy.attachOneHere}
          </p>
        )}
      </AppCardContent>
    </AppCard>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-right text-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {value}
      </span>
    </div>
  );
}
