"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function LandingAuthControls({
  signInLabel,
  signUpLabel,
}: {
  signInLabel: string;
  signUpLabel: string;
}) {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <button
            type="button"
            className="hidden h-8 items-center rounded-full border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-secondary sm:inline-flex"
          >
            {signInLabel}
          </button>
        </SignInButton>
        <SignUpButton mode="redirect">
          <Button type="button" size="sm" className="rounded-full px-4">
            {signUpLabel}
          </Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <div className="flex h-8 items-center">
          <UserButton />
        </div>
      </Show>
    </>
  );
}
