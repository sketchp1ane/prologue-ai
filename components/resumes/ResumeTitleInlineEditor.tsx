"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";

type ResumeTitleInlineEditorProps = {
  action: (formData: FormData) => void | Promise<void>;
  copy: AppDictionary["workspace"]["resumeDetail"]["actions"];
  resumeId: string;
  title: string;
  titleMaxLength: number;
};

export function ResumeTitleInlineEditor({
  action,
  copy,
  resumeId,
  title,
  titleMaxLength,
}: ResumeTitleInlineEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [isPending, startTransition] = useTransition();

  function cancelEditing() {
    setDraftTitle(title);
    setEditing(false);
  }

  function saveTitle() {
    const formData = new FormData();

    formData.set("id", resumeId);
    formData.set("title", draftTitle);

    startTransition(() => {
      void action(formData);
    });
  }

  if (editing) {
    return (
      <span className="inline-flex max-w-full flex-wrap items-center gap-2">
        <input
          type="text"
          value={draftTitle}
          maxLength={titleMaxLength}
          disabled={isPending}
          onChange={(event) => setDraftTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              saveTitle();
            }

            if (event.key === "Escape") {
              cancelEditing();
            }
          }}
          className="h-10 min-w-0 max-w-full rounded-xl border border-input bg-background px-3 text-2xl font-semibold tracking-tight text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-3xl"
          aria-label={copy.editTitle}
          autoFocus
        />
        <Button
          type="button"
          size="icon-sm"
          className="rounded-xl"
          onClick={saveTitle}
          disabled={isPending}
          aria-label={copy.saveTitle}
          title={copy.saveTitle}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-xl"
          onClick={cancelEditing}
          disabled={isPending}
          aria-label={copy.cancelTitle}
          title={copy.cancelTitle}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </span>
    );
  }

  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <span className="min-w-0 truncate">{title}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
        onClick={() => setEditing(true)}
        aria-label={copy.editTitle}
        title={copy.editTitle}
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </span>
  );
}
