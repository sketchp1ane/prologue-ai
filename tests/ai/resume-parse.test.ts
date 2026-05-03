import { describe, expect, it } from "vitest";

import invalidResumeParseFixture from "../fixtures/resume-parse.invalid.json";
import validResumeParseFixture from "../fixtures/resume-parse.valid.json";
import { resumeParseSchema } from "../../src/lib/ai/schemas/resume-parse";

describe("resume parse schema", () => {
  it("accepts a valid resume parse fixture", () => {
    expect(resumeParseSchema.safeParse(validResumeParseFixture).success).toBe(
      true
    );
  });

  it("rejects an invalid resume parse fixture", () => {
    expect(resumeParseSchema.safeParse(invalidResumeParseFixture).success).toBe(
      false
    );
  });
});
