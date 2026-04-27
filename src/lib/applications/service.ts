import "server-only";

import { ApplicationStage, Prisma } from "@prisma/client";

import {
  createApplicationForUser,
  getApplicationByIdForUser,
  listApplicationsByUser,
} from "@/src/lib/db/applications";
import {
  createApplicationSchema,
  type CreateApplicationInput,
} from "@/src/lib/validations/application";

export class ApplicationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationServiceError";
  }
}

export async function listUserApplications(userId: string) {
  return listApplicationsByUser(userId);
}

export async function getUserApplication(userId: string, applicationId: string) {
  return getApplicationByIdForUser(userId, applicationId);
}

export async function createUserApplication(
  userId: string,
  input: CreateApplicationInput
) {
  const parsed = createApplicationSchema.parse(input);

  return createApplicationForUser({
    companyName: parsed.companyName,
    jdExtractJson: parsed.jdExtractJson as Prisma.InputJsonValue | undefined,
    jdText: parsed.jdText,
    location: parsed.location,
    roleTitle: parsed.roleTitle,
    stage: parsed.stage as ApplicationStage,
    userId,
  });
}
