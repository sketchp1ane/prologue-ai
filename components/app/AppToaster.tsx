"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          closeButton:
            "border-border/70 bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
          error:
            "border-destructive/20 bg-card text-destructive shadow-lg shadow-primary/5",
          success:
            "border-border/70 bg-card text-foreground shadow-lg shadow-primary/5",
          toast:
            "rounded-xl border-[0.5px] px-4 py-3 text-sm leading-5",
        },
        duration: 3500,
      }}
    />
  );
}
