import { FeatureCards } from "@/components/landing/FeatureCards";
import { HeroSection } from "@/components/landing/HeroSection";
import { Navbar } from "@/components/landing/Navbar";
import { WorkflowStrip } from "@/components/landing/WorkflowStrip";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);

  return (
    <>
      <Navbar dictionary={dictionary.landing} locale={locale} />
      <main>
        <HeroSection dictionary={dictionary.landing} />
        <FeatureCards dictionary={dictionary.landing} />
        <WorkflowStrip dictionary={dictionary.landing} />
      </main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Prologue</span>
            <span className="text-xs text-muted-foreground">/ 第一页</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {dictionary.landing.footer}
          </p>
        </div>
      </footer>
    </>
  );
}
