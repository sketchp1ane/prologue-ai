"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, Info, Trash2, Upload, X } from "lucide-react";

import { ResumeSourceReplaceForm } from "@/components/resumes/ResumeSourceReplaceForm";
import { Button } from "@/components/ui/button";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";
import { cn } from "@/src/lib/utils";

type ResumeDetailActionsCopy =
  AppDictionary["workspace"]["resumeDetail"]["actions"];
type ResumeReplaceSourceCopy =
  AppDictionary["workspace"]["resumeDetail"]["replaceSource"];

type ResumeDetailIconActionsProps = {
  actionsCopy: ResumeDetailActionsCopy;
  backHref: string;
  backLabel: string;
  bulletCount: number;
  createdAtLabel: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  detailCopy: Pick<
    AppDictionary["workspace"]["resumeDetail"],
    | "bulletRecords"
    | "deleteDescription"
    | "deleteResume"
    | "deleteTitle"
    | "detailsDescription"
    | "detailsTitle"
    | "parsedJson"
    | "source"
    | "status"
  >;
  parsedJsonLabel: string;
  pdfMaxBytes: number;
  replaceAction: (formData: FormData) => void | Promise<void>;
  replaceCopy: ResumeReplaceSourceCopy;
  resumeId: string;
  sourceLabel: string;
  sourceTextMaxLength: number;
  statusLabel: string;
  updatedAtLabel: string;
};

export function ResumeDetailIconActions({
  actionsCopy,
  backHref,
  backLabel,
  bulletCount,
  createdAtLabel,
  deleteAction,
  detailCopy,
  parsedJsonLabel,
  pdfMaxBytes,
  replaceAction,
  replaceCopy,
  resumeId,
  sourceLabel,
  sourceTextMaxLength,
  statusLabel,
  updatedAtLabel,
}: ResumeDetailIconActionsProps) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div
        className="flex flex-wrap items-center justify-end gap-2"
        aria-label={actionsCopy.toolbarLabel}
      >
        <IconButton
          asChild
          ariaLabel={backLabel}
          title={backLabel}
          variant="outline"
        >
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </IconButton>

        <DetailDialog
          actionsCopy={actionsCopy}
          bulletCount={bulletCount}
          createdAtLabel={createdAtLabel}
          detailCopy={detailCopy}
          parsedJsonLabel={parsedJsonLabel}
          sourceLabel={sourceLabel}
          statusLabel={statusLabel}
          updatedAtLabel={updatedAtLabel}
        />

        <SourceDialog
          actionsCopy={actionsCopy}
          action={replaceAction}
          copy={replaceCopy}
          pdfMaxBytes={pdfMaxBytes}
          resumeId={resumeId}
          sourceTextMaxLength={sourceTextMaxLength}
        />

        <DeleteDialog
          action={deleteAction}
          actionsCopy={actionsCopy}
          detailCopy={detailCopy}
          resumeId={resumeId}
        />
      </div>
    </div>
  );
}

function DetailDialog({
  actionsCopy,
  bulletCount,
  createdAtLabel,
  detailCopy,
  parsedJsonLabel,
  sourceLabel,
  statusLabel,
  updatedAtLabel,
}: {
  actionsCopy: ResumeDetailActionsCopy;
  bulletCount: number;
  createdAtLabel: string;
  detailCopy: ResumeDetailIconActionsProps["detailCopy"];
  parsedJsonLabel: string;
  sourceLabel: string;
  statusLabel: string;
  updatedAtLabel: string;
}) {
  return (
    <AppDialog
      title={detailCopy.detailsTitle}
      description={detailCopy.detailsDescription}
      trigger={
        <IconButton
          ariaLabel={actionsCopy.details}
          title={actionsCopy.details}
          type="button"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      }
    >
      <div className="space-y-3 text-sm">
        <MetaRow label={detailCopy.status} value={statusLabel} />
        <MetaRow label={actionsCopy.created} value={createdAtLabel} />
        <MetaRow label={actionsCopy.updated} value={updatedAtLabel} />
        <MetaRow label={detailCopy.source} value={sourceLabel} />
        <MetaRow label={detailCopy.parsedJson} value={parsedJsonLabel} />
        <MetaRow
          label={detailCopy.bulletRecords}
          value={bulletCount.toString()}
        />
      </div>
    </AppDialog>
  );
}

function SourceDialog({
  action,
  actionsCopy,
  copy,
  pdfMaxBytes,
  resumeId,
  sourceTextMaxLength,
}: {
  action: (formData: FormData) => void | Promise<void>;
  actionsCopy: ResumeDetailActionsCopy;
  copy: ResumeReplaceSourceCopy;
  pdfMaxBytes: number;
  resumeId: string;
  sourceTextMaxLength: number;
}) {
  return (
    <AppDialog
      title={copy.title}
      description={copy.description}
      trigger={
        <IconButton
          ariaLabel={actionsCopy.upload}
          title={actionsCopy.upload}
          type="button"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      }
    >
      <ResumeSourceReplaceForm
        action={action}
        copy={copy}
        pdfMaxBytes={pdfMaxBytes}
        resumeId={resumeId}
        sourceTextMaxLength={sourceTextMaxLength}
      />
    </AppDialog>
  );
}

function DeleteDialog({
  action,
  actionsCopy,
  detailCopy,
  resumeId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  actionsCopy: ResumeDetailActionsCopy;
  detailCopy: ResumeDetailIconActionsProps["detailCopy"];
  resumeId: string;
}) {
  return (
    <AppDialog
      title={detailCopy.deleteTitle}
      description={detailCopy.deleteDescription}
      trigger={
        <IconButton
          ariaLabel={actionsCopy.delete}
          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          title={actionsCopy.delete}
          type="button"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      }
    >
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={resumeId} />
        <p className="rounded-xl border border-destructive/20 bg-card p-3 text-sm leading-6 text-muted-foreground">
          {actionsCopy.deleteWarning}
        </p>
        <Button
          type="submit"
          variant="outline"
          className="w-full rounded-xl border-[0.5px] border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {detailCopy.deleteResume}
        </Button>
      </form>
    </AppDialog>
  );
}

function AppDialog({
  children,
  description,
  title,
  trigger,
}: {
  children: ReactNode;
  description: string;
  title: string;
  trigger: ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-primary/10 outline-none sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <Dialog.Title className="text-base font-medium text-foreground">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-xl border-[0.5px]"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="pt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function IconButton({
  ariaLabel,
  asChild = false,
  children,
  className,
  disabled,
  onClick,
  title,
  type = "button",
  variant = "outline",
}: {
  ariaLabel: string;
  asChild?: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  title: string;
  type?: "button" | "submit";
  variant?: "outline" | "default";
}) {
  return (
    <Button
      aria-label={ariaLabel}
      asChild={asChild}
      className={cn("size-10 rounded-xl", className)}
      disabled={disabled}
      onClick={onClick}
      size="icon"
      title={title}
      type={type}
      variant={variant}
    >
      {children}
    </Button>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}
