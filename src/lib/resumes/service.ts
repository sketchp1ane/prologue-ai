import "server-only";

import { randomUUID } from "node:crypto";

import { Prisma, ResumeStatus } from "@prisma/client";
import { ZodError } from "zod";

import {
  parseResumeFromFile,
  parseResumeFromText,
} from "@/src/lib/ai/services/parse-resume";
import {
  resumeParseSchema,
  type ResumeParse,
} from "@/src/lib/ai/schemas/resume-parse";
import {
  completePdfResumeUploadForUser,
  createPendingPdfResume,
  createPastedTextResume,
  deleteResumeForUser,
  getResumeByIdForUser,
  getResumeDetailByIdForUser,
  listResumesByUser,
  markResumeFailedForUser,
  markResumeParsingForUser,
  renameResumeForUser,
  replaceResumeSourceForUser,
  saveParsedResumeForUser,
  type ResumeBulletCreateInput,
} from "@/src/lib/db/resumes";
import {
  deletePrivateResumePdf,
  uploadPrivateResumePdf,
} from "@/src/lib/storage/resume-pdf";
import {
  createPastedResumeSchema,
  deleteResumeSchema,
  pastedResumeTextSchema,
  renameResumeSchema,
  resumeIdSchema,
  updateParsedResumeSchema,
  validateResumePdfUpload,
  validateReplaceResumeSource,
  type CreatePastedResumeInput,
  type DeleteResumeInput,
  type RenameResumeInput,
  type ReplaceResumeSourceInput,
  type UpdateParsedResumeInput,
} from "@/src/lib/validations/resume";

type ResumeServiceErrorCode =
  | "invalid_resume_id"
  | "invalid_resume_pdf"
  | "invalid_resume_parse"
  | "invalid_resume_source"
  | "resume_already_parsing"
  | "resume_not_found"
  | "resume_parse_failed"
  | "resume_source_missing"
  | "resume_upload_failed"
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

