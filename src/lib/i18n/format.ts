import type { AppDictionary } from "./dictionaries";
import type { AppLocale } from "./config";

export function formatRelativeDate(
  value: Date | string,
  locale: AppLocale,
  dictionary: Pick<AppDictionary, "date">
) {
  const date = typeof value === "string" ? new Date(value) : value;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diffDays) || diffDays < 0) return dictionary.date.today;
  if (diffDays === 0) return dictionary.date.today;
  if (diffDays === 1) return dictionary.date.yesterday;
  if (diffDays < 7) {
    return dictionary.date.daysAgo.replace("{count}", String(diffDays));
  }
  if (diffDays < 30) {
    return dictionary.date.weeksAgo.replace(
      "{count}",
      String(Math.floor(diffDays / 7))
    );
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(date);
}
