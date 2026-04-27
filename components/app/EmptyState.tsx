import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  statusLabel?: string;
};

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  statusLabel,
}: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card p-8 shadow-sm sm:p-10 lg:p-12">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary/40 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">{eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        {statusLabel ? (
          <div className="mt-8 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm">
            {statusLabel}
          </div>
        ) : null}
      </div>
    </section>
  );
}
