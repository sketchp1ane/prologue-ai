import { LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";

export default function DashboardPage() {
  return (
    <EmptyState
      icon={LayoutDashboard}
      eyebrow="Dashboard"
      title="Your job-search command center will live here."
      description="This overview will bring together application momentum, weekly progress, and the next best action in one focused surface."
      statusLabel="Placeholder"
    />
  );
}
