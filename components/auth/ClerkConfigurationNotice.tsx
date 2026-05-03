import Link from "next/link";

import type { AppDictionary } from "@/src/lib/i18n/dictionaries";

type ClerkConfigurationNoticeProps = {
  dictionary: AppDictionary["auth"]["clerkNotice"];
  mode: "sign-in" | "sign-up";
};

export function ClerkConfigurationNotice({
  dictionary,
  mode,
}: ClerkConfigurationNoticeProps) {
  const actionLabel =
    mode === "sign-in" ? dictionary.signInAction : dictionary.signUpAction;

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <p className="text-sm font-medium text-foreground">
        {dictionary.title}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {dictionary.description.replace("{action}", actionLabel)}
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        {dictionary.backHome}
      </Link>
    </div>
  );
}
