import "server-only";

import { Prisma, PrismaClient, ResumeStatus } from "@prisma/client";

import { prisma } from "./prisma";

type ResumeDb = Pick<PrismaClient, "resume">;

export const resumeListItemSelect = {
  createdAt: true,
  id: true,
  status: true,
  title: true,
  updatedAt: true,
} satisfies Prisma.ResumeSelect;

export type ResumeListItem = Prisma.ResumeGetPayload<{
  select: typeof resumeListItemSelect;
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
