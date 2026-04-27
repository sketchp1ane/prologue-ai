import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Lock, Sparkles } from "lucide-react";

import { SignInPreview } from "@/components/auth/SignInPreview";

export const metadata: Metadata = {
  title: "Sign in - Prologue / 第一页",
  description:
    "Sign in to your Prologue workspace to continue parsing resumes, analyzing job descriptions, and tracking applications.",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "oklch(0.205 0 0)",
    colorText: "oklch(0.145 0 0)",
    colorTextSecondary: "oklch(0.556 0 0)",
    colorBackground: "oklch(1 0 0)",
    colorInputBackground: "oklch(1 0 0)",
    colorInputText: "oklch(0.145 0 0)",
    colorDanger: "oklch(0.577 0.245 27.325)",
    borderRadius: "0.625rem",
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    fontSize: "14px",
    spacingUnit: "1rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox:
      "w-full shadow-none border-0 bg-transparent rounded-none [&_.cl-internal-1dauvpw]:bg-transparent",
    card: "w-full bg-transparent shadow-none border-0 p-0 rounded-none",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    main: "gap-4",
    socialButtons: "gap-2",
    socialButtonsBlockButton:
      "h-11 rounded-lg border border-border bg-card text-foreground font-medium text-sm shadow-none transition-colors hover:bg-secondary hover:text-foreground",
    socialButtonsBlockButtonText: "text-sm font-medium text-foreground",
    socialButtonsProviderIcon: "size-4",
    dividerRow: "my-2",
    dividerLine: "bg-border",
    dividerText:
      "text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
    formFieldRow: "gap-2",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldInput:
      "h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40",
    formFieldInputShowPasswordButton:
      "text-muted-foreground hover:text-foreground",
    formFieldAction:
      "text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
    formFieldHintText: "text-xs text-muted-foreground",
    formFieldErrorText: "text-xs font-medium text-destructive",
    formButtonPrimary:
      "h-11 rounded-lg bg-primary text-sm font-medium text-primary-foreground normal-case tracking-normal shadow-none transition-colors hover:bg-primary/90 focus:bg-primary/90 disabled:opacity-60",
    formButtonReset:
      "h-11 rounded-lg border border-border bg-card text-foreground hover:bg-secondary",
    identityPreview:
      "rounded-lg border border-border bg-card text-sm text-foreground",
    identityPreviewEditButton:
      "text-muted-foreground hover:text-foreground",
    formResendCodeLink:
      "text-xs font-medium text-foreground hover:text-foreground/80",
    otpCodeFieldInput:
      "h-11 w-11 rounded-lg border border-border bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/40",
    alert:
      "rounded-lg border border-destructive/30 bg-destructive/5 text-destructive",
    alertText: "text-xs font-medium text-destructive",
    footer: "hidden",
    footerAction: "hidden",
    footerActionText: "text-xs text-muted-foreground",
    footerActionLink:
      "text-xs font-medium text-foreground hover:text-foreground/80",
  },
} as const;

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background — echoes the homepage hero treatment */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/60 via-background to-background"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,oklch(0.92_0_0/0.5)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0_0/0.5)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-[-10%] hidden h-[420px] w-[420px] rounded-full bg-primary/5 blur-3xl lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-[-15%] hidden h-[380px] w-[380px] rounded-full bg-foreground/[0.04] blur-3xl lg:block"
      />

      {/* Top brand bar */}
      <header className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-baseline gap-1.5"
          aria-label="Prologue home"
        >
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Prologue
          </span>
          <span className="text-xs text-muted-foreground">/ 第一页</span>
        </Link>
        <p className="hidden text-sm text-muted-foreground sm:block">
          New here?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          >
            Create an account
          </Link>
        </p>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-6 pb-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: hero-style visual panel (desktop only) */}
          <section
            aria-hidden="true"
            className="hidden flex-col gap-8 lg:flex"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">
                Welcome back to your workspace
              </span>
            </div>

            <div className="max-w-md space-y-5">
              <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground">
                Pick up where you left off.
              </h1>
              <p className="text-pretty text-base leading-relaxed text-muted-foreground">
                Sign in to continue parsing resumes, diagnosing job descriptions,
                and tracking every application — all in one focused workspace.
              </p>
            </div>

            <SignInPreview />
          </section>

          {/* Right: form card */}
          <section className="mx-auto flex w-full max-w-md flex-col">
            <div className="mb-6 lg:hidden">
              <Link href="/" className="flex items-baseline gap-1.5">
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  Prologue
                </span>
                <span className="text-sm text-muted-foreground">/ 第一页</span>
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl shadow-primary/[0.04] backdrop-blur-sm sm:p-8">
              <div className="mb-6 space-y-1.5">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Sign in
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your details to access your Prologue workspace.
                </p>
              </div>

              <SignIn appearance={clerkAppearance} />

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              <span>Secured by Clerk · End-to-end encrypted in transit</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
