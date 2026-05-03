import Link from "next/link";
import { AlertCircle, ArrowLeft, LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";

export default async function ApplicationNotFound() {
  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);

  return (
    <EmptyState
      icon={AlertCircle}
      title={dictionary.workspace.applications.notFoundTitle}
      description={dictionary.workspace.applications.notFoundDescription}
    >
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/applications">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {dictionary.workspace.applicationDetail.applications}
          </Link>
        </Button>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            {dictionary.workspace.applicationDetail.dashboard}
          </Link>
        </Button>
      </div>
    </EmptyState>
  );
}
