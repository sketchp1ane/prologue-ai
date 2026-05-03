import { FileSearch, Sparkles } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";

export default async function JDExtractPage() {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const copy = dictionary.workspace.jdExtract;

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Card */}
        <AppCard>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <FileSearch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">
                {copy.inputTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                {copy.inputDescription}
              </p>
            </div>
          </div>
          <textarea
            placeholder={copy.placeholder}
            className="min-h-[200px] w-full resize-none rounded-xl border border-border bg-secondary/30 p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {copy.tip}
            </p>
            <Button className="gap-2 rounded-xl">
              <Sparkles className="h-4 w-4" />
              {dictionary.common.analyze}
            </Button>
          </div>
        </AppCard>

        {/* Results Preview Card */}
        <AppCard className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-medium text-foreground">
              {copy.resultsTitle}
            </h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {copy.poweredByAi}
            </span>
          </div>

          {/* Placeholder for results */}
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 p-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">
              {copy.emptyTitle}
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              {copy.emptyDescription}
            </p>
          </div>

          {/* Example of what results would look like */}
          <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {copy.whatYouGet}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {copy.results.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </AppCard>
      </div>
    </>
  );
}
