"use client";

import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_LOCALE,
  isAppLocale,
  type AppLocale,
} from "@/src/lib/i18n/config";
import { dictionaries } from "@/src/lib/i18n/dictionaries";

function getDocumentLocale(): AppLocale {
  if (typeof document === "undefined") {
    return DEFAULT_LOCALE;
  }

  return isAppLocale(document.documentElement.lang)
    ? document.documentElement.lang
    : DEFAULT_LOCALE;
}

export default function ApplicationsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dictionary = dictionaries[getDocumentLocale()];

  return (
    <EmptyState
      icon={AlertCircle}
      title={dictionary.workspace.applications.errorTitle}
      description={dictionary.workspace.applications.errorDescription}
      secondaryAction={{
        href: "/applications",
        label: dictionary.workspace.applicationDetail.applications,
      }}
    >
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset} className="gap-2 rounded-xl">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {dictionary.common.retry}
        </Button>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/applications/new">
            {dictionary.appShell.actions.newApplication}
          </Link>
        </Button>
      </div>
    </EmptyState>
  );
}
