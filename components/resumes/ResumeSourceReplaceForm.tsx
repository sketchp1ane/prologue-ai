"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, FileText, FileUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";
import { cn } from "@/src/lib/utils";

type ResumeSourceReplaceCopy =
  AppDictionary["workspace"]["resumeDetail"]["replaceSource"];
type ResumeSourceType = "pasted_text" | "pdf";

type ResumeSourceReplaceFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  copy: ResumeSourceReplaceCopy;
  pdfMaxBytes: number;
  resumeId: string;
  sourceTextMaxLength: number;
};

export function ResumeSourceReplaceForm({
  action,
  copy,
  pdfMaxBytes,
  resumeId,
  sourceTextMaxLength,
}: ResumeSourceReplaceFormProps) {
  const [sourceType, setSourceType] = useState<ResumeSourceType>("pasted_text");
  const [sourceText, setSourceText] = useState("");
  const [fileName, setFileName] = useState("");
  const isPastedText = sourceType === "pasted_text";
  const pdfMaxMegabytes = Math.floor(pdfMaxBytes / 1024 / 1024);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={resumeId} />
      <input type="hidden" name="sourceType" value={sourceType} />

      <div className="rounded-xl border border-border bg-secondary/20 p-3 text-xs leading-5 text-muted-foreground">
        <div className="flex gap-2">
          <AlertTriangle
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{copy.warning}</span>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-2"
        role="group"
        aria-label={copy.chooseSource}
      >
        <SourceButton
          active={isPastedText}
          icon={<FileText className="h-4 w-4" aria-hidden="true" />}
          label={copy.pastedText}
          onClick={() => setSourceType("pasted_text")}
        />
        <SourceButton
          active={!isPastedText}
          icon={<FileUp className="h-4 w-4" aria-hidden="true" />}
          label={copy.pdf}
          onClick={() => setSourceType("pdf")}
        />
      </div>

      <div className={cn("space-y-2", !isPastedText && "sr-only")}>
        <label
          htmlFor="replace-source-text"
          className="text-sm font-medium text-foreground"
        >
          {copy.pastedTextLabel}
        </label>
        <textarea
          id="replace-source-text"
          name="sourceText"
          required={isPastedText}
          disabled={!isPastedText}
          maxLength={sourceTextMaxLength}
          rows={8}
          value={sourceText}
          onChange={(event) => setSourceText(event.target.value)}
          placeholder={copy.pastedTextPlaceholder}
          className="min-h-40 w-full resize-y rounded-xl border border-input bg-background px-3 py-3 font-mono text-sm leading-6 text-foreground outline-none transition placeholder:font-sans focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <p className="text-xs leading-5 text-muted-foreground">
          {copy.maxCharacters.replace(
            "{count}",
            sourceTextMaxLength.toLocaleString()
          )}
        </p>
      </div>

      <div className={cn("space-y-2", isPastedText && "sr-only")}>
        <label
          htmlFor="replace-pdf-file"
          className="text-sm font-medium text-foreground"
        >
          {copy.pdfLabel}
        </label>
        <input
          id="replace-pdf-file"
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

      <Button type="submit" className="w-full rounded-xl">
        {isPastedText ? (
          <FileText className="h-4 w-4" aria-hidden="true" />
        ) : (
          <FileUp className="h-4 w-4" aria-hidden="true" />
        )}
        {copy.submit}
      </Button>
    </form>
  );
}

function SourceButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
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
        "flex min-w-0 items-center justify-center gap-2 rounded-xl border-[0.5px] bg-background px-3 py-2 text-center text-sm font-medium text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        active
          ? "border-primary bg-primary/[0.03]"
          : "border-border hover:border-primary/20 hover:bg-secondary/30"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-[0.5px]",
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-secondary/30 text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}
