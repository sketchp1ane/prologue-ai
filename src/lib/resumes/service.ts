import "server-only";

import {
  createPastedTextResume,
  deleteResumeForUser,
  getResumeByIdForUser,
  listResumesByUser,
  renameResumeForUser,
} from "@/src/lib/db/resumes";
import {
  createPastedResumeSchema,
  deleteResumeSchema,
  renameResumeSchema,
  type CreatePastedResumeInput,
  type DeleteResumeInput,
  type RenameResumeInput,
} from "@/src/lib/validations/resume";

export class ResumeServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeServiceError";
  }
}

export async function listUserResumes(userId: string) {
  return listResumesByUser(userId);
}

export async function getUserResume(userId: string, resumeId: string) {
  return getResumeByIdForUser(userId, resumeId);
}

export async function createUserPastedResume(
  userId: string,
  input: CreatePastedResumeInput
) {
  const parsed = createPastedResumeSchema.parse(input);

  return createPastedTextResume({
    sourceText: parsed.sourceText,
    title: parsed.title,
    userId,
  });
}

export async function renameUserResume(
  userId: string,
  input: RenameResumeInput
) {
  const parsed = renameResumeSchema.parse(input);
  const resume = await renameResumeForUser({
    id: parsed.id,
    title: parsed.title,
    userId,
  });

  if (!resume) {
    throw new ResumeServiceError("Resume not found.");
  }

  return resume;
}

export async function deleteUserResume(
  userId: string,
  input: DeleteResumeInput
) {
  const parsed = deleteResumeSchema.parse(input);
  const result = await deleteResumeForUser({
    id: parsed.id,
    userId,
  });

  if (result.count === 0) {
    throw new ResumeServiceError("Resume not found.");
  }

  return result;
}
