import "server-only";

import { ApplicationStage, Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "./prisma";

type ApplicationDb = Pick<PrismaClient, "application" | "resume">;
type ApplicationDiagnosisDb = Pick<PrismaClient, "application">;

const attachedResumeSelect = {
  id: true,
  parsedJson: true,
  status: true,
  title: true,
  updatedAt: true,
} satisfies Prisma.ResumeSelect;

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
    include: {
      resume: {
        select: attachedResumeSelect,
      },
    },
    where: {
      id: applicationId,
      userId,
    },
  });
}

export async function getApplicationDiagnosisInputForUser(
  userId: string,
  applicationId: string,
  db: ApplicationDiagnosisDb = prisma
) {
  return db.application.findFirst({
    select: {
      companyName: true,
      diagnosisJson: true,
      id: true,
      jdExtractJson: true,
      jdText: true,
      location: true,
      resume: {
        select: {
          bullets: {
            orderBy: {
              orderIndex: "asc",
            },
            select: {
              currentText: true,
              id: true,
              orderIndex: true,
              originalText: true,
              sectionTitle: true,
              sectionType: true,
            },
            where: {
              userId,
            },
          },
          id: true,
          parsedJson: true,
          status: true,
          title: true,
        },
      },
      resumeId: true,
      roleTitle: true,
      userId: true,
    },
    where: {
      id: applicationId,
      userId,
    },
  });
}

export type ApplicationDiagnosisInput = NonNullable<
  Awaited<ReturnType<typeof getApplicationDiagnosisInputForUser>>
>;

export async function createApplicationForUser(
  params: {
    companyName: string;
    jdExtractJson?: Prisma.InputJsonValue;
    jdText: string;
    location: string | null;
    resumeId: string | null;
    roleTitle: string;
    stage?: ApplicationStage;
    userId: string;
  },
  db: ApplicationDb = prisma
) {
  if (params.resumeId) {
    const resume = await db.resume.findFirst({
      select: {
        id: true,
      },
      where: {
        id: params.resumeId,
        userId: params.userId,
      },
    });

    if (!resume) {
      return null;
    }
  }

  return db.application.create({
    data: {
      companyName: params.companyName,
      jdExtractJson: params.jdExtractJson,
      jdText: params.jdText,
      location: params.location,
      resumeId: params.resumeId,
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

export async function updateApplicationResumeForUser(
  params: {
    id: string;
    resumeId: string | null;
    userId: string;
  },
  db: ApplicationDb = prisma
) {
  if (params.resumeId) {
    const resume = await db.resume.findFirst({
      select: {
        id: true,
      },
      where: {
        id: params.resumeId,
        userId: params.userId,
      },
    });

    if (!resume) {
      return null;
    }
  }

  const result = await db.application.updateMany({
    data: {
      resumeId: params.resumeId,
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

export async function saveApplicationDiagnosisForUser(
  params: {
    diagnosisJson: Prisma.InputJsonValue;
    id: string;
    userId: string;
  },
  db: ApplicationDiagnosisDb = prisma
) {
  return db.application.updateMany({
    data: {
      diagnosisJson: params.diagnosisJson,
    },
    where: {
      id: params.id,
      userId: params.userId,
    },
  });
}
