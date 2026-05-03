import "server-only";

import { Prisma, PrismaClient, ResumeStatus } from "@prisma/client";

import { prisma } from "./prisma";

type ResumeDb = Pick<PrismaClient, "resume">;
type ResumeParseDb = Pick<
  PrismaClient,
  "$transaction" | "resume" | "resumeBullet"
>;

export const resumeListItemSelect = {
  _count: {
    select: {
      bullets: true,
    },
  },
  createdAt: true,
  id: true,
  parsedJson: true,
  status: true,
  title: true,
  updatedAt: true,
} satisfies Prisma.ResumeSelect;

export type ResumeListItem = Prisma.ResumeGetPayload<{
  select: typeof resumeListItemSelect;
}>;

export const resumeDetailSelect = {
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
  },
  createdAt: true,
  id: true,
  parsedJson: true,
  sourceText: true,
  status: true,
  title: true,
  updatedAt: true,
} satisfies Prisma.ResumeSelect;

export type ResumeDetail = Prisma.ResumeGetPayload<{
  select: typeof resumeDetailSelect;
}>;

export async function listResumesByUser(
  userId: string,
  db: ResumeDb = prisma
): Promise<ResumeListItem[]> {
  return db.resume.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: resumeListItemSelect,
    where: {
      userId,
    },
  });
}

export async function getResumeByIdForUser(
  userId: string,
  resumeId: string,
  db: ResumeDb = prisma
) {
  return db.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
  });
}

export async function getResumeDetailByIdForUser(
  userId: string,
  resumeId: string,
  db: ResumeDb = prisma
): Promise<ResumeDetail | null> {
  return db.resume.findFirst({
    select: resumeDetailSelect,
    where: {
      id: resumeId,
      userId,
    },
  });
}

export async function createPastedTextResume(
  params: {
    sourceText: string;
    title: string;
    userId: string;
  },
  db: ResumeDb = prisma
) {
  return db.resume.create({
    data: {
      sourceText: params.sourceText,
      status: ResumeStatus.READY,
      title: params.title,
      userId: params.userId,
    },
  });
}

export async function renameResumeForUser(
  params: {
    id: string;
    title: string;
    userId: string;
  },
  db: ResumeDb = prisma
) {
  const result = await db.resume.updateMany({
    data: {
      title: params.title,
    },
    where: {
      id: params.id,
      userId: params.userId,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return getResumeByIdForUser(params.userId, params.id, db);
}

export async function deleteResumeForUser(
  params: {
    id: string;
    userId: string;
  },
  db: ResumeDb = prisma
) {
  return db.resume.deleteMany({
    where: {
      id: params.id,
      userId: params.userId,
    },
  });
}

export async function markResumeParsingForUser(
  params: {
    id: string;
    userId: string;
  },
  db: ResumeDb = prisma
) {
  return db.resume.updateMany({
    data: {
      status: ResumeStatus.PARSING,
    },
    where: {
      id: params.id,
      status: {
        not: ResumeStatus.PARSING,
      },
      userId: params.userId,
    },
  });
}

export async function markResumeFailedForUser(
  params: {
    id: string;
    userId: string;
  },
  db: ResumeDb = prisma
) {
  return db.resume.updateMany({
    data: {
      status: ResumeStatus.FAILED,
    },
    where: {
      id: params.id,
      userId: params.userId,
    },
  });
}

export type ResumeBulletCreateInput = {
  currentText: string;
  metadata?: Prisma.InputJsonValue;
  orderIndex: number;
  originalText: string;
  resumeId: string;
  sectionTitle?: string;
  sectionType: string;
  userId: string;
};

export async function saveParsedResumeForUser(
  params: {
    bullets: ResumeBulletCreateInput[];
    id: string;
    parsedJson: Prisma.InputJsonValue;
    userId: string;
  },
  db: ResumeParseDb = prisma
) {
  return db.$transaction(async (tx) => {
    const resumeUpdate = await tx.resume.updateMany({
      data: {
        parsedJson: params.parsedJson,
        status: ResumeStatus.READY,
      },
      where: {
        id: params.id,
        userId: params.userId,
      },
    });

    if (resumeUpdate.count === 0) {
      return {
        bulletCount: 0,
        resumeUpdated: false,
      };
    }

    await tx.resumeBullet.deleteMany({
      where: {
        resumeId: params.id,
        userId: params.userId,
      },
    });

    if (params.bullets.length > 0) {
      await tx.resumeBullet.createMany({
        data: params.bullets,
      });
    }

    return {
      bulletCount: params.bullets.length,
      resumeUpdated: true,
    };
  });
}
