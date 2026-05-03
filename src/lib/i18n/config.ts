export const SUPPORTED_LOCALES = ["en", "zh-CN"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export const LOCALE_COOKIE_NAME = "prologue-locale";

export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const LOCALE_LABELS = {
  en: "English",
  "zh-CN": "中文",
} satisfies Record<AppLocale, string>;

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" &&
    SUPPORTED_LOCALES.includes(value as AppLocale)
  );
}

export function getLocaleFromCookieValue(value: string | undefined): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}
