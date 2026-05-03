"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";

type ResumeListDeleteButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  copy: Pick<
    AppDictionary["workspace"]["resumeDetail"],
    "deleteDescription" | "deleteResume" | "deleteTitle"
  >;
  actionsCopy: Pick<
    AppDictionary["workspace"]["resumeDetail"]["actions"],
    "delete" | "deleteWarning"
  >;
  resumeId: string;
};

export function ResumeListDeleteButton({
  action,
  actionsCopy,
  copy,
  resumeId,
}: ResumeListDeleteButtonProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="ml-auto rounded-lg border-[0.5px] border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={actionsCopy.delete}
          title={actionsCopy.delete}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-primary/10 outline-none sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <Dialog.Title className="text-base font-medium text-foreground">
                {copy.deleteTitle}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
                {copy.deleteDescription}
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
          <form action={action} className="space-y-4 pt-5">
            <input type="hidden" name="id" value={resumeId} />
            <input type="hidden" name="returnTo" value="/resumes" />
            <p className="rounded-xl border border-destructive/20 bg-card p-3 text-sm leading-6 text-muted-foreground">
              {actionsCopy.deleteWarning}
            </p>
            <Button
              type="submit"
              variant="outline"
              className="w-full rounded-xl border-[0.5px] border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {copy.deleteResume}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
