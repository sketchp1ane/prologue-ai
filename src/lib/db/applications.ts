import "server-only";

import { ApplicationStage, Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "./prisma";

type ApplicationDb = Pick<PrismaClient, "application">;

export const applicationListItemSelect = {
  companyName: true,
  createdAt: true,
  id: true,
  location: true,
  roleTitle: true,
  stage: true,
  updatedAt: true,
} satisfies Prisma.ApplicationSelect;

export type ApplicationListItem = Prisma.ApplicationGetPayload<{
  select: typeof applicationListItemSelect;
}>;

export async function listApplicationsByUser(
  userId: string,
  db: ApplicationDb = prisma
): Promise<ApplicationListItem[]> {
  return db.application.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: applicationListItemSelect,
    where: {
      userId,
    },
  });
}

export async function getApplicationByIdForUser(
  userId: string,
  applicationId: string,
  db: ApplicationDb = prisma
) {
  return db.application.findFirst({
    where: {
      id: applicationId,
      userId,
    },
  });
}

export async function createApplicationForUser(
  params: {
    companyName: string;
    jdExtractJson?: Prisma.InputJsonValue;
    jdText: string;
    location: string | null;
    roleTitle: string;
    stage?: ApplicationStage;
    userId: string;
  },
  db: ApplicationDb = prisma
) {
  return db.application.create({
    data: {
      companyName: params.companyName,
      jdExtractJson: params.jdExtractJson,
      jdText: params.jdText,
      location: params.location,
      roleTitle: params.roleTitle,
      stage: params.stage ?? ApplicationStage.PREPARING,
      userId: params.userId,
    },
  });
}

export async function updateApplicationStageForUser(
  params: {
    id: string;
    stage: ApplicationStage;
    userId: string;
  },
  db: ApplicationDb = prisma
) {
  const result = await db.application.updateMany({
    data: {
      stage: params.stage,
    },
    where: {
      id: params.id,
      userId: params.userId,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return getApplicationByIdForUser(params.userId, params.id, db);
}
