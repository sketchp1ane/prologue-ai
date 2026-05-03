import type { ApplicationStage } from "@prisma/client";

import { APPLICATION_STAGE_THEME } from "@/src/lib/applications/stage-metadata";
import { cn } from "@/src/lib/utils";

type ApplicationStageBadgeProps = {
  className?: string;
  label: string;
  stage: ApplicationStage;
};

export function ApplicationStageBadge({
  className,
  label,
  stage,
}: ApplicationStageBadgeProps) {
  const theme = APPLICATION_STAGE_THEME[stage];

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-foreground shadow-xs",
        className
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", theme.dot)}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
