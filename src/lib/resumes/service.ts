import "server-only";

import { Prisma, ResumeStatus } from "@prisma/client";
import { ZodError } from "zod";

import { parseResumeFromText } from "@/src/lib/ai/services/parse-resume";
import {
  resumeParseSchema,
  type ResumeParse,
} from "@/src/lib/ai/schemas/resume-parse";
import {
  createPastedTextResume,
  deleteResumeForUser,
  getResumeByIdForUser,
  listResumesByUser,
  markResumeFailedForUser,
  markResumeParsingForUser,
  renameResumeForUser,
  saveParsedResumeForUser,
  type ResumeBulletCreateInput,
} from "@/src/lib/db/resumes";
import {
  createPastedResumeSchema,
  deleteResumeSchema,
  pastedResumeTextSchema,
  renameResumeSchema,
  resumeIdSchema,
  type CreatePastedResumeInput,
  type DeleteResumeInput,
  type RenameResumeInput,
} from "@/src/lib/validations/resume";

type ResumeServiceErrorCode =
  | "invalid_resume_id"
  | "resume_already_parsing"
  | "resume_not_found"
  | "resume_parse_failed"
  | "resume_source_missing"
  | "configuration";

export class ResumeServiceError extends Error {
  code: ResumeServiceErrorCode;

  constructor(
    message: string,
    code: ResumeServiceErrorCode = "resume_parse_failed"
  ) {
    super(message);
    this.name = "ResumeServiceError";
    this.code = code;
  }
}

function firstZodMessage(error: ZodError) {
  return error.issues[0]?.message ?? "Check the request and try again.";
}

function sectionTitle(parts: Array<string | null>) {
  const title = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" at ");

  return title.length > 0 ? title : undefined;
}

export function buildResumeBulletsFromParse(params: {
  parsedResume: ResumeParse;
  resumeId: string;
  userId: string;
}): ResumeBulletCreateInput[] {
  const bullets: ResumeBulletCreateInput[] = [];

  for (const [sectionIndex, experience] of params.parsedResume.experience.entries()) {
    const title = sectionTitle([experience.title, experience.company]);

    for (const [bulletIndex, bullet] of experience.bullets.entries()) {
      const text = bullet.trim();

      if (text.length === 0) {
        continue;
      }

      bullets.push({
        currentText: text,
        metadata: {
          bulletIndex,
          sectionIndex,
        },
        orderIndex: bullets.length,
        originalText: text,
        resumeId: params.resumeId,
        sectionTitle: title,
        sectionType: "experience",
        userId: params.userId,
      });
    }
  }

  for (const [sectionIndex, project] of params.parsedResume.projects.entries()) {
    const title = project.name?.trim() || undefined;

    for (const [bulletIndex, bullet] of project.bullets.entries()) {
      const text = bullet.trim();

      if (text.length === 0) {
        continue;
      }

      bullets.push({
        currentText: text,
        metadata: {
          bulletIndex,
          sectionIndex,
        },
        orderIndex: bullets.length,
        originalText: text,
        resumeId: params.resumeId,
        sectionTitle: title,
        sectionType: "project",
        userId: params.userId,
      });
    }
  }

  return bullets;
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

export async function parseUserResume(userId: string, resumeId: string) {
  const parsedId = resumeIdSchema.safeParse(resumeId);

  if (!parsedId.success) {
    throw new ResumeServiceError(firstZodMessage(parsedId.error), "invalid_resume_id");
  }

  const id = parsedId.data;
  const resume = await getResumeByIdForUser(userId, id);

  if (!resume) {
    throw new ResumeServiceError("Resume not found.", "resume_not_found");
  }

  if (resume.status === ResumeStatus.PARSING) {
    throw new ResumeServiceError(
      "Resume parsing is already in progress.",
      "resume_already_parsing"
    );
  }

  const parsedSourceText = pastedResumeTextSchema.safeParse(resume.sourceText ?? "");

  if (!parsedSourceText.success) {
    throw new ResumeServiceError(
      firstZodMessage(parsedSourceText.error),
      "resume_source_missing"
    );
  }

  const transition = await markResumeParsingForUser({
    id,
    userId,
  });

  if (transition.count === 0) {
    throw new ResumeServiceError(
      "Resume parsing is already in progress.",
      "resume_already_parsing"
    );
  }

  try {
    const parsedResume = resumeParseSchema.parse(
      await parseResumeFromText({
        resumeId: id,
        sourceText: parsedSourceText.data,
        userId,
      })
    );
    const bullets = buildResumeBulletsFromParse({
      parsedResume,
      resumeId: id,
      userId,
    });
    const saved = await saveParsedResumeForUser({
      bullets,
      id,
      parsedJson: parsedResume as Prisma.InputJsonValue,
      userId,
    });

    if (!saved.resumeUpdated) {
      throw new ResumeServiceError("Resume not found.", "resume_not_found");
    }

    return {
      bulletCount: saved.bulletCount,
      resumeId: id,
      status: ResumeStatus.READY,
    };
  } catch (error) {
    await markResumeFailedForUser({
      id,
      userId,
    });

    if (error instanceof ResumeServiceError) {
      throw error;
    }

    if (
      error instanceof Error &&
      (error.message === "OPENAI_API_KEY is not configured." ||
        error.message === "OPENAI_MODEL_PARSE is not configured.")
    ) {
      throw new ResumeServiceError(error.message, "configuration");
    }

    if (
      error instanceof Error &&
      error.name === "ResumeParseServiceError" &&
      "code" in error &&
      error.code === "configuration"
    ) {
      throw new ResumeServiceError(error.message, "configuration");
    }

    throw new ResumeServiceError("Could not parse this resume.");
  }
}
