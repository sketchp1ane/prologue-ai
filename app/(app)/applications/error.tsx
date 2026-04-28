"use client";

import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";

export default function ApplicationsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Applications could not load"
      description="Refresh the route or return to the applications list before trying again."
      secondaryAction={{
        href: "/applications",
        label: "Applications",
      }}
    >
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset} className="gap-2 rounded-xl">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/applications/new">New Application</Link>
        </Button>
      </div>
    </EmptyState>
  );
}
