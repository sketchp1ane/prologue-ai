import "server-only";

import { ApplicationStage, Prisma } from "@prisma/client";
import { z } from "zod";

import {
  diagnosisSchema,
  type Diagnosis,
} from "@/src/lib/ai/schemas/diagnosis";
import { jdExtractSchema } from "@/src/lib/ai/schemas/jd-extract";
import { resumeParseSchema } from "@/src/lib/ai/schemas/resume-parse";
import {
  generateDiagnosis,
  DiagnosisServiceError,
} from "@/src/lib/ai/services/generate-diagnosis";
import {
  createApplicationForUser,
  getApplicationDiagnosisInputForUser,
  getApplicationByIdForUser,
  listApplicationsByUser,
  saveApplicationDiagnosisForUser,
  updateApplicationResumeForUser,
  updateApplicationStageForUser,
} from "@/src/lib/db/applications";
import {
  applicationIdSchema,
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

type ApplicationDiagnosisServiceErrorCode =
  | "application_not_found"
  | "configuration"
  | "diagnosis_failed"
  | "invalid_application_id"
  | "jd_missing"
  | "resume_bullets_missing"
  | "resume_missing"
  | "resume_not_parsed";

export class ApplicationDiagnosisServiceError extends Error {
  code: ApplicationDiagnosisServiceErrorCode;

  constructor(
    message: string,
    code: ApplicationDiagnosisServiceErrorCode = "diagnosis_failed"
  ) {
    super(message);
    this.name = "ApplicationDiagnosisServiceError";
    this.code = code;
  }
}

const generateApplicationDiagnosisSchema = z.object({
  applicationId: applicationIdSchema,
  force: z.boolean().default(false),
  locale: z.enum(["en", "zh-CN"]),
});

export type GenerateApplicationDiagnosisInput = z.input<
  typeof generateApplicationDiagnosisSchema
>;

export async function listUserApplications(userId: string) {
  return listApplicationsByUser(userId);
}

export async function getUserApplication(userId: string, applicationId: string) {
  return getApplicationByIdForUser(userId, applicationId);
}

function firstZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the request and try again.";
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

export async function generateUserApplicationDiagnosis(
  userId: string,
  input: GenerateApplicationDiagnosisInput
): Promise<{
  cached: boolean;
  diagnosis: Diagnosis;
}> {
  const parsed = generateApplicationDiagnosisSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApplicationDiagnosisServiceError(
      firstZodMessage(parsed.error),
      "invalid_application_id"
    );
  }

  const application = await getApplicationDiagnosisInputForUser(
    userId,
    parsed.data.applicationId
  );

  if (!application) {
    throw new ApplicationDiagnosisServiceError(
      "Application not found.",
      "application_not_found"
    );
  }

  const existingDiagnosis = diagnosisSchema.safeParse(application.diagnosisJson);

  if (existingDiagnosis.success && !parsed.data.force) {
    return {
      cached: true,
      diagnosis: existingDiagnosis.data,
    };
  }

  const jdText = application.jdText.trim();

  if (jdText.length === 0) {
    throw new ApplicationDiagnosisServiceError(
      "Application job description is missing.",
      "jd_missing"
    );
  }

  if (!application.resumeId || !application.resume) {
    throw new ApplicationDiagnosisServiceError(
      "Attach a resume before generating a diagnosis.",
      "resume_missing"
    );
  }

  const parsedResume = resumeParseSchema.safeParse(application.resume.parsedJson);

  if (!parsedResume.success) {
    throw new ApplicationDiagnosisServiceError(
      "Run Resume Parse before generating a diagnosis.",
      "resume_not_parsed"
    );
  }

  if (application.resume.bullets.length === 0) {
    throw new ApplicationDiagnosisServiceError(
      "Run Resume Parse to generate resume bullet records first.",
      "resume_bullets_missing"
    );
  }

  const parsedJdExtract = jdExtractSchema.safeParse(application.jdExtractJson);

  let diagnosis: Diagnosis;

  try {
    diagnosis = await generateDiagnosis({
      application: {
        companyName: application.companyName,
        jdExtract: parsedJdExtract.success ? parsedJdExtract.data : null,
        jdText,
        location: application.location,
        roleTitle: application.roleTitle,
      },
      applicationId: application.id,
      bullets: application.resume.bullets,
      locale: parsed.data.locale,
      parsedResume: parsedResume.data,
      resumeId: application.resume.id,
      userId,
    });
  } catch (error) {
    if (error instanceof DiagnosisServiceError) {
      throw new ApplicationDiagnosisServiceError(error.message, error.code);
    }

    throw error;
  }

  const saved = await saveApplicationDiagnosisForUser({
    diagnosisJson: diagnosis as Prisma.InputJsonValue,
    id: application.id,
    userId,
  });

  if (saved.count === 0) {
    throw new ApplicationDiagnosisServiceError(
      "Application not found.",
      "application_not_found"
    );
  }

  return {
    cached: false,
    diagnosis,
  };
}
