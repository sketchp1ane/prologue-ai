import { cn } from "@/src/lib/utils";
import { ReactNode } from "react";

type AppCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

export function AppCard({
  children,
  className,
  hover = false,
  padding = "md",
}: AppCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm",
        paddingClasses[padding],
        hover &&
          "transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {children}
    </div>
  );
}

type AppCardHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function AppCardHeader({
  title,
  description,
  action,
  className,
}: AppCardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border pb-4",
        className
      )}
    >
      <div>
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

type AppCardContentProps = {
  children: ReactNode;
  className?: string;
};

export function AppCardContent({ children, className }: AppCardContentProps) {
  return <div className={cn("pt-4", className)}>{children}</div>;
}
