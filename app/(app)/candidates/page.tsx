import { Users } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";

export default function CandidatesPage() {
  return (
    <>
      <PageHeader
        title="Candidates"
        description="Manage candidate profiles and comparisons."
      />
      <EmptyState
        icon={Users}
        title="Candidate tracking starts here"
        description="Create multiple candidate profiles to tailor your applications for different roles and industries. Compare strengths and optimize your positioning."
        action={{
          label: "Create Profile",
          icon: Users,
        }}
      />
    </>
  );
}
