import type { PrismaClient, Resume, Application } from "@prisma/client";

import { prisma } from "./prisma";

type OwnershipDb = Pick<PrismaClient, "resume" | "application">;

export class OwnershipError extends Error {
  constructor(recordType: "resume" | "application", recordId: string) {
    super(`Current user does not own ${recordType} ${recordId}.`);
    this.name = "OwnershipError";
  }
}

export async function assertResumeOwner(
  userId: string,
  resumeId: string,
  db: OwnershipDb = prisma
): Promise<Resume> {
  const resume = await db.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
  });

  if (!resume) {
    throw new OwnershipError("resume", resumeId);
  }

  return resume;
}

export async function assertApplicationOwner(
  userId: string,
  applicationId: string,
  db: OwnershipDb = prisma
): Promise<Application> {
  const application = await db.application.findFirst({
    where: {
      id: applicationId,
      userId,
    },
  });

  if (!application) {
    throw new OwnershipError("application", applicationId);
  }

  return application;
}