export async function getUserResumeDetail(userId: string, resumeId: string) {
  return getResumeDetailByIdForUser(userId, resumeId);
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

export async function createUserPdfResume(
  userId: string,
  input: {
    file: unknown;
    title: unknown;
  }
) {
  let parsed: ReturnType<typeof validateResumePdfUpload>;

  try {
    parsed = validateResumePdfUpload(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ResumeServiceError(firstZodMessage(error), "invalid_resume_pdf");
    }

    throw error;
  }

  const resume = await createPendingPdfResume({
    title: parsed.title,
    userId,
  });

  try {
    const storedFile = await uploadPrivateResumePdf({
      file: parsed.file,
      resumeId: resume.id,
      userId,
    });
    const completedResume = await completePdfResumeUploadForUser({
      filePath: storedFile.pathname,
      fileUrl: storedFile.url,
      id: resume.id,
      userId,
    });

    if (!completedResume) {
      throw new ResumeServiceError("Resume not found.", "resume_not_found");
    }

    return completedResume;
  } catch (error) {
    await markResumeFailedForUser({
      id: resume.id,
      userId,
    });

    if (error instanceof ResumeServiceError) {
      throw error;
    }

    if (
      error instanceof Error &&
      (error.message.includes("BLOB_READ_WRITE_TOKEN") ||
        error.message.includes("No token found"))
    ) {
      throw new ResumeServiceError(
        "PDF storage is not configured.",
        "configuration"
      );
    }

    throw new ResumeServiceError(
      "PDF resume could not be uploaded.",
      "resume_upload_failed"
    );
  }
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
  const resume = await getResumeByIdForUser(userId, parsed.id);

  if (!resume) {
    throw new ResumeServiceError("Resume not found.");
  }

  const result = await deleteResumeForUser({
    id: parsed.id,
    userId,
  });

  if (result.count === 0) {
    throw new ResumeServiceError("Resume not found.");
  }

  if (resume.filePath) {
    try {
      await deletePrivateResumePdf(resume.filePath);
    } catch {
      // Keep resume deletion reliable; storage cleanup can be retried manually.
    }
  }

  return result;
}

export async function updateUserParsedResume(
  userId: string,
  input: UpdateParsedResumeInput
) {
  const parsed = updateParsedResumeSchema.safeParse(input);

  if (!parsed.success) {
    throw new ResumeServiceError(
      firstZodMessage(parsed.error),
      "invalid_resume_parse"
    );
  }

  const bullets = buildResumeBulletsFromParse({
    parsedResume: parsed.data.parsedResume,
    resumeId: parsed.data.id,
    userId,
  });
  const saved = await saveParsedResumeForUser({
    bullets,
    id: parsed.data.id,
    parsedJson: parsed.data.parsedResume as Prisma.InputJsonValue,
    userId,
  });

  if (!saved.resumeUpdated) {
    throw new ResumeServiceError("Resume not found.", "resume_not_found");
  }

  return {
    bulletCount: saved.bulletCount,
    resumeId: parsed.data.id,
    status: ResumeStatus.READY,
  };
}

export async function replaceUserResumeTextSource(
  userId: string,
  input: Extract<ReplaceResumeSourceInput, { sourceType: "pasted_text" }>
) {
  const parsed = (() => {
    try {
      return validateReplaceResumeSource({
        file: null,
        id: input.id,
        sourceText: input.sourceText,
        sourceType: "pasted_text",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ResumeServiceError(
          firstZodMessage(error),
          "invalid_resume_source"
        );
      }

      throw error;
    }
  })();

  if (parsed.sourceType !== "pasted_text") {
    throw new ResumeServiceError(
      "Resume source type is invalid.",
      "invalid_resume_source"
    );
  }

  const replaced = await replaceResumeSourceForUser({
    id: parsed.id,
    sourceText: parsed.sourceText,
    userId,
  });

  if (!replaced.resumeUpdated) {
    throw new ResumeServiceError("Resume not found.", "resume_not_found");
  }

  if (replaced.oldFilePath) {
    try {
      await deletePrivateResumePdf(replaced.oldFilePath);
    } catch {
      // Source replacement should stay reliable; storage cleanup can be retried.
    }
  }

  return {
    resumeId: parsed.id,
    sourceType: parsed.sourceType,
    status: ResumeStatus.READY,
  };
}

export async function replaceUserResumePdfSource(
  userId: string,
  input: Extract<ReplaceResumeSourceInput, { sourceType: "pdf" }>
) {
  const parsed = (() => {
    try {
      return validateReplaceResumeSource({
        file: input.file,
        id: input.id,
        sourceText: "",
        sourceType: "pdf",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ResumeServiceError(
          firstZodMessage(error),
          "invalid_resume_pdf"
        );
      }

      throw error;
    }
  })();

  if (parsed.sourceType !== "pdf") {
    throw new ResumeServiceError(
      "Resume source type is invalid.",
      "invalid_resume_source"
    );
  }

  let storedFile: Awaited<ReturnType<typeof uploadPrivateResumePdf>>;

  try {
    storedFile = await uploadPrivateResumePdf({
      file: parsed.file,
      pathNonce: randomUUID(),
      resumeId: parsed.id,
      userId,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("BLOB_READ_WRITE_TOKEN") ||
        error.message.includes("No token found"))
    ) {
      throw new ResumeServiceError(
        "PDF storage is not configured.",
        "configuration"
      );
    }

    throw new ResumeServiceError(
      "PDF resume could not be uploaded.",
      "resume_upload_failed"
    );
  }

  const replaced = await replaceResumeSourceForUser({
    filePath: storedFile.pathname,
    fileUrl: storedFile.url,
    id: parsed.id,
    userId,
  });

  if (!replaced.resumeUpdated) {
    try {
      await deletePrivateResumePdf(storedFile.pathname);
    } catch {
      // Best-effort cleanup for an upload that could not be attached.
    }

    throw new ResumeServiceError("Resume not found.", "resume_not_found");
  }

  if (replaced.oldFilePath && replaced.oldFilePath !== storedFile.pathname) {
    try {
      await deletePrivateResumePdf(replaced.oldFilePath);
    } catch {
      // Source replacement already succeeded; stale blobs can be cleaned later.
    }
  }

  return {
    resumeId: parsed.id,
    sourceType: parsed.sourceType,
    status: ResumeStatus.READY,
  };
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
  const hasPdfSource = Boolean(resume.filePath?.trim());

  if (!parsedSourceText.success && !hasPdfSource) {
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
      parsedSourceText.success
        ? await parseResumeFromText({
            resumeId: id,
            sourceText: parsedSourceText.data,
            userId,
          })
        : await parseResumeFromFile({
            filePath: resume.filePath ?? "",
            resumeId: id,
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
