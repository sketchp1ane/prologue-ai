"use client";

import { FileText, ListTree, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetCloseButton,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { JdExtract } from "@/src/lib/ai/schemas/jd-extract";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";

type ExtractState =
  | { status: "missing"; data: null }
  | { status: "invalid"; data: null }
  | { status: "valid"; data: JdExtract };

type ApplicationJdDrawersProps = {
  dictionary: Pick<AppDictionary, "common" | "workspace">;
  extract: ExtractState;
  jdText: string;
};

export function ApplicationJdDrawers({
  dictionary,
  extract,
  jdText,
}: ApplicationJdDrawersProps) {
  const copy = dictionary.workspace.applicationDetail;

  return (
    <div className="grid gap-2">
      <Drawer
        description={copy.originalJdDescription}
        icon={FileText}
        title={copy.originalJd}
      >
        <pre className="max-h-[calc(100vh-9rem)] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-secondary/20 p-4 text-sm leading-6 text-foreground">
          {jdText}
        </pre>
      </Drawer>

      <Drawer
        description={copy.extractedFieldsDescription}
        icon={ListTree}
        title={copy.extractedFields}
      >
        {extract.status === "valid" ? (
          <div className="flex flex-col gap-5">
            <DetailGrid dictionary={dictionary} extract={extract.data} />
            <ListSection
              dictionary={dictionary}
              title={copy.requiredSkills}
              items={extract.data.requiredSkills}
            />
            <ListSection
              dictionary={dictionary}
              title={copy.preferredSkills}
              items={extract.data.preferredSkills}
            />
            <ListSection
              dictionary={dictionary}
              title={copy.responsibilities}
              items={extract.data.responsibilities}
            />
            <ListSection
              dictionary={dictionary}
              title={copy.keywords}
              items={extract.data.keywords}
            />
            <ListSection
              dictionary={dictionary}
              title={copy.warnings}
              items={extract.data.warnings}
            />
          </div>
        ) : extract.status === "invalid" ? (
          <EmptyDrawerState label={copy.invalidExtract} />
        ) : (
          <EmptyDrawerState label={copy.missingExtract} />
        )}
      </Drawer>
    </div>
  );
}

function Drawer({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-between rounded-xl px-3"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon data-icon="inline-start" aria-hidden="true" />
            <span className="truncate">{title}</span>
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <div>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </div>
          <SheetCloseButton aria-label="Close" />
        </SheetHeader>
        <SheetBody>{children}</SheetBody>
      </SheetContent>
    </Sheet>
  );
}

function DetailGrid({
  dictionary,
  extract,
}: {
  dictionary: Pick<AppDictionary, "common" | "workspace">;
  extract: JdExtract;
}) {
  const copy = dictionary.workspace.applicationDetail;
  const rows = [
    [copy.seniority, extract.seniority],
    [copy.employmentType, extract.employmentType],
    [copy.confidence, `${Math.round(extract.confidence * 100)}%`],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-secondary/20 p-3"
        >
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm text-foreground">
            {value || dictionary.common.notFound}
          </p>
        </div>
      ))}
    </div>
  );
}

function ListSection({
  dictionary,
  items,
  title,
}: {
  dictionary: Pick<AppDictionary, "workspace">;
  items: string[];
  title: string;
}) {
  return (
    <section>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-xs text-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          {dictionary.workspace.applicationDetail.noItemsSaved}
        </p>
      )}
    </section>
  );
}

function EmptyDrawerState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-6 text-sm leading-6 text-muted-foreground">
      {label}
    </div>
  );
}
