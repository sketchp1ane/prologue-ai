import { MessageSquare } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";

export default function InterviewsPage() {
  return (
    <EmptyState
      icon={MessageSquare}
      eyebrow="Interviews"
      title="Interview notes will have their own quiet space."
      description="Questions, reflections, and review summaries will be organized here once interview workflows are introduced."
      statusLabel="Placeholder"
    />
  );
}
