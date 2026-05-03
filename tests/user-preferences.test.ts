import { UserLocale } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => {
  const cookieSet = vi.fn();

  return {
    cookieSet,
    cookies: vi.fn(async () => ({
      set: cookieSet,
    })),
    findUserPreference: vi.fn(),
    upsertUserPreferenceLocale: vi.fn(),
  };
});

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

vi.mock("../src/lib/db/user-preferences", () => ({
  findUserPreference: mocks.findUserPreference,
  upsertUserPreferenceLocale: mocks.upsertUserPreferenceLocale,
}));

import { LOCALE_COOKIE_NAME } from "../src/lib/i18n/config";
import {
  getUserPreference,
  updateUserLocale,
} from "../src/lib/user-preferences/service";

describe("user preference service", () => {
  beforeEach(() => {
    mocks.cookieSet.mockReset();
    mocks.cookies.mockClear();
    mocks.findUserPreference.mockReset();
    mocks.upsertUserPreferenceLocale.mockReset();
  });

  it("defaults to English when no preference exists", async () => {
    mocks.findUserPreference.mockResolvedValue(null);

    await expect(getUserPreference("user_1")).resolves.toEqual({
      locale: "en",
      userId: "user_1",
    });
    expect(mocks.findUserPreference).toHaveBeenCalledWith("user_1");
  });

  it("maps stored Chinese preferences to the app locale", async () => {
    mocks.findUserPreference.mockResolvedValue({
      locale: UserLocale.ZH_CN,
      userId: "user_1",
    });

    await expect(getUserPreference("user_1")).resolves.toEqual({
      locale: "zh-CN",
      userId: "user_1",
    });
  });

  it("upserts by user id and persists the locale cookie", async () => {
    mocks.upsertUserPreferenceLocale.mockResolvedValue({
      locale: UserLocale.ZH_CN,
      userId: "user_1",
    });

    await expect(updateUserLocale("user_1", "zh-CN")).resolves.toEqual({
      locale: "zh-CN",
      userId: "user_1",
    });
    expect(mocks.upsertUserPreferenceLocale).toHaveBeenCalledWith(
      "user_1",
      UserLocale.ZH_CN
    );
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      LOCALE_COOKIE_NAME,
      "zh-CN",
      expect.objectContaining({
        path: "/",
        sameSite: "lax",
      })
    );
  });

  it("can update without writing a cookie for isolated tests", async () => {
    mocks.upsertUserPreferenceLocale.mockResolvedValue({
      locale: UserLocale.EN,
      userId: "user_1",
    });

    await updateUserLocale("user_1", "en", { persistCookie: false });

    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });
});
