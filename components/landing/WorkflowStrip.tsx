import { ArrowRight, Search, Sparkles, TrendingUp, Upload } from "lucide-react";

import type { AppDictionary } from "@/src/lib/i18n/dictionaries";

type LandingDictionary = AppDictionary["landing"];

const stepIcons = [Upload, Search, Sparkles, TrendingUp] as const;

export function WorkflowStrip({
  dictionary,
}: {
  dictionary: LandingDictionary;
}) {
  return (
    <section id="workflow" className="bg-secondary/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center lg:mb-14">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {dictionary.workflow.title}
          </h2>
          <p className="text-muted-foreground">
            {dictionary.workflow.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-0">
          {dictionary.workflow.steps.map((label, index) => {
            const Icon = stepIcons[index] ?? Upload;

            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center px-4 text-center lg:px-8">
                  <div className="relative mb-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {index + 1}
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-sm font-medium text-foreground">
                    {label}
                  </span>
                </div>
                {index < dictionary.workflow.steps.length - 1 && (
                  <ArrowRight className="mx-2 hidden h-5 w-5 text-muted-foreground/50 lg:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
