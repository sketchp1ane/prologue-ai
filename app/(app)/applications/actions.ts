"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import {
  ApplicationServiceError,
  createUserApplication,
  updateUserApplicationResume,
  updateUserApplicationStage,
} from "@/src/lib/applications/service";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { jdExtractSchema } from "@/src/lib/ai/schemas/jd-extract";
import {
  createApplicationSchema,
  updateApplicationResumeSchema,
  updateApplicationStageSchema,
} from "@/src/lib/validations/application";

type UpdateApplicationStageState = {
  error: string | null;
  status: "idle" | "success";
};

type UpdateApplicationResumeState = {
  error: string | null;
  status: "idle" | "success";
};

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function firstError(error: ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

function withMessage(path: string, message: string) {
  const params = new URLSearchParams({ error: message });

  return `${path}?${params.toString()}`;
}

function parseExtractJson(value: string) {
  if (!value) {
    return {
      data: undefined,
      error: null,
    };
  }

  try {
    const parsed = jdExtractSchema.safeParse(JSON.parse(value));

    if (!parsed.success) {
      return {
        data: undefined,
        error: "The reviewed JD extract is invalid. Run extraction again or reload the page.",
      };
    }

    return {
      data: parsed.data,
      error: null,
    };
  } catch {
    return {
      data: undefined,
      error: "The reviewed JD extract could not be read. Run extraction again or reload the page.",
    };
  }
}

export async function createApplicationAction(formData: FormData) {
  const userId = await requireCurrentUserId();
  const extractJson = parseExtractJson(readFormString(formData, "jdExtractJson"));

  if (extractJson.error) {
    redirect(withMessage("/applications/new", extractJson.error));
  }

  const parsed = createApplicationSchema.safeParse({
    companyName: readFormString(formData, "companyName"),
    jdExtractJson: extractJson.data,
    jdText: readFormString(formData, "jdText"),
    location: readFormString(formData, "location"),
    resumeId: readFormString(formData, "resumeId"),
    roleTitle: readFormString(formData, "roleTitle"),
    stage: readFormString(formData, "stage") || "PREPARING",
  });

  if (!parsed.success) {
    redirect(withMessage("/applications/new", firstError(parsed.error)));
  }

  let application: Awaited<ReturnType<typeof createUserApplication>>;

  try {
    application = await createUserApplication(userId, parsed.data);
  } catch (error) {
    if (error instanceof ApplicationServiceError) {
      redirect(
        withMessage(
          "/applications/new",
          "Choose one of your resumes or leave it unattached."
        )
      );
    }

    throw error;
  }

  revalidatePath("/applications");
  redirect(`/applications/${application.id}`);
}

export async function updateApplicationStageAction(
  _previousState: UpdateApplicationStageState,
  formData: FormData
): Promise<UpdateApplicationStageState> {
  const parsed = updateApplicationStageSchema.safeParse({
    applicationId: readFormString(formData, "applicationId"),
    stage: readFormString(formData, "stage"),
  });

  if (!parsed.success) {
    return {
      error: "Choose a valid stage and try again.",
      status: "idle",
    };
  }

  const userId = await requireCurrentUserId();

  try {
    await updateUserApplicationStage(userId, parsed.data);
  } catch (error) {
    if (error instanceof ApplicationServiceError) {
      return {
        error: "We could not update this application stage.",
        status: "idle",
      };
    }

    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath(`/applications/${parsed.data.applicationId}`);

  return {
    error: null,
    status: "success",
  };
}

export async function updateApplicationResumeAction(
  _previousState: UpdateApplicationResumeState,
  formData: FormData
): Promise<UpdateApplicationResumeState> {
  const parsed = updateApplicationResumeSchema.safeParse({
    applicationId: readFormString(formData, "applicationId"),
    resumeId: readFormString(formData, "resumeId"),
  });

  if (!parsed.success) {
    return {
      error: "Choose a valid resume and try again.",
      status: "idle",
    };
  }

  const userId = await requireCurrentUserId();

  try {
    await updateUserApplicationResume(userId, parsed.data);
  } catch (error) {
    if (error instanceof ApplicationServiceError) {
      return {
        error: "We could not update this application resume.",
        status: "idle",
      };
    }

    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath(`/applications/${parsed.data.applicationId}`);

  return {
    error: null,
    status: "success",
  };
}
