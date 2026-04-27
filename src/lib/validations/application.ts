import { z } from "zod";

import { jdExtractSchema } from "@/src/lib/ai/schemas/jd-extract";

const trimmedString = z.string().transform((value) => value.trim());

export const APPLICATION_COMPANY_MAX_LENGTH = 160;
export const APPLICATION_ROLE_MAX_LENGTH = 180;
export const APPLICATION_LOCATION_MAX_LENGTH = 160;
export const APPLICATION_JD_MIN_LENGTH = 50;
export const APPLICATION_JD_MAX_LENGTH = 50_000;

export const applicationIdSchema = trimmedString.pipe(
  z
    .string()
    .min(1, "Application id is required.")
    .max(128, "Application id is invalid.")
);

export const applicationCompanySchema = trimmedString.pipe(
  z
    .string()
    .min(1, "Company name is required.")
    .max(
      APPLICATION_COMPANY_MAX_LENGTH,
      `Company name must be ${APPLICATION_COMPANY_MAX_LENGTH} characters or fewer.`
    )
);

export const applicationRoleSchema = trimmedString.pipe(
  z
    .string()
    .min(1, "Role title is required.")
    .max(
      APPLICATION_ROLE_MAX_LENGTH,
      `Role title must be ${APPLICATION_ROLE_MAX_LENGTH} characters or fewer.`
    )
);

export const applicationLocationSchema = trimmedString
  .pipe(
    z
      .string()
      .max(
        APPLICATION_LOCATION_MAX_LENGTH,
        `Location must be ${APPLICATION_LOCATION_MAX_LENGTH} characters or fewer.`
      )
  )
  .transform((value) => (value.length > 0 ? value : null));

export const applicationJdTextSchema = trimmedString.pipe(
  z
    .string()
    .min(
      APPLICATION_JD_MIN_LENGTH,
      `Paste at least ${APPLICATION_JD_MIN_LENGTH} characters of job description text.`
    )
    .max(
      APPLICATION_JD_MAX_LENGTH,
      `Job description must be ${APPLICATION_JD_MAX_LENGTH.toLocaleString()} characters or fewer.`
    )
);

export const applicationStageSchema = z.enum([
  "PREPARING",
  "APPLIED",
  "COMMUNICATING",
  "INTERVIEWING",
  "OFFER",
  "ARCHIVED",
]);

export const extractJdRequestSchema = z.object({
  jdText: applicationJdTextSchema,
});

export const createApplicationSchema = z.object({
  companyName: applicationCompanySchema,
  jdExtractJson: jdExtractSchema.optional(),
  jdText: applicationJdTextSchema,
  location: applicationLocationSchema,
  roleTitle: applicationRoleSchema,
  stage: applicationStageSchema.default("PREPARING"),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type ExtractJdRequestInput = z.infer<typeof extractJdRequestSchema>;
