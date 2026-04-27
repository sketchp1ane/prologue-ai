import { FeatureCards } from "@/components/landing/FeatureCards";
import { HeroSection } from "@/components/landing/HeroSection";
import { Navbar } from "@/components/landing/Navbar";
import { WorkflowStrip } from "@/components/landing/WorkflowStrip";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeatureCards />
        <WorkflowStrip />
      </main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Prologue</span>
            <span className="text-xs text-muted-foreground">/ 第一页</span>
          </div>
          <p className="text-xs text-muted-foreground">AI job-search workspace</p>
        </div>
      </footer>
    </>
  );
}
