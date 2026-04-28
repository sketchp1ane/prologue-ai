"use client";

import { useActionState, useId } from "react";

import { updateApplicationResumeAction } from "@/app/(app)/applications/actions";

type ResumeOption = {
  id: string;
  title: string;
};

type ApplicationResumeSelectProps = {
  applicationId: string;
  currentResumeId: string | null;
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
  label,
  resumes,
}: ApplicationResumeSelectProps) {
  const selectId = useId();
  const [state, formAction, isPending] = useActionState(
    updateApplicationResumeAction,
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
        name="resumeId"
        defaultValue={currentResumeId ?? ""}
        disabled={isPending || resumes.length === 0}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">No resume attached</option>
        {resumes.map((resume) => (
          <option key={resume.id} value={resume.id}>
            {resume.title}
          </option>
        ))}
      </select>
      <button type="submit" className="sr-only">
        Update attached resume
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
