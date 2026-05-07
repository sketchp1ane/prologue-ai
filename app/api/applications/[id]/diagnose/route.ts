import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  ApplicationDiagnosisServiceError,
  generateUserApplicationDiagnosis,
} from "@/src/lib/applications/service";
import { getCurrentUserId } from "@/src/lib/auth/current-user";
import { getCurrentLocale } from "@/src/lib/i18n/server";

type ApplicationDiagnoseRouteContext = {
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

async function readRequestBody(request: Request) {
  const text = await request.text();

  if (text.trim().length === 0) {
    return {};
  }

  return JSON.parse(text) as unknown;
}

function serviceErrorResponse(error: ApplicationDiagnosisServiceError) {
  switch (error.code) {
    case "invalid_application_id":
      return apiError(400, "invalid_application_id", error.message);
    case "jd_missing":
      return apiError(400, "jd_missing", error.message);
    case "resume_missing":
      return apiError(400, "resume_missing", error.message);
    case "resume_not_parsed":
      return apiError(400, "resume_not_parsed", error.message);
    case "resume_bullets_missing":
      return apiError(400, "resume_bullets_missing", error.message);
    case "application_not_found":
      return apiError(404, "application_not_found", "Application not found.");
    case "configuration":
      return apiError(
        503,
        "openai_not_configured",
        "OpenAI diagnosis is not configured. Add the required environment variables and restart the dev server."
      );
    case "diagnosis_failed":
    default:
      return apiError(
        502,
        "diagnosis_failed",
        "Could not generate this diagnosis report. Check the resume and JD, then try again."
      );
  }
}

export async function POST(
  request: Request,
  context: ApplicationDiagnoseRouteContext
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return apiError(401, "unauthorized", "Sign in to generate a diagnosis.");
  }

  let body: unknown;

  try {
    body = await readRequestBody(request);
  } catch {
    return apiError(400, "invalid_json", "Request body must be valid JSON.");
  }

  const { id } = await context.params;
  const force =
    typeof body === "object" &&
    body !== null &&
    "force" in body &&
    body.force === true;
  const locale = await getCurrentLocale(userId);

  try {
    const result = await generateUserApplicationDiagnosis(userId, {
      applicationId: id,
      force,
      locale,
    });

    revalidatePath(`/applications/${id}`);

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    if (error instanceof ApplicationDiagnosisServiceError) {
      return serviceErrorResponse(error);
    }

    return apiError(
      502,
      "diagnosis_failed",
      "Could not generate this diagnosis report. Check the resume and JD, then try again."
    );
  }
}
