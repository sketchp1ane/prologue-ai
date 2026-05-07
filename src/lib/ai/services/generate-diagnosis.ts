import "server-only";

import { createHash } from "node:crypto";

import { AiFeature, GenerationStatus, Prisma } from "@prisma/client";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getDiagnoseModel } from "@/src/lib/ai/models";
import { getOpenAIClient } from "@/src/lib/ai/openai-client";
import {
  DIAGNOSIS_INSTRUCTIONS,
  DIAGNOSIS_PROMPT_VERSION,
} from "@/src/lib/ai/prompts/diagnosis";
import {
  diagnosisSchema,
  type Diagnosis,
} from "@/src/lib/ai/schemas/diagnosis";
import { jdExtractSchema } from "@/src/lib/ai/schemas/jd-extract";
import { resumeParseSchema } from "@/src/lib/ai/schemas/resume-parse";
import type { AppLocale } from "@/src/lib/i18n/config";
import { getAiOutputLanguageInstruction } from "@/src/lib/i18n/ai";
import { prisma } from "@/src/lib/db/prisma";

type DiagnosisServiceErrorCode = "configuration" | "diagnosis_failed";

export class DiagnosisServiceError extends Error {
  code: DiagnosisServiceErrorCode;

  constructor(
    message: string,
    code: DiagnosisServiceErrorCode = "diagnosis_failed"
  ) {
    super(message);
    this.name = "DiagnosisServiceError";
    this.code = code;
  }
}

export type DiagnosisResumeBullet = {
  currentText: string;
  id: string;
  orderIndex: number;
  originalText: string;
  sectionTitle: string | null;
  sectionType: string;
};

const diagnosisResumeBulletSchema = z
  .object({
    currentText: z.string().trim().min(1, "Resume bullet text is required."),
    id: z.string().trim().min(1, "Resume bullet id is required."),
    orderIndex: z.number().int(),
    originalText: z.string().trim().min(1, "Original resume bullet is required."),
    sectionTitle: z.string().trim().nullable(),
    sectionType: z.string().trim().min(1, "Resume bullet section is required."),
  })
  .strict();

const generateDiagnosisInputSchema = z
  .object({
    application: z
      .object({
        companyName: z.string().trim().min(1, "Company name is required."),
        jdExtract: jdExtractSchema.nullable(),
        jdText: z
          .string()
          .trim()
          .min(1, "Application job description is missing."),
        location: z.string().trim().nullable(),
        roleTitle: z.string().trim().min(1, "Role title is required."),
      })
      .strict(),
    applicationId: z.string().trim().min(1, "Application id is required."),
    bullets: z
      .array(diagnosisResumeBulletSchema)
      .min(1, "Run Resume Parse to generate resume bullet records first."),
    locale: z.enum(["en", "zh-CN"]),
    parsedResume: resumeParseSchema,
    resumeId: z.string().trim().min(1, "Resume id is required."),
    userId: z.string().trim().min(1, "User id is required."),
  })
  .strict();

type GenerateDiagnosisInput = z.input<typeof generateDiagnosisInputSchema>;

function hashInput(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 500);
  }

  return "Diagnosis generation failed.";
}

function toPublicServiceError(error: unknown) {
  if (
    error instanceof Error &&
    (error.message === "OPENAI_API_KEY is not configured." ||
      error.message === "OPENAI_MODEL_DIAGNOSE is not configured." ||
      error.message === "OPENAI_MODEL_REASONING is not configured.")
  ) {
    return new DiagnosisServiceError(error.message, "configuration");
  }

  return new DiagnosisServiceError("Could not generate this diagnosis report.");
}

function getUsageTokens(usage: unknown) {
  if (!usage || typeof usage !== "object") {
    return {};
  }

  const inputTokens = "input_tokens" in usage ? usage.input_tokens : undefined;
  const outputTokens =
    "output_tokens" in usage ? usage.output_tokens : undefined;

  return {
    inputTokens: typeof inputTokens === "number" ? inputTokens : undefined,
    outputTokens: typeof outputTokens === "number" ? outputTokens : undefined,
  };
}

function firstZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Diagnosis input is invalid.";
}

function assertRewriteTargetsUseExistingBullets(
  diagnosis: Diagnosis,
  bullets: DiagnosisResumeBullet[]
) {
  const bulletIds = new Set(bullets.map((bullet) => bullet.id));
  const unknownTarget = diagnosis.rewriteTargets.find(
    (target) => !bulletIds.has(target.resumeBulletId)
  );

  if (unknownTarget) {
    throw new DiagnosisServiceError(
      "Diagnosis referenced an unknown resume bullet."
    );
  }
}

async function recordGeneration(params: {
  applicationId: string;
  errorMessage?: string;
  inputHash: string;
  inputTokens?: number;
  metadata: Prisma.InputJsonValue;
  model: string;
  outputJson?: Diagnosis;
  outputTokens?: number;
  resumeId: string;
  status: GenerationStatus;
  usageJson?: Prisma.InputJsonValue;
  userId: string;
}) {
  await prisma.aiGeneration.create({
    data: {
      applicationId: params.applicationId,
      errorMessage: params.errorMessage,
      feature: AiFeature.DIAGNOSIS,
      inputHash: params.inputHash,
      inputTokens: params.inputTokens,
      metadata: params.metadata,
      model: params.model,
      outputJson: params.outputJson as Prisma.InputJsonValue | undefined,
      outputTokens: params.outputTokens,
      promptVersion: DIAGNOSIS_PROMPT_VERSION,
      resumeId: params.resumeId,
      status: params.status,
      usageJson: params.usageJson,
      userId: params.userId,
    },
  });
}

