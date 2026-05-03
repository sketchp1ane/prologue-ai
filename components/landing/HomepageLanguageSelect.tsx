"use client";

import { Languages } from "lucide-react";

import { updatePublicLocaleAction } from "@/app/locale-actions";
import type { AppLocale } from "@/src/lib/i18n/config";

export function HomepageLanguageSelect({
  ariaLabel,
  locale,
}: {
  ariaLabel: string;
  locale: AppLocale;
}) {
  const nextLocale = locale === "en" ? "zh-CN" : "en";

  return (
    <form action={updatePublicLocaleAction}>
      <input type="hidden" name="locale" value={nextLocale} />
      <button
        type="submit"
        className="flex size-8 items-center justify-center rounded-full bg-transparent text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
