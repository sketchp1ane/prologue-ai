"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, FileText, Settings, X } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";

import { updateApplicationResumeAction } from "@/app/(app)/applications/actions";
import { Button } from "@/components/ui/button";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";
import { cn } from "@/src/lib/utils";

type ResumeOption = {
  id: string;
  status: string;
  title: string;
  updatedAtLabel: string;
};

type ApplicationResumeSelectProps = {
  applicationId: string;
  currentResumeId: string | null;
  dictionary: Pick<AppDictionary, "common" | "workspace">;
  label: string;
  resumes: ResumeOption[];
};

const initialState = {
  error: null,
  status: "idle" as const,
};

export function ApplicationResumeSelect({
  applicationId,
  currentResumeId,
  dictionary,
  label,
  resumes,
}: ApplicationResumeSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(currentResumeId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const controlsCopy = dictionary.workspace.applicationControls;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setError(null);
      setSelectedResumeId(currentResumeId ?? "");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    startTransition(() => {
      void updateApplicationResumeAction(initialState, formData).then(
        (nextState) => {
          if (nextState.error) {
            setError(nextState.error);
            return;
          }

          setOpen(false);
        }
      );
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-xl border-[0.5px]"
          aria-label={controlsCopy.configureAttachedResume}
          title={controlsCopy.configureAttachedResume}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-primary/10 outline-none sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <Dialog.Title className="text-base font-medium text-foreground">
                {controlsCopy.updateAttachedResume}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
                {label}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-xl border-[0.5px]"
                aria-label={dictionary.common.cancel}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 pt-5">
            <input type="hidden" name="applicationId" value={applicationId} />
            <fieldset className="space-y-2">
              <legend className="sr-only">{label}</legend>
              <ResumeChoice
                checked={selectedResumeId === ""}
                id=""
                metadata={dictionary.common.notSpecified}
                onSelect={setSelectedResumeId}
                title={controlsCopy.noResumeAttached}
              />
              {resumes.map((resume) => (
                <ResumeChoice
                  key={resume.id}
                  checked={selectedResumeId === resume.id}
                  id={resume.id}
                  metadata={`${resume.status} · ${resume.updatedAtLabel}`}
                  onSelect={setSelectedResumeId}
                  title={resume.title}
                />
              ))}
            </fieldset>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                >
                  {dictionary.common.cancel}
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                className="rounded-xl"
                disabled={isPending}
              >
                {isPending ? dictionary.common.saving : dictionary.common.save}
              </Button>
            </div>

            {error && (
              <p className="text-sm leading-6 text-muted-foreground">
                {error}
              </p>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ResumeChoice({
  checked,
  id,
  metadata,
  onSelect,
  title,
}: {
  checked: boolean;
  id: string;
  metadata: string;
  onSelect: (id: string) => void;
  title: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition",
        checked
          ? "border-primary/25 bg-secondary/40"
          : "border-border bg-card hover:border-primary/20 hover:bg-secondary/20"
      )}
    >
      <input
        type="radio"
        name="resumeId"
        value={id}
        checked={checked}
        onChange={() => onSelect(id)}
        className="sr-only"
      />
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
        <FileText className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {metadata}
        </span>
      </span>
      <span
        className={cn(
          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-transparent"
        )}
        aria-hidden="true"
      >
        <Check className="h-3 w-3" />
      </span>
    </label>
  );
}
