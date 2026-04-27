import { describe, expect, it } from "vitest";

import {
  appBottomNavItems,
  appNavigationItems,
} from "../components/app/navigation";

describe("app shell navigation", () => {
  it("keeps the initial workspace routes available", () => {
    expect(
      [...appNavigationItems, ...appBottomNavItems].map((item) => item.href)
    ).toEqual([
      "/dashboard",
      "/jd-extract",
      "/resumes",
      "/candidates",
      "/applications",
      "/interviews",
      "/analytics",
      "/settings",
    ]);
  });
});
