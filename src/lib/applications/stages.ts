import "server-only";

import { ApplicationStage } from "@prisma/client";

import type { ApplicationListItem } from "@/src/lib/db/applications";
import {
  APPLICATION_STAGE_ORDER as SHARED_APPLICATION_STAGE_ORDER,
} from "./stage-metadata";

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

export const APPLICATION_STAGE_ORDER =
  SHARED_APPLICATION_STAGE_ORDER as readonly ApplicationStage[];

export function getApplicationStageLabel(
  stage: ApplicationStage,
  labels: Record<ApplicationStage, string>
) {
  return labels[stage];
}

export function getApplicationStageOptions(
  labels: Record<ApplicationStage, string>
): ApplicationStageOption[] {
  return APPLICATION_STAGE_ORDER.map((stage) => ({
    label: getApplicationStageLabel(stage, labels),
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
