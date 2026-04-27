import type { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  statusLabel?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  children?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  statusLabel,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card p-8 shadow-sm sm:p-10 lg:p-12">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-primary/5 text-primary shadow-sm">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        {eyebrow && (
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-pretty text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        {(action || secondaryAction) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {action && (
              <Button
                asChild={!!action.href}
                onClick={action.onClick}
                className="gap-2 rounded-xl"
              >
                {action.href ? (
                  <a href={action.href}>
                    {action.icon && <action.icon className="h-4 w-4" />}
                    {action.label}
                  </a>
                ) : (
                  <>
                    {action.icon && <action.icon className="h-4 w-4" />}
                    {action.label}
                  </>
                )}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="outline"
                asChild={!!secondaryAction.href}
                onClick={secondaryAction.onClick}
                className="rounded-xl"
              >
                {secondaryAction.href ? (
                  <a href={secondaryAction.href}>{secondaryAction.label}</a>
                ) : (
                  secondaryAction.label
                )}
              </Button>
            )}
          </div>
        )}

        {children}

        {statusLabel && (
          <div className="mt-8 rounded-full border border-border bg-secondary/30 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm">
            {statusLabel}
          </div>
        )}
      </div>
    </section>
  );
}