async function recordInputValidationFailure(
  params: GenerateDiagnosisInput,
  error: z.ZodError
) {
  const applicationId =
    typeof params.applicationId === "string" && params.applicationId.trim()
      ? params.applicationId.trim()
      : null;
  const resumeId =
    typeof params.resumeId === "string" && params.resumeId.trim()
      ? params.resumeId.trim()
      : null;
  const userId =
    typeof params.userId === "string" && params.userId.trim()
      ? params.userId.trim()
      : null;

  if (!applicationId || !resumeId || !userId) {
    return;
  }

  const jdTextLength =
    typeof params.application?.jdText === "string"
      ? params.application.jdText.trim().length
      : 0;
  const bulletCount = Array.isArray(params.bullets) ? params.bullets.length : 0;
  const metadata = {
    bulletCount,
    jdTextLength,
    locale:
      params.locale === "en" || params.locale === "zh-CN"
        ? params.locale
        : "unknown",
    promptVersion: DIAGNOSIS_PROMPT_VERSION,
    validationFailure: true,
  } satisfies Prisma.InputJsonObject;
  const inputHash = hashInput(
    JSON.stringify({
      applicationId,
      bulletCount,
      jdTextLength,
      promptVersion: DIAGNOSIS_PROMPT_VERSION,
      resumeId,
      userId,
    })
  );

  await recordGeneration({
    applicationId,
    errorMessage: firstZodMessage(error),
    inputHash,
    metadata,
    model: "not_called",
    resumeId,
    status: GenerationStatus.FAILED,
    userId,
  });
}

export async function generateDiagnosis(
  params: GenerateDiagnosisInput
): Promise<Diagnosis> {
  const parsedInput = generateDiagnosisInputSchema.safeParse(params);

  if (!parsedInput.success) {
    await recordInputValidationFailure(params, parsedInput.error);

    throw new DiagnosisServiceError(firstZodMessage(parsedInput.error));
  }

  const parsedParams = parsedInput.data;
  const diagnosisInput = {
    application: parsedParams.application,
    resume: parsedParams.parsedResume,
    resumeBullets: parsedParams.bullets.map((bullet) => ({
      currentText: bullet.currentText,
      id: bullet.id,
      originalText: bullet.originalText,
      sectionTitle: bullet.sectionTitle,
      sectionType: bullet.sectionType,
    })),
  };
  const serializedInput = JSON.stringify(diagnosisInput);
  const inputHash = hashInput(serializedInput);
  const metadata = {
    bulletCount: parsedParams.bullets.length,
    jdTextLength: parsedParams.application.jdText.length,
    locale: parsedParams.locale,
    promptVersion: DIAGNOSIS_PROMPT_VERSION,
  } satisfies Prisma.InputJsonObject;

  let model: string;

  try {
    model = getDiagnoseModel();
  } catch (error) {
    const publicError = toPublicServiceError(error);

    await recordGeneration({
      applicationId: parsedParams.applicationId,
      errorMessage: safeErrorMessage(error),
      inputHash,
      metadata,
      model: "unconfigured",
      resumeId: parsedParams.resumeId,
      status: GenerationStatus.FAILED,
      userId: parsedParams.userId,
    });

    throw publicError;
  }

  try {
    const client = getOpenAIClient();
    const response = await client.responses.parse({
      input: `Diagnosis input data:\n\n${serializedInput}`,
      instructions: `${DIAGNOSIS_INSTRUCTIONS}\n\n${getAiOutputLanguageInstruction(
        parsedParams.locale as AppLocale
      )}`,
      model,
      store: false,
      text: {
        format: zodTextFormat(diagnosisSchema, "diagnosis"),
      },
    });

    if (!response.output_parsed) {
      throw new DiagnosisServiceError(
        "The model did not return diagnosis data."
      );
    }

    const diagnosis = diagnosisSchema.parse(response.output_parsed);
    assertRewriteTargetsUseExistingBullets(diagnosis, parsedParams.bullets);
    const usage = response.usage as Prisma.InputJsonValue | undefined;
    const { inputTokens, outputTokens } = getUsageTokens(response.usage);

    await recordGeneration({
      applicationId: parsedParams.applicationId,
      inputHash,
      inputTokens,
      metadata,
      model,
      outputJson: diagnosis,
      outputTokens,
      resumeId: parsedParams.resumeId,
      status: GenerationStatus.SUCCESS,
      usageJson: usage,
      userId: parsedParams.userId,
    });

    return diagnosis;
  } catch (error) {
    const publicError = toPublicServiceError(error);

    await recordGeneration({
      applicationId: parsedParams.applicationId,
      errorMessage: safeErrorMessage(error),
      inputHash,
      metadata,
      model,
      resumeId: parsedParams.resumeId,
      status: GenerationStatus.FAILED,
      userId: parsedParams.userId,
    });

    throw publicError;
  }
}
