import { FileText, Plus, Upload } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";

export default function ResumesPage() {
  // This would typically check if user has resumes
  const hasResumes = false;

  if (!hasResumes) {
    return (
      <>
        <PageHeader
          title="Resume Builder"
          description="Create and manage your tailored resumes."
          action={{
            label: "Upload Resume",
            icon: Upload,
          }}
        />
        <EmptyState
          icon={FileText}
          title="Your resume workspace starts here"
          description="Upload your resume to get AI-powered analysis, bullet rewrites, and job-specific tailoring suggestions. Track multiple versions for different roles."
          action={{
            label: "Upload Resume",
            icon: Upload,
          }}
          secondaryAction={{
            label: "Paste from LinkedIn",
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Resume Builder"
        description="Create and manage your tailored resumes."
        action={{
          label: "New Resume",
          icon: Plus,
        }}
      />
      {/* Resume list would go here */}
    </>
  );
}
