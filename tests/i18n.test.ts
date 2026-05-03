import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  getLocaleFromCookieValue,
  isAppLocale,
} from "../src/lib/i18n/config";
import { getAiOutputLanguageInstruction } from "../src/lib/i18n/ai";
import { dictionaries } from "../src/lib/i18n/dictionaries";
import { formatRelativeDate } from "../src/lib/i18n/format";
import { parseUpdateUserLocaleInput } from "../src/lib/user-preferences/form";

describe("i18n configuration", () => {
  it("validates the supported workspace locales", () => {
    expect(isAppLocale("en")).toBe(true);
    expect(isAppLocale("zh-CN")).toBe(true);
    expect(isAppLocale("fr")).toBe(false);
    expect(getLocaleFromCookieValue("zh-CN")).toBe("zh-CN");
    expect(getLocaleFromCookieValue("bad-locale")).toBe(DEFAULT_LOCALE);
    expect(LOCALE_COOKIE_NAME).toBe("prologue-locale");
  });

  it("validates settings locale form input", () => {
    expect(parseUpdateUserLocaleInput({ locale: "en" }).success).toBe(true);
    expect(parseUpdateUserLocaleInput({ locale: "zh-CN" }).success).toBe(true);
    expect(parseUpdateUserLocaleInput({ locale: "zh" }).success).toBe(false);
  });

  it("provides AI output language instructions for future features", () => {
    expect(getAiOutputLanguageInstruction("en")).toContain("English");
    expect(getAiOutputLanguageInstruction("zh-CN")).toContain("简体中文");
  });

  it("provides auth page copy in English and Chinese", () => {
    expect(dictionaries.en.auth.signIn.formTitle).toBe("Sign in");
    expect(dictionaries.en.auth.signUp.formTitle).toBe("Create your account");
    expect(dictionaries["zh-CN"].auth.signIn.formTitle).toBe("登录");
    expect(dictionaries["zh-CN"].auth.signUp.formTitle).toBe("创建账号");
    expect(dictionaries["zh-CN"].auth.clerkNotice.title).toContain("Clerk");
  });

  it("formats relative dates with locale-aware dictionary text", () => {
    const now = new Date();

    expect(formatRelativeDate(now, "en", dictionaries.en)).toBe("Today");
    expect(formatRelativeDate(now, "zh-CN", dictionaries["zh-CN"])).toBe("今天");
  });

  it("keeps authenticated workspace dictionary values serializable", () => {
    function collectFunctions(value: unknown): string[] {
      if (typeof value === "function") return ["function"];
      if (!value || typeof value !== "object") return [];

      return Object.values(value).flatMap((item) => collectFunctions(item));
    }

    expect(collectFunctions(dictionaries.en.workspace)).toEqual([]);
    expect(collectFunctions(dictionaries["zh-CN"].workspace)).toEqual([]);
  });

  it("provides authenticated workspace copy in English and Chinese", () => {
    expect(dictionaries.en.workspace.dashboard.title).toBe("Dashboard");
    expect(dictionaries["zh-CN"].workspace.dashboard.title).toBe("工作台");
    expect(dictionaries.en.workspace.resumes.parseStates.notParsed).toBe(
      "Not parsed"
    );
    expect(dictionaries["zh-CN"].workspace.resumes.parseStates.notParsed).toBe(
      "未解析"
    );
    expect(dictionaries.en.workspace.applicationErrors.invalidStage).toContain(
      "valid stage"
    );
    expect(dictionaries["zh-CN"].workspace.applicationErrors.invalidStage).toContain(
      "有效阶段"
    );
  });
});
