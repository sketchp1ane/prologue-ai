import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DEV_CLERK_TICKET_DEFAULT_NEXT_PATH,
  isDevClerkTicketRouteEnabled,
  sanitizeDevClerkTicketNextPath,
} from "@/src/lib/auth/dev-clerk-ticket";

const readProjectFile = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("Clerk auth configuration", () => {
  it("documents custom Clerk auth routes in the environment template", () => {
    const envExample = readProjectFile(".env.example");

    expect(envExample).toContain("NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in");
    expect(envExample).toContain("NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up");
    expect(envExample).toContain("NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard");
    expect(envExample).toContain("NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard");
    expect(envExample).toContain("CLERK_TEST_USER_ID=");
    expect(envExample).not.toContain("user_");
  });

  it("protects the private workspace routes", () => {
    const proxy = readProjectFile("proxy.ts");

    for (const route of [
      "/analytics",
      "/dashboard",
      "/billing",
      "/candidates",
      "/jd-extract",
      "/resumes",
      "/applications",
      "/interviews",
      "/settings",
    ]) {
      expect(proxy).toContain(`${route}(.*)`);
    }
  });

  it("keeps public routes available when Clerk keys are missing locally", () => {
    const proxy = readProjectFile("proxy.ts");
    const signInPage = readProjectFile("app/sign-in/[[...sign-in]]/page.tsx");
    const signUpPage = readProjectFile("app/sign-up/[[...sign-up]]/page.tsx");

    expect(proxy).toContain("hasClerkConfiguration");
    expect(proxy).toContain('NextResponse.redirect(new URL("/sign-in", request.url))');
    expect(proxy).toContain("NextResponse.next()");
    expect(signInPage).toContain("ClerkConfigurationNotice");
    expect(signUpPage).toContain("ClerkConfigurationNotice");
  });

  it("pins Clerk auth completion to the workspace dashboard", () => {
    const signInPage = readProjectFile("app/sign-in/[[...sign-in]]/page.tsx");
    const signUpPage = readProjectFile("app/sign-up/[[...sign-up]]/page.tsx");
    const landingAuthControls = readProjectFile(
      "components/landing/LandingAuthControls.tsx"
    );

    expect(signInPage).toContain('authFallbackRedirectUrl = "/dashboard"');
    expect(signInPage).toContain("fallbackRedirectUrl={authFallbackRedirectUrl}");
    expect(signUpPage).toContain('authFallbackRedirectUrl = "/dashboard"');
    expect(signUpPage).toContain("fallbackRedirectUrl={authFallbackRedirectUrl}");
    expect(landingAuthControls).toContain('authFallbackRedirectUrl = "/dashboard"');
    expect(landingAuthControls).toContain(
      "fallbackRedirectUrl={authFallbackRedirectUrl}"
    );
  });

  it("localizes Clerk components from the root provider", () => {
    const rootLayout = readProjectFile("app/layout.tsx");

    expect(rootLayout).toContain('@clerk/localizations');
    expect(rootLayout).toContain('locale === "zh-CN" ? zhCN : undefined');
    expect(rootLayout).toContain("localization={clerkLocalization}");
  });

  it("keeps the Clerk ticket login route local-only", () => {
    const ticketPage = readProjectFile("app/dev/clerk-ticket/page.tsx");
    const ticketClient = readProjectFile("app/dev/clerk-ticket/ClerkTicketClient.tsx");
    const packageJson = readProjectFile("package.json");
    const script = readProjectFile("scripts/dev-clerk-login.mjs");

    expect(isDevClerkTicketRouteEnabled("development")).toBe(true);
    expect(isDevClerkTicketRouteEnabled("test")).toBe(true);
    expect(isDevClerkTicketRouteEnabled("production")).toBe(false);
    expect(ticketPage).toContain("notFound()");
    expect(ticketPage).toContain("isDevClerkTicketRouteEnabled()");
    expect(ticketClient).toContain("signIn.ticket({");
    expect(ticketClient).toContain("signIn.finalize()");
    expect(packageJson).toContain('"dev:clerk-login"');
    expect(script).toContain("https://api.clerk.com/v1/sign_in_tokens");
    expect(script).not.toContain("CLERK_SECRET_KEY=");
  });

  it("sanitizes Clerk ticket redirect targets to local paths only", () => {
    expect(sanitizeDevClerkTicketNextPath("/applications")).toBe("/applications");
    expect(sanitizeDevClerkTicketNextPath(["/dashboard", "/applications"])).toBe("/dashboard");

    for (const unsafePath of [
      null,
      undefined,
      "",
      "applications",
      "https://example.com/applications",
      "//example.com/applications",
      "/\\example.com/applications",
      "/applications\n/settings",
    ]) {
      expect(sanitizeDevClerkTicketNextPath(unsafePath)).toBe(
        DEV_CLERK_TICKET_DEFAULT_NEXT_PATH
      );
    }
  });
});
