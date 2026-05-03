import { z } from "zod";

const trimmedString = z.string().transform((value) => value.trim());

export const RESUME_TITLE_MAX_LENGTH = 120;
export const RESUME_SOURCE_TEXT_MAX_LENGTH = 50_000;
export const RESUME_PDF_MAX_BYTES = 10 * 1024 * 1024;
export const RESUME_PDF_CONTENT_TYPE = "application/pdf";

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

export const createPdfResumeMetadataSchema = z.object({
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
export type CreatePdfResumeMetadataInput = z.infer<
  typeof createPdfResumeMetadataSchema
>;
export type RenameResumeInput = z.infer<typeof renameResumeSchema>;
export type DeleteResumeInput = z.infer<typeof deleteResumeSchema>;

export type ValidatedResumePdfUpload = {
  file: File;
  title: string;
};

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export function validateResumePdfUpload(input: {
  file: unknown;
  title: unknown;
}): ValidatedResumePdfUpload {
  const { title } = createPdfResumeMetadataSchema.parse({
    title: input.title,
  });

  if (!isFile(input.file) || input.file.size === 0) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        message: "Choose a PDF resume file.",
        path: ["file"],
      },
    ]);
  }

  if (
    input.file.type !== RESUME_PDF_CONTENT_TYPE ||
    !input.file.name.toLowerCase().endsWith(".pdf")
  ) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        message: "Upload a PDF file only.",
        path: ["file"],
      },
    ]);
  }

  if (input.file.size > RESUME_PDF_MAX_BYTES) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        message: `PDF must be ${Math.floor(
          RESUME_PDF_MAX_BYTES / 1024 / 1024
        )}MB or smaller.`,
        path: ["file"],
      },
    ]);
  }

  return {
    file: input.file,
    title,
  };
}
