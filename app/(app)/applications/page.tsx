import { Briefcase } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";

export default function ApplicationsPage() {
  return (
    <EmptyState
      icon={Briefcase}
      eyebrow="Applications"
      title="Application tracking starts here."
      description="A calm board for companies, roles, stages, and job descriptions will sit behind this route as the workspace grows."
      statusLabel="Placeholder"
    />
  );
}
