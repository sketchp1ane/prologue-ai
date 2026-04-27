import Link from "next/link";

type ClerkConfigurationNoticeProps = {
  mode: "sign-in" | "sign-up";
};

export function ClerkConfigurationNotice({ mode }: ClerkConfigurationNoticeProps) {
  const actionLabel = mode === "sign-in" ? "sign in" : "sign up";

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <p className="text-sm font-medium text-foreground">
        Clerk is not configured yet.
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to
        `.env.local` to enable {actionLabel}. The public page can still load so
        setup can continue locally.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        Back to homepage
      </Link>
    </div>
  );
}
