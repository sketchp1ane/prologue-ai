"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { createUserApplication } from "@/src/lib/applications/service";
import { jdExtractSchema } from "@/src/lib/ai/schemas/jd-extract";
import { createApplicationSchema } from "@/src/lib/validations/application";

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
    roleTitle: readFormString(formData, "roleTitle"),
    stage: readFormString(formData, "stage") || "PREPARING",
  });

  if (!parsed.success) {
    redirect(withMessage("/applications/new", firstError(parsed.error)));
  }

  const application = await createUserApplication(userId, parsed.data);

  revalidatePath("/applications");
  redirect(`/applications/${application.id}`);
}
