"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { parseUpdateUserLocaleInput } from "@/src/lib/user-preferences/form";
import { updateUserLocale } from "@/src/lib/user-preferences/service";

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function updateLocaleAction(formData: FormData) {
  const parsed = parseUpdateUserLocaleInput({
    locale: readFormString(formData, "locale"),
  });

  if (!parsed.success) {
    redirect("/settings?error=invalid_locale");
  }

  const userId = await requireCurrentUserId();

  await updateUserLocale(userId, parsed.data.locale);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath("/resumes");

  redirect("/settings?language=saved");
}
