import { FileText } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";

export default function ResumesPage() {
  return (
    <EmptyState
      icon={FileText}
      eyebrow="Resumes"
      title="Your resume workspace starts here."
      description="Uploaded resumes, pasted text, parsed profiles, and rewrite entry points will be organized from this page."
      statusLabel="Placeholder"
    />
  );
}
