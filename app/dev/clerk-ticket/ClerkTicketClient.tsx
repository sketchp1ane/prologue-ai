"use client";

import { useSignIn, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ClerkTicketClientProps = {
  nextPath: string;
  token: string | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "errors" in error) {
    const clerkError = error as {
      errors?: Array<{ longMessage?: string; long_message?: string; message?: string }>;
    };

    return (
      clerkError.errors?.[0]?.longMessage ??
      clerkError.errors?.[0]?.long_message ??
      clerkError.errors?.[0]?.message
    );
  }

  return null;
}

export function ClerkTicketClient({
  nextPath,
  token,
}: ClerkTicketClientProps) {
  const router = useRouter();
  const signInState = useSignIn();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const consumedTokenRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const displayError = error ?? (token ? null : "Missing Clerk sign-in token.");

  useEffect(() => {
    if (!signInState.isLoaded || !isUserLoaded || consumedTokenRef.current) {
      return;
    }

    if (isSignedIn) {
      router.replace(nextPath);
      return;
    }

    const ticket = token ?? "";

    if (!ticket) {
      return;
    }

    const { setActive, signIn } = signInState;
    consumedTokenRef.current = true;

    async function consumeTicket() {
      try {
        const signInAttempt = await signIn.create({
          strategy: "ticket",
          ticket,
        });

        if (
          signInAttempt.status !== "complete" ||
          !signInAttempt.createdSessionId
        ) {
          setError("Clerk sign-in is not complete for this token.");
          return;
        }

        await setActive({
          session: signInAttempt.createdSessionId,
        });

        router.replace(nextPath);
      } catch (error) {
        const message = getErrorMessage(error);

        setError(
          message
            ? `Could not complete Clerk ticket sign-in: ${message}`
            : "Could not complete Clerk ticket sign-in."
        );
      }
    }

    void consumeTicket();
  }, [
    isSignedIn,
    isUserLoaded,
    nextPath,
    router,
    signInState,
    token,
  ]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        {displayError ? (
          <>
            <h1 className="text-lg font-semibold text-foreground">
              Clerk ticket sign-in failed
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {displayError} Generate a fresh local login link and try again.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-foreground">
              Signing in with Clerk
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Consuming a local development ticket and opening your workspace.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
