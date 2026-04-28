import { PageHeader } from "@/components/app/PageHeader";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-secondary/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export default function ApplicationsLoading() {
  return (
    <>
      <PageHeader
        title="Applications"
        description="Loading your tracked applications."
      />

      <div className="space-y-3" aria-label="Loading applications">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-center gap-4">
              <SkeletonBlock className="h-12 w-12 shrink-0" />
              <div className="min-w-0 flex-1 space-y-3">
                <SkeletonBlock className="h-4 w-2/3" />
                <SkeletonBlock className="h-3 w-1/2" />
                <SkeletonBlock className="h-3 w-1/3" />
              </div>
              <SkeletonBlock className="hidden h-7 w-24 sm:block" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
