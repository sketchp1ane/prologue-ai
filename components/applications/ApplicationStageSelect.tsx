"use client";

import type { ApplicationStage } from "@prisma/client";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useActionState, useId, useRef, useState } from "react";

import { updateApplicationStageAction } from "@/app/(app)/applications/actions";
import {
  APPLICATION_STAGE_THEME,
  isApplicationStageValue,
} from "@/src/lib/applications/stage-metadata";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";
import { cn } from "@/src/lib/utils";

type StageOption = {
  label: string;
  value: ApplicationStage;
};

type ApplicationStageSelectProps = {
  applicationId: string;
  currentStage: ApplicationStage;
  dictionary: Pick<AppDictionary, "common" | "workspace">;
  label: string;
  options: StageOption[];
};

const initialState = {
  error: null,
  status: "idle" as const,
};

export function ApplicationStageSelect({
  applicationId,
  currentStage,
  dictionary,
  label,
  options,
}: ApplicationStageSelectProps) {
  const selectId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const stageInputRef = useRef<HTMLInputElement>(null);
  const [selectedStage, setSelectedStage] = useState(currentStage);
  const [state, formAction, isPending] = useActionState(
    updateApplicationStageAction,
    initialState
  );
  const selectedTheme = APPLICATION_STAGE_THEME[selectedStage];

  function handleStageChange(nextStage: string) {
    if (!isApplicationStageValue(nextStage)) {
      return;
    }

    setSelectedStage(nextStage);

    if (stageInputRef.current) {
      stageInputRef.current.value = nextStage;
    }

    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-1.5">
      <input type="hidden" name="applicationId" value={applicationId} />
      <input
        ref={stageInputRef}
        type="hidden"
        name="stage"
        defaultValue={currentStage}
      />
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <Select.Root
        value={selectedStage}
        disabled={isPending}
        onValueChange={handleStageChange}
      >
        <Select.Trigger
          id={selectId}
          aria-label={label}
          className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition hover:bg-secondary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn("h-2 w-2 shrink-0 rounded-full", selectedTheme.dot)}
              aria-hidden="true"
            />
            <Select.Value />
          </span>
          <Select.Icon asChild>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl"
            position="popper"
            sideOffset={6}
          >
            <Select.Viewport>
              {options.map((option) => {
                const theme = APPLICATION_STAGE_THEME[option.value];

                return (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    className="relative flex h-9 cursor-pointer select-none items-center gap-2 rounded-lg px-8 text-sm outline-none transition data-[highlighted]:bg-secondary data-[highlighted]:text-foreground data-[state=checked]:bg-secondary/60"
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        theme.dot
                      )}
                      aria-hidden="true"
                    />
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </Select.ItemIndicator>
                  </Select.Item>
                );
              })}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <button type="submit" className="sr-only">
        {dictionary.workspace.applicationControls.updateStage}
      </button>
      {isPending && (
        <p className="text-[11px] text-muted-foreground">
          {dictionary.common.saving}
        </p>
      )}
      {state.error && (
        <p className="text-[11px] text-muted-foreground">{state.error}</p>
      )}
    </form>
  );
}
