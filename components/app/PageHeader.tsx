import type { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  title: string;
  description?: string;
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

export function PageHeader({
  title,
  description,
  action,
  secondaryAction,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {(action || secondaryAction || children) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {children}
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
        </div>
      )}
    </div>
  );
}
