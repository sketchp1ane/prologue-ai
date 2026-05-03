import { z } from "zod";

import {
  resumeParseSchema,
  type ResumeParse,
} from "@/src/lib/ai/schemas/resume-parse";

const trimmedString = z.string().transform((value) => value.trim());
const nullableTrimmedString = z
  .string()
  .nullable()
  .transform((value) => {
    if (value === null) {
      return null;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  });
const trimmedStringList = z
  .array(z.string())
  .transform((items) =>
    items.map((item) => item.trim()).filter((item) => item.length > 0)
  );

export const RESUME_TITLE_MAX_LENGTH = 120;
export const RESUME_SOURCE_TEXT_MAX_LENGTH = 50_000;
export const RESUME_PDF_MAX_BYTES = 10 * 1024 * 1024;
export const RESUME_PDF_CONTENT_TYPE = "application/pdf";
export const RESUME_CREATE_SOURCE_TYPES = ["pasted_text", "pdf"] as const;

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

export const resumeCreateSourceTypeSchema = z.enum(RESUME_CREATE_SOURCE_TYPES);

export const renameResumeSchema = z.object({
  id: resumeIdSchema,
  title: resumeTitleSchema,
});

export const deleteResumeSchema = z.object({
  id: resumeIdSchema,
});

export const replaceResumeSourceSchema = z.object({
  id: resumeIdSchema,
  sourceType: resumeCreateSourceTypeSchema,
});

const editableResumeBasicsSchema = z
  .object({
    email: nullableTrimmedString,
    links: trimmedStringList,
    location: nullableTrimmedString,
    name: nullableTrimmedString,
    phone: nullableTrimmedString,
  })
  .strict();

const editableResumeExperienceSchema = z
  .object({
    bullets: trimmedStringList,
    company: nullableTrimmedString,
    endDate: nullableTrimmedString,
    location: nullableTrimmedString,
    startDate: nullableTrimmedString,
    title: nullableTrimmedString,
  })
  .strict();

const editableResumeEducationSchema = z
  .object({
    degree: nullableTrimmedString,
    endDate: nullableTrimmedString,
    major: nullableTrimmedString,
    school: nullableTrimmedString,
    startDate: nullableTrimmedString,
  })
  .strict();

const editableResumeProjectSchema = z
  .object({
    bullets: trimmedStringList,
    description: nullableTrimmedString,
    name: nullableTrimmedString,
    technologies: trimmedStringList,
  })
  .strict();

function hasMeaningfulValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulValue(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).some((item) => hasMeaningfulValue(item));
  }

  return typeof value === "string" ? value.trim().length > 0 : value !== null;
}

const editableResumeParseSchema = z
  .object({
    basics: editableResumeBasicsSchema,
    certifications: trimmedStringList,
    education: z
      .array(editableResumeEducationSchema)
      .transform((items) => items.filter((item) => hasMeaningfulValue(item))),
    experience: z
      .array(editableResumeExperienceSchema)
      .transform((items) => items.filter((item) => hasMeaningfulValue(item))),
    languages: trimmedStringList,
    projects: z
      .array(editableResumeProjectSchema)
      .transform((items) => items.filter((item) => hasMeaningfulValue(item))),
    skills: trimmedStringList,
    summary: nullableTrimmedString,
    warnings: trimmedStringList,
  })
  .strict()
  .pipe(resumeParseSchema);

function parseJsonField(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export const updateParsedResumeSchema = z.object({
  id: resumeIdSchema,
  parsedResume: z.preprocess(parseJsonField, editableResumeParseSchema),
});

export type CreatePastedResumeInput = z.infer<typeof createPastedResumeSchema>;
export type CreatePdfResumeMetadataInput = z.infer<
  typeof createPdfResumeMetadataSchema
>;
export type ResumeCreateSourceType = z.infer<
  typeof resumeCreateSourceTypeSchema
>;
export type RenameResumeInput = z.infer<typeof renameResumeSchema>;
export type DeleteResumeInput = z.infer<typeof deleteResumeSchema>;
export type UpdateParsedResumeInput = {
  id: string;
  parsedResume: ResumeParse;
};
export type ReplaceResumeSourceInput =
  | {
      id: string;
      sourceText: string;
      sourceType: "pasted_text";
    }
  | {
      file: File;
      id: string;
      sourceType: "pdf";
    };

export type ValidatedSelectedResumeCreate =
  | {
      sourceText: string;
      sourceType: "pasted_text";
      title: string;
    }
  | {
      file: File;
      sourceType: "pdf";
      title: string;
    };

export type ValidatedResumePdfUpload = {
  file: File;
  title: string;
};

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function hasNonEmptyText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasNonEmptyFile(value: unknown) {
  return isFile(value) && value.size > 0;
}

function createResumeSourceError(message: string, path = "sourceType") {
  return new z.ZodError([
    {
      code: z.ZodIssueCode.custom,
      message,
      path: [path],
    },
  ]);
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

export function validateSelectedResumeCreate(input: {
  file: unknown;
  sourceText: unknown;
  sourceType: unknown;
  title: unknown;
}): ValidatedSelectedResumeCreate {
  const sourceType = resumeCreateSourceTypeSchema.parse(input.sourceType);
  const title = resumeTitleSchema.parse(input.title);
  const hasText = hasNonEmptyText(input.sourceText);
  const hasFile = hasNonEmptyFile(input.file);

  if (hasText && hasFile) {
    throw createResumeSourceError(
      "Choose either pasted text or a PDF, not both."
    );
  }

  if (!hasText && !hasFile) {
    throw createResumeSourceError("Choose a resume source.");
  }

  if (sourceType === "pasted_text") {
    if (hasFile) {
      throw createResumeSourceError("Choose pasted text or switch to PDF upload.");
    }

    return {
      sourceText: pastedResumeTextSchema.parse(input.sourceText),
      sourceType,
      title,
    };
  }

  if (hasText) {
    throw createResumeSourceError("Choose PDF upload or switch to pasted text.");
  }

  return {
    file: validateResumePdfUpload({
      file: input.file,
      title,
    }).file,
    sourceType,
    title,
  };
}

export function validateReplaceResumeSource(input: {
  file: unknown;
  id: unknown;
  sourceText: unknown;
  sourceType: unknown;
}): ReplaceResumeSourceInput {
  const metadata = replaceResumeSourceSchema.parse({
    id: input.id,
    sourceType: input.sourceType,
  });
  const hasText = hasNonEmptyText(input.sourceText);
  const hasFile = hasNonEmptyFile(input.file);

  if (hasText && hasFile) {
    throw createResumeSourceError(
      "Choose either pasted text or a PDF, not both."
    );
  }

  if (!hasText && !hasFile) {
    throw createResumeSourceError("Choose a resume source.");
  }

  if (metadata.sourceType === "pasted_text") {
    if (hasFile) {
      throw createResumeSourceError("Choose pasted text or switch to PDF upload.");
    }

    return {
      id: metadata.id,
      sourceText: pastedResumeTextSchema.parse(input.sourceText),
      sourceType: metadata.sourceType,
    };
  }

  if (hasText) {
    throw createResumeSourceError("Choose PDF upload or switch to pasted text.");
  }

  return {
    file: validateResumePdfUpload({
      file: input.file,
      title: "Replacement PDF",
    }).file,
    id: metadata.id,
    sourceType: metadata.sourceType,
  };
}
