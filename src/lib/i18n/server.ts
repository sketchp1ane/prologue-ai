import "server-only";

import { cookies } from "next/headers";

import { isPrismaClientInitializationError } from "@/src/lib/db/errors";
import { getUserPreference } from "@/src/lib/user-preferences/service";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  getLocaleFromCookieValue,
  type AppLocale,
} from "./config";
import { dictionaries } from "./dictionaries";

export async function getCurrentLocale(userId?: string): Promise<AppLocale> {
  if (userId) {
    try {
      const preference = await getUserPreference(userId);

      if (preference.locale) {
        return preference.locale;
      }
    } catch (error) {
      if (!isPrismaClientInitializationError(error)) {
        throw error;
      }
    }
  }

  const cookieStore = await cookies();

  return getLocaleFromCookieValue(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export function getDictionary(locale: AppLocale = DEFAULT_LOCALE) {
  return dictionaries[locale];
}
