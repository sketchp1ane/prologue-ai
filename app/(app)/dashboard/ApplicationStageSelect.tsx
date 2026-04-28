"use client";

import { useActionState, useId } from "react";

import { updateApplicationStageAction } from "./actions";

type StageOption = {
  label: string;
  value: string;
};

type ApplicationStageSelectProps = {
  applicationId: string;
  currentStage: string;
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
  label,
  options,
}: ApplicationStageSelectProps) {
  const selectId = useId();
  const [state, formAction, isPending] = useActionState(
    updateApplicationStageAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-1.5">
      <input type="hidden" name="applicationId" value={applicationId} />
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <select
        id={selectId}
        name="stage"
        defaultValue={currentStage}
        disabled={isPending}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button type="submit" className="sr-only">
        Update stage
      </button>
      {isPending && (
        <p className="text-[11px] text-muted-foreground">Saving...</p>
      )}
      {state.error && (
        <p className="text-[11px] text-muted-foreground">{state.error}</p>
      )}
    </form>
  );
}
