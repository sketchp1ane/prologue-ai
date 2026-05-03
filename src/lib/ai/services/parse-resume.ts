import "server-only";

import { createHash } from "node:crypto";

import { AiFeature, GenerationStatus, Prisma } from "@prisma/client";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getParseModel } from "@/src/lib/ai/models";
import { getOpenAIClient } from "@/src/lib/ai/openai-client";
import {
  RESUME_PARSE_INSTRUCTIONS,
  RESUME_PARSE_PROMPT_VERSION,
} from "@/src/lib/ai/prompts/resume-parse";
import {
  resumeParseSchema,
  type ResumeParse,
} from "@/src/lib/ai/schemas/resume-parse";
import { prisma } from "@/src/lib/db/prisma";
import {
  pastedResumeTextSchema,
  resumeIdSchema,
} from "@/src/lib/validations/resume";

type ResumeParseServiceErrorCode =
  | "configuration"
  | "invalid_input"
  | "parse_failed"
  | "resume_not_found";

export class ResumeParseServiceError extends Error {
  code: ResumeParseServiceErrorCode;

  constructor(
    message: string,
    code: ResumeParseServiceErrorCode = "parse_failed"
  ) {
    super(message);
    this.name = "ResumeParseServiceError";
    this.code = code;
  }
}

const parseResumeInputSchema = z.object({
  resumeId: resumeIdSchema,
  sourceText: pastedResumeTextSchema,
  userId: z
    .string()
    .trim()
    .min(1, "User id is required.")
    .max(128, "User id is invalid."),
});

function hashInput(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 500);
  }

  return "Resume parse failed.";
}

function toPublicServiceError(error: unknown) {
  if (
    error instanceof Error &&
    (error.message === "OPENAI_API_KEY is not configured." ||
      error.message === "OPENAI_MODEL_PARSE is not configured.")
  ) {
    return new ResumeParseServiceError(error.message, "configuration");
  }

  return new ResumeParseServiceError("Could not parse this resume.");
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

async function assertResumeOwnership(params: {
  resumeId: string;
  userId: string;
}) {
  const resume = await prisma.resume.findFirst({
    select: {
      id: true,
    },
    where: {
      id: params.resumeId,
      userId: params.userId,
    },
  });

  if (!resume) {
    throw new ResumeParseServiceError("Resume not found.", "resume_not_found");
  }
}

async function recordGeneration(params: {
  errorMessage?: string;
  inputHash: string;
  inputTokens?: number;
  metadata: Prisma.InputJsonValue;
  model: string;
  outputJson?: ResumeParse;
  outputTokens?: number;
  resumeId: string;
  status: GenerationStatus;
  usageJson?: Prisma.InputJsonValue;
  userId: string;
}) {
  await prisma.aiGeneration.create({
    data: {
      errorMessage: params.errorMessage,
      feature: AiFeature.RESUME_PARSE,
      inputHash: params.inputHash,
      inputTokens: params.inputTokens,
      metadata: params.metadata,
      model: params.model,
      outputJson: params.outputJson as Prisma.InputJsonValue | undefined,
      outputTokens: params.outputTokens,
      promptVersion: RESUME_PARSE_PROMPT_VERSION,
      resumeId: params.resumeId,
      status: params.status,
      usageJson: params.usageJson,
      userId: params.userId,
    },
  });
}

export async function parseResumeFromText(params: {
  resumeId: string;
  sourceText: string;
  userId: string;
}): Promise<ResumeParse> {
  const parsedInput = parseResumeInputSchema.safeParse(params);

  if (!parsedInput.success) {
    throw new ResumeParseServiceError(
      parsedInput.error.issues[0]?.message ?? "Resume parse input is invalid.",
      "invalid_input"
    );
  }

  const { resumeId, sourceText, userId } = parsedInput.data;

  await assertResumeOwnership({
    resumeId,
    userId,
  });

  let model: string;

  try {
    model = getParseModel();
  } catch (error) {
    throw toPublicServiceError(error);
  }

  const inputHash = hashInput(sourceText);
  const metadata = {
    sourceTextLength: sourceText.length,
    sourceType: "pasted_text",
  } satisfies Prisma.InputJsonObject;

  try {
    const client = getOpenAIClient();
    const response = await client.responses.parse({
      input: `Resume text to parse:\n\n${sourceText}`,
      instructions: RESUME_PARSE_INSTRUCTIONS,
      model,
      store: false,
      text: {
        format: zodTextFormat(resumeParseSchema, "resume_parse"),
      },
    });

    if (!response.output_parsed) {
      throw new ResumeParseServiceError(
        "The model did not return resume parse data."
      );
    }

    const resumeParse = resumeParseSchema.parse(response.output_parsed);
    const usage = response.usage as Prisma.InputJsonValue | undefined;
    const { inputTokens, outputTokens } = getUsageTokens(response.usage);

    await recordGeneration({
      inputHash,
      inputTokens,
      metadata,
      model,
      outputJson: resumeParse,
      outputTokens,
      resumeId,
      status: GenerationStatus.SUCCESS,
      usageJson: usage,
      userId,
    });

    return resumeParse;
  } catch (error) {
    const publicError = toPublicServiceError(error);

    await recordGeneration({
      errorMessage: safeErrorMessage(error),
      inputHash,
      metadata,
      model,
      resumeId,
      status: GenerationStatus.FAILED,
      userId,
    });

    throw publicError;
  }
}
