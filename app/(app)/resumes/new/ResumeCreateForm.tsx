"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  FileUp,
  ShieldCheck,
} from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { Button } from "@/components/ui/button";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";
import { cn } from "@/src/lib/utils";

type ResumeCreateCopy = AppDictionary["workspace"]["resumeCreate"];
type ResumeCreateSourceType = "pasted_text" | "pdf";

type ResumeCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  cancelLabel: string;
  copy: ResumeCreateCopy;
  pdfMaxBytes: number;
  sourceTextMaxLength: number;
  titleMaxLength: number;
};

export function ResumeCreateForm({
  action,
  cancelLabel,
  copy,
  pdfMaxBytes,
  sourceTextMaxLength,
  titleMaxLength,
}: ResumeCreateFormProps) {
  const [sourceType, setSourceType] =
    useState<ResumeCreateSourceType>("pasted_text");
  const [sourceText, setSourceText] = useState("");
  const [fileName, setFileName] = useState("");
  const isPastedText = sourceType === "pasted_text";
  const pdfMaxMegabytes = Math.floor(pdfMaxBytes / 1024 / 1024);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <AppCard padding="lg">
        <form action={action} className="space-y-6">
          <input type="hidden" name="sourceType" value={sourceType} />

          <div className="flex items-start gap-4 border-b border-border pb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/5 text-primary">
              {isPastedText ? (
                <FileText className="h-5 w-5" aria-hidden="true" />
              ) : (
                <FileUp className="h-5 w-5" aria-hidden="true" />
              )}
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
              maxLength={titleMaxLength}
              placeholder={copy.resumeTitlePlaceholder}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              {copy.chooseSource}
            </p>
            <div
              className="grid gap-3 sm:grid-cols-2"
              role="group"
              aria-label={copy.chooseSource}
            >
              <SourceOption
                active={isPastedText}
                description={copy.pastedTextOptionDescription}
                icon={<FileText className="h-4 w-4" aria-hidden="true" />}
                label={copy.pastedTextOption}
                onClick={() => setSourceType("pasted_text")}
              />
              <SourceOption
                active={!isPastedText}
                description={copy.pdfOptionDescription}
                icon={<FileUp className="h-4 w-4" aria-hidden="true" />}
                label={copy.pdfOption}
                onClick={() => setSourceType("pdf")}
              />
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              {copy.mutualExclusionHint}
            </p>
          </div>

          <div className={cn("space-y-2", !isPastedText && "sr-only")}>
            <label
              htmlFor="sourceText"
              className="text-sm font-medium text-foreground"
            >
              {copy.pastedResumeText}
            </label>
            <textarea
              id="sourceText"
              name="sourceText"
              required={isPastedText}
              disabled={!isPastedText}
              maxLength={sourceTextMaxLength}
              placeholder={copy.pastedResumePlaceholder}
              rows={16}
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              className="min-h-[24rem] w-full resize-y rounded-xl border border-input bg-background px-3 py-3 font-mono text-sm leading-6 text-foreground outline-none transition placeholder:font-sans focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <p className="text-xs text-muted-foreground">
              {copy.maxCharacters.replace(
                "{count}",
                sourceTextMaxLength.toLocaleString()
              )}
            </p>
          </div>

          <div className={cn("space-y-2", isPastedText && "sr-only")}>
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
              required={!isPastedText}
              disabled={isPastedText}
              accept="application/pdf,.pdf"
              onChange={(event) =>
                setFileName(event.target.files?.[0]?.name ?? "")
              }
              className="block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              {copy.pdfHint.replace("{size}", String(pdfMaxMegabytes))}
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              {fileName
                ? copy.selectedPdf.replace("{name}", fileName)
                : copy.noPdfSelected}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/resumes">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {cancelLabel}
              </Link>
            </Button>
            <Button type="submit" className="rounded-xl">
              {isPastedText ? (
                <FileText className="h-4 w-4" aria-hidden="true" />
              ) : (
                <FileUp className="h-4 w-4" aria-hidden="true" />
              )}
              {isPastedText ? copy.createTextResume : copy.uploadPdfResume}
            </Button>
          </div>
        </form>
      </AppCard>

      <AppCard padding="lg" className="h-fit">
        <div className="flex items-start gap-3 border-b border-border pb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary/30 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">
              {copy.sideTitle}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isPastedText
                ? copy.pastedTextSideDescription
                : copy.pdfSideDescription}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-5">
          <SideNote>{copy.draftPreserved}</SideNote>
          <SideNote>{copy.parseLater}</SideNote>
          <div className="rounded-xl border border-border bg-secondary/20 p-4 text-xs leading-5 text-muted-foreground">
            {isPastedText
              ? copy.pastedTextPrivacyNotice
              : copy.privacyNotice}
          </div>
        </div>
      </AppCard>
    </div>
  );
}

function SourceOption({
  active,
  description,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex min-h-28 items-start gap-3 rounded-xl border bg-background p-4 text-left outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        active
          ? "border-primary bg-primary/[0.03]"
          : "border-border hover:border-primary/20 hover:bg-secondary/30"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-secondary/30 text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          {label}
          {active && (
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
          )}
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}

function SideNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
      <CheckCircle2
        className="mt-1 h-4 w-4 shrink-0 text-primary"
        aria-hidden="true"
      />
      <span>{children}</span>
    </div>
  );
}
