import { describe, expect, it } from "vitest";

import {
  appBottomNavItems,
  appNavigationItems,
} from "../components/app/navigation";
import { dictionaries } from "../src/lib/i18n/dictionaries";

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

  it("resolves navigation labels from English and Chinese dictionaries", () => {
    const items = [...appNavigationItems, ...appBottomNavItems];

    expect(items.map((item) => dictionaries.en.appShell.navigation[item.labelKey]))
      .toContain("Dashboard");
    expect(
      items.map((item) => dictionaries["zh-CN"].appShell.navigation[item.labelKey])
    ).toContain("工作台");
  });
});
