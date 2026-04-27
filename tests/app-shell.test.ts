import { describe, expect, it } from "vitest";

import { appNavigationItems } from "../components/app/navigation";

describe("app shell navigation", () => {
  it("keeps the initial workspace routes available", () => {
    expect(appNavigationItems.map((item) => item.href)).toEqual([
      "/dashboard",
      "/resumes",
      "/applications",
      "/interviews",
      "/settings",
    ]);
  });
});
