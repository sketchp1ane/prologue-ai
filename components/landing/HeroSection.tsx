import { Play, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProductMockup } from "@/components/landing/ProductMockup";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 lg:pb-32 lg:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">
                AI copilot for every step of your job search
              </span>
            </div>

            <h1 className="mb-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your AI job-search workspace.
            </h1>

            <p className="mb-8 text-pretty text-lg leading-relaxed text-muted-foreground">
              Parse resumes, analyze job descriptions, rewrite bullets, track applications, and
              prepare for interviews — all in one focused workspace.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
                <Link href="/sign-up">Start Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-border px-6 text-base"
              >
                <a href="#product">
                  <Play className="h-4 w-4" />
                  View Demo
                </a>
              </Button>
            </div>
          </div>

          <div id="product" className="scroll-mt-24">
            <div className="flex justify-center lg:justify-end">
              <ProductMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
