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

    for (const route of ["/dashboard", "/resumes", "/applications", "/interviews", "/settings"]) {
      expect(proxy).toContain(`${route}(.*)`);
    }
  });
});
