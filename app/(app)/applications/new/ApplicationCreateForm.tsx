"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { FileSearch, Loader2, Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createApplicationAction } from "../actions";
import {
  APPLICATION_COMPANY_MAX_LENGTH,
  APPLICATION_JD_MAX_LENGTH,
  APPLICATION_JD_MIN_LENGTH,
  APPLICATION_LOCATION_MAX_LENGTH,
  APPLICATION_ROLE_MAX_LENGTH,
} from "@/src/lib/validations/application";
import type { JdExtract } from "@/src/lib/ai/schemas/jd-extract";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(value: string[]) {
  return value.join("\n");
}

function SaveApplicationButton({
  dictionary,
}: {
  dictionary: Pick<AppDictionary, "common" | "workspace">;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="rounded-xl" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Save className="h-4 w-4" aria-hidden="true" />
      )}
      {pending
        ? dictionary.common.saving
        : dictionary.workspace.applicationCreate.saveApplication}
    </Button>
  );
}

type ApplicationCreateFormProps = {
  dictionary: Pick<AppDictionary, "applicationStages" | "common" | "workspace">;
  initialError?: string | null;
  resumes: {
    id: string;
    title: string;
  }[];
};

export function ApplicationCreateForm({
  dictionary,
  initialError,
  resumes,
}: ApplicationCreateFormProps) {
  const copy = dictionary.workspace.applicationCreate;
  const [jdText, setJdText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [location, setLocation] = useState("");
  const [seniority, setSeniority] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [preferredSkills, setPreferredSkills] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [keywords, setKeywords] = useState("");
  const [warnings, setWarnings] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [extractError, setExtractError] = useState<string | null>(
    initialError ?? null
  );
  const [isExtracting, startExtract] = useTransition();

  const extractPayload = useMemo<JdExtract>(
    () => ({
      companyName: companyName.trim() || null,
      roleTitle: roleTitle.trim() || null,
      location: location.trim() || null,
      seniority: seniority.trim() || null,
      employmentType: employmentType.trim() || null,
      requiredSkills: splitLines(requiredSkills),
      preferredSkills: splitLines(preferredSkills),
      responsibilities: splitLines(responsibilities),
      keywords: splitLines(keywords),
      confidence,
      warnings: splitLines(warnings),
    }),
    [
      companyName,
      confidence,
      employmentType,
      keywords,
      location,
      preferredSkills,
      requiredSkills,
      responsibilities,
      roleTitle,
      seniority,
      warnings,
    ]
  );

  function applyExtract(extract: JdExtract) {
    setCompanyName(extract.companyName ?? "");
    setRoleTitle(extract.roleTitle ?? "");
    setLocation(extract.location ?? "");
    setSeniority(extract.seniority ?? "");
    setEmploymentType(extract.employmentType ?? "");
    setRequiredSkills(joinLines(extract.requiredSkills));
    setPreferredSkills(joinLines(extract.preferredSkills));
    setResponsibilities(joinLines(extract.responsibilities));
    setKeywords(joinLines(extract.keywords));
    setWarnings(joinLines(extract.warnings));
    setConfidence(extract.confidence);
  }

  function handleExtract() {
    setExtractError(null);

    const trimmedJdText = jdText.trim();

    if (trimmedJdText.length === 0) {
      setExtractError(copy.extractEmpty);
      return;
    }

    if (trimmedJdText.length < APPLICATION_JD_MIN_LENGTH) {
      setExtractError(
        copy.extractTooShort.replace(
          "{count}",
          String(APPLICATION_JD_MIN_LENGTH)
        )
      );
      return;
    }

    startExtract(async () => {
      try {
        const response = await fetch("/api/applications/extract-jd", {
          body: JSON.stringify({ jdText: trimmedJdText }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const body = (await response.json()) as {
          data?: JdExtract;
          error?: { message?: string };
        };

        if (!response.ok || !body.data) {
          setExtractError(copy.extractFailed);
          return;
        }

        applyExtract(body.data);
      } catch {
        setExtractError(copy.extractConnectionFailed);
      }
    });
  }

  return (
    <form action={createApplicationAction} className="grid gap-6 lg:grid-cols-2">
      <input
        type="hidden"
        name="jdExtractJson"
        value={JSON.stringify(extractPayload)}
      />

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileSearch className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">
              {copy.jobDescriptionTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {copy.jobDescriptionDescription}
            </p>
          </div>
        </div>

        <label htmlFor="jdText" className="text-sm font-medium text-foreground">
          {copy.pastedJd}
        </label>
        <textarea
          id="jdText"
          name="jdText"
          required
          maxLength={APPLICATION_JD_MAX_LENGTH}
          value={jdText}
          onChange={(event) => setJdText(event.target.value)}
          rows={22}
          placeholder={copy.pastedJdPlaceholder}
          className="mt-2 min-h-[34rem] w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {copy.maxCharacters.replace(
              "{count}",
              APPLICATION_JD_MAX_LENGTH.toLocaleString()
            )}
          </p>
          <Button
            type="button"
            onClick={handleExtract}
            disabled={isExtracting}
            className="rounded-xl"
          >
            {isExtracting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {copy.extractJd}
          </Button>
        </div>
        {extractError && (
          <div
            className="mt-4 rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive shadow-sm"
            role="alert"
            aria-live="polite"
          >
            {extractError}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-base font-medium text-foreground">
            {copy.reviewTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.reviewDescription}
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="companyName"
                className="text-sm font-medium text-foreground"
              >
                {copy.companyName}
              </label>
              <input
                id="companyName"
                name="companyName"
                required
                maxLength={APPLICATION_COMPANY_MAX_LENGTH}
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="roleTitle"
                className="text-sm font-medium text-foreground"
              >
                {copy.roleTitle}
              </label>
              <input
                id="roleTitle"
                name="roleTitle"
                required
                maxLength={APPLICATION_ROLE_MAX_LENGTH}
                value={roleTitle}
                onChange={(event) => setRoleTitle(event.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-secondary/20 p-4">
            <label
              htmlFor="resumeId"
              className="text-sm font-medium text-foreground"
            >
              {copy.attachedResume}
            </label>
            {resumes.length > 0 ? (
              <>
                <select
                  id="resumeId"
                  name="resumeId"
                  defaultValue=""
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">{copy.noResumeAttached}</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  {copy.resumeOptional}
                </p>
              </>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                {copy.noResumesYet}{" "}
                <Link href="/resumes/new" className="text-foreground underline">
                  {copy.pasteResume}
                </Link>{" "}
                {copy.attachResumeHint}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-sm font-medium text-foreground"
              >
                {copy.location}
              </label>
              <input
                id="location"
                name="location"
                maxLength={APPLICATION_LOCATION_MAX_LENGTH}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="stage"
                className="text-sm font-medium text-foreground"
              >
                {copy.stage}
              </label>
              <select
                id="stage"
                name="stage"
                defaultValue="PREPARING"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="PREPARING">
                  {dictionary.applicationStages.PREPARING}
                </option>
                <option value="APPLIED">
                  {dictionary.applicationStages.APPLIED}
                </option>
                <option value="COMMUNICATING">
                  {dictionary.applicationStages.COMMUNICATING}
                </option>
                <option value="INTERVIEWING">
                  {dictionary.applicationStages.INTERVIEWING}
                </option>
                <option value="OFFER">{dictionary.applicationStages.OFFER}</option>
                <option value="ARCHIVED">
                  {dictionary.applicationStages.ARCHIVED}
                </option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={copy.seniority}
              value={seniority}
              onChange={setSeniority}
            />
            <TextField
              label={copy.employmentType}
              value={employmentType}
              onChange={setEmploymentType}
            />
          </div>

          <LineListField
            label={copy.requiredSkills}
            placeholder={copy.oneItemPerLine}
            value={requiredSkills}
            onChange={setRequiredSkills}
          />
          <LineListField
            label={copy.preferredSkills}
            placeholder={copy.oneItemPerLine}
            value={preferredSkills}
            onChange={setPreferredSkills}
          />
          <LineListField
            label={copy.responsibilities}
            placeholder={copy.oneItemPerLine}
            value={responsibilities}
            onChange={setResponsibilities}
          />
          <LineListField
            label={copy.keywords}
            placeholder={copy.oneItemPerLine}
            value={keywords}
            onChange={setKeywords}
          />
          <LineListField
            label={copy.warnings}
            placeholder={copy.oneItemPerLine}
            value={warnings}
            onChange={setWarnings}
          />

          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {copy.confidence}
              </span>
              <span className="text-muted-foreground">
                {Math.round(confidence * 100)}%
              </span>
            </div>
            <input
              aria-label={copy.confidence}
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={confidence}
              onChange={(event) => setConfidence(Number(event.target.value))}
              className="mt-3 w-full accent-primary"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <SaveApplicationButton dictionary={dictionary} />
        </div>
      </section>
    </form>
  );
}

function TextField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    </div>
  );
}

function LineListField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    </div>
  );
}
