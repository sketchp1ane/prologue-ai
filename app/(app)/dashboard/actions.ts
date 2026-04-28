"use server";

import { revalidatePath } from "next/cache";

import {
  ApplicationServiceError,
  updateUserApplicationStage,
} from "@/src/lib/applications/service";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { updateApplicationStageSchema } from "@/src/lib/validations/application";

type UpdateApplicationStageState = {
  error: string | null;
  status: "idle" | "success";
};

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
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
