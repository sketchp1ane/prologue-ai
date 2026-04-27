import { BarChart3 } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Track your job search progress and performance."
      />
      <EmptyState
        icon={BarChart3}
        title="Analytics coming soon"
        description="Get detailed insights into your job search performance, including application success rates, interview conversion, and response times."
        statusLabel="Coming Soon"
      />
    </>
  );
}
