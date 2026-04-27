import { z } from "zod";

const trimmedString = z.string().transform((value) => value.trim());

export const RESUME_TITLE_MAX_LENGTH = 120;
export const RESUME_SOURCE_TEXT_MAX_LENGTH = 50_000;

export const resumeIdSchema = trimmedString.pipe(
  z.string().min(1, "Resume id is required.").max(128, "Resume id is invalid.")
);

export const resumeTitleSchema = trimmedString.pipe(
  z
    .string()
    .min(2, "Use at least 2 characters for the resume title.")
    .max(
      RESUME_TITLE_MAX_LENGTH,
      `Resume title must be ${RESUME_TITLE_MAX_LENGTH} characters or fewer.`
    )
);

export const pastedResumeTextSchema = trimmedString.pipe(
  z
    .string()
    .min(20, "Paste at least 20 characters of resume text.")
    .max(
      RESUME_SOURCE_TEXT_MAX_LENGTH,
      `Resume text must be ${RESUME_SOURCE_TEXT_MAX_LENGTH.toLocaleString()} characters or fewer.`
    )
);

export const createPastedResumeSchema = z.object({
  sourceText: pastedResumeTextSchema,
  title: resumeTitleSchema,
});

export const renameResumeSchema = z.object({
  id: resumeIdSchema,
  title: resumeTitleSchema,
});

export const deleteResumeSchema = z.object({
  id: resumeIdSchema,
});

export type CreatePastedResumeInput = z.infer<typeof createPastedResumeSchema>;
export type RenameResumeInput = z.infer<typeof renameResumeSchema>;
export type DeleteResumeInput = z.infer<typeof deleteResumeSchema>;
