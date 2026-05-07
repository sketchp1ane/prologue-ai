import "server-only";

import { createHash } from "node:crypto";

import { AiFeature, GenerationStatus, Prisma } from "@prisma/client";
import { zodTextFormat } from "openai/helpers/zod";

import { getReasoningModel } from "@/src/lib/ai/models";
import { getOpenAIClient } from "@/src/lib/ai/openai-client";
import {
  DIAGNOSIS_INSTRUCTIONS,
  DIAGNOSIS_PROMPT_VERSION,
} from "@/src/lib/ai/prompts/diagnosis";
import {
  diagnosisSchema,
  type Diagnosis,
} from "@/src/lib/ai/schemas/diagnosis";
import type { JdExtract } from "@/src/lib/ai/schemas/jd-extract";
import type { ResumeParse } from "@/src/lib/ai/schemas/resume-parse";
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

export async function generateDiagnosis(params: {
  application: {
    companyName: string;
    jdExtract: JdExtract | null;
    jdText: string;
    location: string | null;
    roleTitle: string;
  };
  applicationId: string;
  bullets: DiagnosisResumeBullet[];
  locale: AppLocale;
  parsedResume: ResumeParse;
  resumeId: string;
  userId: string;
}): Promise<Diagnosis> {
  const diagnosisInput = {
    application: params.application,
    resume: params.parsedResume,
    resumeBullets: params.bullets.map((bullet) => ({
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
    bulletCount: params.bullets.length,
    jdTextLength: params.application.jdText.length,
    locale: params.locale,
    promptVersion: DIAGNOSIS_PROMPT_VERSION,
  } satisfies Prisma.InputJsonObject;

  let model: string;

  try {
    model = getReasoningModel();
  } catch (error) {
    const publicError = toPublicServiceError(error);

    await recordGeneration({
      applicationId: params.applicationId,
      errorMessage: safeErrorMessage(error),
      inputHash,
      metadata,
      model: "unconfigured",
      resumeId: params.resumeId,
      status: GenerationStatus.FAILED,
      userId: params.userId,
    });

    throw publicError;
  }

  try {
    const client = getOpenAIClient();
    const response = await client.responses.parse({
      input: `Diagnosis input data:\n\n${serializedInput}`,
      instructions: `${DIAGNOSIS_INSTRUCTIONS}\n\n${getAiOutputLanguageInstruction(
        params.locale
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
    assertRewriteTargetsUseExistingBullets(diagnosis, params.bullets);
    const usage = response.usage as Prisma.InputJsonValue | undefined;
    const { inputTokens, outputTokens } = getUsageTokens(response.usage);

    await recordGeneration({
      applicationId: params.applicationId,
      inputHash,
      inputTokens,
      metadata,
      model,
      outputJson: diagnosis,
      outputTokens,
      resumeId: params.resumeId,
      status: GenerationStatus.SUCCESS,
      usageJson: usage,
      userId: params.userId,
    });

    return diagnosis;
  } catch (error) {
    const publicError = toPublicServiceError(error);

    await recordGeneration({
      applicationId: params.applicationId,
      errorMessage: safeErrorMessage(error),
      inputHash,
      metadata,
      model,
      resumeId: params.resumeId,
      status: GenerationStatus.FAILED,
      userId: params.userId,
    });

    throw publicError;
  }
}
