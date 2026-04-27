import "server-only";

import { createHash } from "node:crypto";

import { AiFeature, GenerationStatus, Prisma } from "@prisma/client";
import { zodTextFormat } from "openai/helpers/zod";

import { getOpenAIClient } from "@/src/lib/ai/openai-client";
import {
  JD_EXTRACT_INSTRUCTIONS,
  JD_EXTRACT_PROMPT_VERSION,
} from "@/src/lib/ai/prompts/jd-extract";
import {
  jdExtractSchema,
  type JdExtract,
} from "@/src/lib/ai/schemas/jd-extract";
import { getExtractModel } from "@/src/lib/ai/models";
import { prisma } from "@/src/lib/db/prisma";

type JdExtractServiceErrorCode = "configuration" | "extract_failed";

export class JdExtractServiceError extends Error {
  code: JdExtractServiceErrorCode;

  constructor(message: string, code: JdExtractServiceErrorCode = "extract_failed") {
    super(message);
    this.name = "JdExtractServiceError";
    this.code = code;
  }
}

function hashInput(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 500);
  }

  return "JD extract failed.";
}

function toPublicServiceError(error: unknown) {
  if (
    error instanceof Error &&
    error.message === "OPENAI_API_KEY is not configured."
  ) {
    return new JdExtractServiceError(
      "OPENAI_API_KEY is not configured.",
      "configuration"
    );
  }

  return new JdExtractServiceError("Could not extract this job description.");
}

async function recordGeneration(params: {
  errorMessage?: string;
  inputHash: string;
  model: string;
  outputJson?: JdExtract;
  status: GenerationStatus;
  usageJson?: Prisma.InputJsonValue;
  userId: string;
}) {
  await prisma.aiGeneration.create({
    data: {
      errorMessage: params.errorMessage,
      feature: AiFeature.JD_EXTRACT,
      inputHash: params.inputHash,
      model: params.model,
      outputJson: params.outputJson as Prisma.InputJsonValue | undefined,
      promptVersion: JD_EXTRACT_PROMPT_VERSION,
      status: params.status,
      usageJson: params.usageJson,
      userId: params.userId,
    },
  });
}

export async function extractJd(params: {
  jdText: string;
  userId: string;
}): Promise<JdExtract> {
  const model = getExtractModel();
  const inputHash = hashInput(params.jdText);

  try {
    const client = getOpenAIClient();
    const response = await client.responses.parse({
      input: `Job description data to extract:\n\n${params.jdText}`,
      instructions: JD_EXTRACT_INSTRUCTIONS,
      model,
      text: {
        format: zodTextFormat(jdExtractSchema, "jd_extract"),
      },
    });

    const parsed = response.output_parsed;

    if (!parsed) {
      throw new JdExtractServiceError("The model did not return JD extract data.");
    }

    await recordGeneration({
      inputHash,
      model,
      outputJson: parsed,
      status: GenerationStatus.SUCCESS,
      usageJson: response.usage as Prisma.InputJsonValue | undefined,
      userId: params.userId,
    });

    return parsed;
  } catch (error) {
    const publicError = toPublicServiceError(error);

    await recordGeneration({
      errorMessage: safeErrorMessage(error),
      inputHash,
      model,
      status: GenerationStatus.FAILED,
      userId: params.userId,
    });

    throw publicError;
  }
}
