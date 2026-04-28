import "server-only";

import { ApplicationStage } from "@prisma/client";

import type { ApplicationListItem } from "@/src/lib/db/applications";

export type ApplicationStageOption = {
  value: ApplicationStage;
  label: string;
};

export type ApplicationDashboardStats = {
  total: number;
  applied: number;
  communicating: number;
  interviewing: number;
  offer: number;
};

const APPLICATION_STAGE_LABELS: Record<ApplicationStage, string> = {
  [ApplicationStage.PREPARING]: "Preparing",
  [ApplicationStage.APPLIED]: "Applied",
  [ApplicationStage.COMMUNICATING]: "Communicating",
  [ApplicationStage.INTERVIEWING]: "Interviewing",
  [ApplicationStage.OFFER]: "Offer",
  [ApplicationStage.ARCHIVED]: "Archived",
};

export const APPLICATION_STAGE_ORDER = Object.values(ApplicationStage);

export function getApplicationStageLabel(stage: ApplicationStage) {
  return APPLICATION_STAGE_LABELS[stage];
}

export function getApplicationStageOptions(): ApplicationStageOption[] {
  return APPLICATION_STAGE_ORDER.map((stage) => ({
    label: getApplicationStageLabel(stage),
    value: stage,
  }));
}

export function groupApplicationsByStage<T extends { stage: ApplicationStage }>(
  applications: T[]
): Record<ApplicationStage, T[]> {
  const grouped = APPLICATION_STAGE_ORDER.reduce(
    (result, stage) => ({
      ...result,
      [stage]: [],
    }),
    {} as Record<ApplicationStage, T[]>
  );

  for (const application of applications) {
    grouped[application.stage].push(application);
  }

  return grouped;
}

export function getApplicationDashboardStats(
  applications: ApplicationListItem[]
): ApplicationDashboardStats {
  const grouped = groupApplicationsByStage(applications);

  return {
    applied: grouped[ApplicationStage.APPLIED].length,
    communicating: grouped[ApplicationStage.COMMUNICATING].length,
    interviewing: grouped[ApplicationStage.INTERVIEWING].length,
    offer: grouped[ApplicationStage.OFFER].length,
    total: applications.length,
  };
}
