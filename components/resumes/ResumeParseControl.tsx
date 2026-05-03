"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type ResumeParseControlProps = {
  hasParsedJson: boolean;
  hasSourceText: boolean;
  resumeId: string;
  status: string;
};

type ParseResponse = {
  data?: {
    bulletCount: number;
    resumeId: string;
    status: string;
  };
  error?: {
    message?: string;
  };
};

export function ResumeParseControl({
  hasParsedJson,
  hasSourceText,
  resumeId,
  status,
}: ResumeParseControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isParsing = isPending || status === "PARSING";
  const isFailed = status === "FAILED";

  function handleParse() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/resumes/${resumeId}/parse`, {
          method: "POST",
        });
        const body = (await response.json()) as ParseResponse;

        if (!response.ok || !body.data) {
          setError(
            body.error?.message ??
              "Could not parse this resume. Check the source text and try again."
          );
          router.refresh();
          return;
        }

        setMessage(
          `Parsed resume and refreshed ${body.data.bulletCount} bullet records.`
        );
        router.refresh();
      } catch {
        setError(
          "Could not reach Resume Parse. Check your connection and try again."
        );
      }
    });
  }

  if (!hasSourceText) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm leading-6 text-muted-foreground">
        Resume Parse is available for pasted-text resumes. Add source text in a
        new resume version to parse it.
      </div>
    );
  }

  const label = isParsing
    ? "Parsing..."
    : isFailed
      ? "Retry parse"
      : hasParsedJson
        ? "Re-parse"
        : "Parse Resume";

  return (
    <div className="space-y-3">
      {isFailed && (
        <div className="flex gap-2 rounded-xl border border-destructive/30 bg-card px-3 py-2 text-xs leading-5 text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Parsing failed. Retry with the saved source text below.
        </div>
      )}
      <Button
        type="button"
        onClick={handleParse}
        disabled={isParsing}
        className="w-full rounded-xl"
      >
        {isParsing ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : hasParsedJson || isFailed ? (
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        )}
        {label}
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        Parsing uses the saved source text and regenerates structured resume
        bullets.
      </p>
      {message && (
        <p className="text-xs leading-5 text-muted-foreground" aria-live="polite">
          {message}
        </p>
      )}
      {error && (
        <p className="text-xs leading-5 text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
