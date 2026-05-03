import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/src/lib/auth/current-user";
import {
  parseUserResume,
  ResumeServiceError,
} from "@/src/lib/resumes/service";

type ResumeParseRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

function serviceErrorResponse(error: ResumeServiceError) {
  switch (error.code) {
    case "invalid_resume_id":
      return apiError(400, "invalid_resume_id", error.message);
    case "resume_source_missing":
      return apiError(400, "resume_source_missing", error.message);
    case "resume_not_found":
      return apiError(404, "resume_not_found", "Resume not found.");
    case "resume_already_parsing":
      return apiError(
        409,
        "resume_already_parsing",
        "Resume parsing is already in progress."
      );
    case "configuration":
      return apiError(
        503,
        "openai_not_configured",
        "OpenAI parsing is not configured. Add the required environment variables and restart the dev server."
      );
    case "resume_parse_failed":
    default:
      return apiError(
        502,
        "resume_parse_failed",
        "Could not parse this resume. Check the source text and try again."
      );
  }
}

export async function POST(_request: Request, context: ResumeParseRouteContext) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return apiError(401, "unauthorized", "Sign in to parse a resume.");
  }

  const { id } = await context.params;

  try {
    const result = await parseUserResume(userId, id);

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    if (error instanceof ResumeServiceError) {
      return serviceErrorResponse(error);
    }

    return apiError(
      502,
      "resume_parse_failed",
      "Could not parse this resume. Check the source text and try again."
    );
  }
}
