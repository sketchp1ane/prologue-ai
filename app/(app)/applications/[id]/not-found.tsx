import Link from "next/link";
import { AlertCircle, ArrowLeft, LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";

export default function ApplicationNotFound() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Application not found"
      description="This application may have been removed, or it may not belong to the current workspace."
    >
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/applications">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Applications
          </Link>
        </Button>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
        </Button>
      </div>
    </EmptyState>
  );
}
