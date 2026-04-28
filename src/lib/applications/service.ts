import "server-only";

import { ApplicationStage, Prisma } from "@prisma/client";

import {
  createApplicationForUser,
  getApplicationByIdForUser,
  listApplicationsByUser,
  updateApplicationResumeForUser,
  updateApplicationStageForUser,
} from "@/src/lib/db/applications";
import {
  createApplicationSchema,
  type CreateApplicationInput,
  updateApplicationResumeSchema,
  type UpdateApplicationResumeInput,
  updateApplicationStageSchema,
  type UpdateApplicationStageInput,
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

  const application = await createApplicationForUser({
    companyName: parsed.companyName,
    jdExtractJson: parsed.jdExtractJson as Prisma.InputJsonValue | undefined,
    jdText: parsed.jdText,
    location: parsed.location,
    resumeId: parsed.resumeId,
    roleTitle: parsed.roleTitle,
    stage: parsed.stage as ApplicationStage,
    userId,
  });

  if (!application) {
    throw new ApplicationServiceError("Application resume could not be attached.");
  }

  return application;
}

export async function updateUserApplicationStage(
  userId: string,
  input: UpdateApplicationStageInput
) {
  const parsed = updateApplicationStageSchema.parse(input);
  const application = await updateApplicationStageForUser({
    id: parsed.applicationId,
    stage: parsed.stage as ApplicationStage,
    userId,
  });

  if (!application) {
    throw new ApplicationServiceError("Application could not be updated.");
  }

  return application;
}

export async function updateUserApplicationResume(
  userId: string,
  input: UpdateApplicationResumeInput
) {
  const parsed = updateApplicationResumeSchema.parse(input);
  const application = await updateApplicationResumeForUser({
    id: parsed.applicationId,
    resumeId: parsed.resumeId,
    userId,
  });

  if (!application) {
    throw new ApplicationServiceError("Application resume could not be updated.");
  }

  return application;
}
