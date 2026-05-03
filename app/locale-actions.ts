"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  LOCALE_COOKIE_NAME,
  isAppLocale,
} from "@/src/lib/i18n/config";

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function updatePublicLocaleAction(formData: FormData) {
  const locale = readFormString(formData, "locale");

  if (!isAppLocale(locale)) {
    redirect("/");
  }

  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/");
  redirect("/");
}
