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
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";
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

type MoveApplicationStageState = {
  applicationId?: string;
  error: string | null;
  stage?: string;
  status: "idle" | "success";
};

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function firstError(
  _error: ZodError,
  dictionary: Pick<AppDictionary, "errors">
) {
  return dictionary.errors.checkForm;
}

function withMessage(path: string, message: string) {
  const params = new URLSearchParams({ error: message });

  return `${path}?${params.toString()}`;
}

function parseExtractJson(
  value: string,
  dictionary: Pick<AppDictionary, "workspace">
) {
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
        error: dictionary.workspace.applicationErrors.invalidExtract,
      };
    }

    return {
      data: parsed.data,
      error: null,
    };
  } catch {
    return {
      data: undefined,
      error: dictionary.workspace.applicationErrors.unreadableExtract,
    };
  }
}

export async function createApplicationAction(formData: FormData) {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const extractJson = parseExtractJson(
    readFormString(formData, "jdExtractJson"),
    dictionary
  );

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
    redirect(withMessage("/applications/new", firstError(parsed.error, dictionary)));
  }

  let application: Awaited<ReturnType<typeof createUserApplication>>;

  try {
    application = await createUserApplication(userId, parsed.data);
  } catch (error) {
    if (error instanceof ApplicationServiceError) {
      redirect(
        withMessage(
          "/applications/new",
          dictionary.workspace.applicationErrors.resumeNotOwned
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
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const parsed = updateApplicationStageSchema.safeParse({
    applicationId: readFormString(formData, "applicationId"),
    stage: readFormString(formData, "stage"),
  });

  if (!parsed.success) {
    return {
      error: dictionary.workspace.applicationErrors.invalidStage,
      status: "idle",
    };
  }

  try {
    await updateUserApplicationStage(userId, parsed.data);
  } catch (error) {
    if (error instanceof ApplicationServiceError) {
      return {
        error: dictionary.workspace.applicationErrors.stageUpdateFailed,
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

export async function moveApplicationStageAction(
  input: unknown
): Promise<MoveApplicationStageState> {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const parsed = updateApplicationStageSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: dictionary.workspace.applicationErrors.invalidStage,
      status: "idle",
    };
  }

  try {
    await updateUserApplicationStage(userId, parsed.data);
  } catch (error) {
    if (error instanceof ApplicationServiceError) {
      return {
        applicationId: parsed.data.applicationId,
        error: dictionary.workspace.applicationErrors.stageUpdateFailed,
        stage: parsed.data.stage,
        status: "idle",
      };
    }

    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath(`/applications/${parsed.data.applicationId}`);

  return {
    applicationId: parsed.data.applicationId,
    error: null,
    stage: parsed.data.stage,
    status: "success",
  };
}

export async function updateApplicationResumeAction(
  _previousState: UpdateApplicationResumeState,
  formData: FormData
): Promise<UpdateApplicationResumeState> {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const parsed = updateApplicationResumeSchema.safeParse({
    applicationId: readFormString(formData, "applicationId"),
    resumeId: readFormString(formData, "resumeId"),
  });

  if (!parsed.success) {
    return {
      error: dictionary.workspace.applicationErrors.invalidResume,
      status: "idle",
    };
  }

  try {
    await updateUserApplicationResume(userId, parsed.data);
  } catch (error) {
    if (error instanceof ApplicationServiceError) {
      return {
        error: dictionary.workspace.applicationErrors.resumeUpdateFailed,
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
