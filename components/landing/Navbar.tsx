import Link from "next/link";

import { LandingAuthControls } from "@/components/landing/LandingAuthControls";
import { HomepageLanguageSelect } from "@/components/landing/HomepageLanguageSelect";
import type { AppLocale } from "@/src/lib/i18n/config";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";

type LandingDictionary = AppDictionary["landing"];

const navLinks = [
  { labelKey: "product", href: "#product" },
  { labelKey: "features", href: "#features" },
  { labelKey: "workflow", href: "#workflow" },
  { labelKey: "pricing", href: "#pricing" },
  { labelKey: "docs", href: "#docs" },
] as const;

export function Navbar({
  dictionary,
  locale,
}: {
  dictionary: LandingDictionary;
  locale: AppLocale;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label={dictionary.aria.prologueHome}
        >
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Prologue
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            / 第一页
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.labelKey}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {dictionary.nav[link.labelKey]}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <HomepageLanguageSelect
            ariaLabel={dictionary.aria.language}
            locale={locale}
          />
          <LandingAuthControls
            signInLabel={dictionary.cta.signIn}
            signUpLabel={dictionary.cta.startFree}
          />
        </div>
      </nav>
    </header>
  );
}
