import { FileSearch, Sparkles } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";

export default function JDExtractPage() {
  return (
    <>
      <PageHeader
        title="JD Extract"
        description="Analyze job descriptions to find requirements, skills, and keywords."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Card */}
        <AppCard>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <FileSearch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">
                Paste Job Description
              </h3>
              <p className="text-xs text-muted-foreground">
                We&apos;ll extract key requirements and skills
              </p>
            </div>
          </div>
          <textarea
            placeholder="Paste the job description here..."
            className="min-h-[200px] w-full resize-none rounded-xl border border-border bg-secondary/30 p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Tip: Include the full job posting for best results
            </p>
            <Button className="gap-2 rounded-xl">
              <Sparkles className="h-4 w-4" />
              Analyze
            </Button>
          </div>
        </AppCard>

        {/* Results Preview Card */}
        <AppCard className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-medium text-foreground">
              Extracted Insights
            </h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Powered by AI
            </span>
          </div>

          {/* Placeholder for results */}
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 p-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">
              No analysis yet
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Paste a job description on the left and click Analyze to extract
              requirements, skills, and keywords.
            </p>
          </div>

          {/* Example of what results would look like */}
          <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              What you&apos;ll get
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Required skills and technologies
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Experience level and years required
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Keywords for resume optimization
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Match score against your resume
              </li>
            </ul>
          </div>
        </AppCard>
      </div>
    </>
  );
}
