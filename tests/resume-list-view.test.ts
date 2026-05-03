import { describe, expect, it } from "vitest";

import {
  getResumeListParseState,
  hasResumeParsedJson,
} from "../src/lib/resumes/list-view";

describe("resume list view helpers", () => {
  it("classifies ready records without parsed JSON as not parsed", () => {
    expect(
      getResumeListParseState({
        parsedJson: null,
        status: "READY",
      })
    ).toBe("not_parsed");
  });

  it("classifies parsing records as parsing", () => {
    expect(
      getResumeListParseState({
        parsedJson: null,
        status: "PARSING",
      })
    ).toBe("parsing");
  });

  it("classifies parsed records as ready", () => {
    expect(
      getResumeListParseState({
        parsedJson: {
          basics: {
            links: [],
          },
        },
        status: "READY",
      })
    ).toBe("ready");
  });

  it("classifies failed records as failed", () => {
    expect(
      getResumeListParseState({
        parsedJson: null,
        status: "FAILED",
      })
    ).toBe("failed");
  });

  it("keeps failed records failed even when parsed JSON exists", () => {
    expect(
      getResumeListParseState({
        parsedJson: {
          stale: true,
        },
        status: "FAILED",
      })
    ).toBe("failed");
  });

  it("checks parsed JSON by nullish presence", () => {
    expect(hasResumeParsedJson(null)).toBe(false);
    expect(hasResumeParsedJson(undefined)).toBe(false);
    expect(hasResumeParsedJson({})).toBe(true);
  });
});
