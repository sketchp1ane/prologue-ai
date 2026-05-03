import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("Clerk auth configuration", () => {
  it("documents custom Clerk auth routes in the environment template", () => {
    const envExample = readProjectFile(".env.example");

    expect(envExample).toContain("NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in");
    expect(envExample).toContain("NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up");
    expect(envExample).toContain("NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard");
    expect(envExample).toContain("NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard");
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

  it("localizes Clerk components from the root provider", () => {
    const rootLayout = readProjectFile("app/layout.tsx");

    expect(rootLayout).toContain('@clerk/localizations');
    expect(rootLayout).toContain('locale === "zh-CN" ? zhCN : undefined');
    expect(rootLayout).toContain("localization={clerkLocalization}");
  });
});
