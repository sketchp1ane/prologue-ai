import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUserId } from "@/src/lib/auth/current-user";
import {
  extractJd,
  JdExtractServiceError,
} from "@/src/lib/ai/services/extract-jd";
import { extractJdRequestSchema } from "@/src/lib/validations/application";

function apiError(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

function firstError(error: ZodError) {
  return error.issues[0]?.message ?? "Check the request and try again.";
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return apiError(401, "unauthorized", "Sign in to extract a job description.");
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError(400, "invalid_json", "Request body must be valid JSON.");
  }

  const parsed = extractJdRequestSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(400, "invalid_input", firstError(parsed.error));
  }

  try {
    const extract = await extractJd({
      jdText: parsed.data.jdText,
      userId,
    });

    return NextResponse.json({
      data: extract,
    });
  } catch (error) {
    if (
      error instanceof JdExtractServiceError &&
      error.code === "configuration"
    ) {
      return apiError(
        503,
        "openai_not_configured",
        "OPENAI_API_KEY is not configured. Add it to .env.local and restart the dev server."
      );
    }

    return apiError(
      502,
      "jd_extract_failed",
      "Could not extract this job description. You can still enter the fields manually."
    );
  }
}
