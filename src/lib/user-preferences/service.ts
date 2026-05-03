import "server-only";

import { UserLocale } from "@prisma/client";
import { cookies } from "next/headers";

import {
  findUserPreference,
  upsertUserPreferenceLocale,
} from "@/src/lib/db/user-preferences";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  LOCALE_COOKIE_NAME,
  type AppLocale,
} from "@/src/lib/i18n/config";

function toAppLocale(locale: UserLocale): AppLocale {
  return locale === UserLocale.ZH_CN ? "zh-CN" : "en";
}

function toUserLocale(locale: AppLocale): UserLocale {
  return locale === "zh-CN" ? UserLocale.ZH_CN : UserLocale.EN;
}

export async function getUserPreference(userId: string) {
  const preference = await findUserPreference(userId);

  return {
    locale: preference ? toAppLocale(preference.locale) : DEFAULT_LOCALE,
    userId,
  };
}

export async function updateUserLocale(
  userId: string,
  locale: AppLocale,
  options: { persistCookie?: boolean } = {}
) {
  const preference = await upsertUserPreferenceLocale(
    userId,
    toUserLocale(locale)
  );

  if (options.persistCookie ?? true) {
    const cookieStore = await cookies();

    cookieStore.set(LOCALE_COOKIE_NAME, locale, {
      httpOnly: false,
      maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return {
    locale: toAppLocale(preference.locale),
    userId: preference.userId,
  };
}
