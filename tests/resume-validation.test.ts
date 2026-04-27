import { describe, expect, it } from "vitest";

import {
  createPastedResumeSchema,
  deleteResumeSchema,
  renameResumeSchema,
  RESUME_SOURCE_TEXT_MAX_LENGTH,
} from "../src/lib/validations/resume";

describe("resume validation", () => {
  it("trims pasted resume create input", () => {
    const result = createPastedResumeSchema.parse({
      sourceText: "  Experienced frontend engineer with React and TypeScript.  ",
      title: "  Frontend resume  ",
    });

    expect(result).toEqual({
      sourceText: "Experienced frontend engineer with React and TypeScript.",
      title: "Frontend resume",
    });
  });

  it("requires meaningful pasted text", () => {
    expect(() =>
      createPastedResumeSchema.parse({
        sourceText: "too short",
        title: "Frontend resume",
      })
    ).toThrow("Paste at least 20 characters");
  });

  it("caps pasted text length", () => {
    expect(() =>
      createPastedResumeSchema.parse({
        sourceText: "x".repeat(RESUME_SOURCE_TEXT_MAX_LENGTH + 1),
        title: "Frontend resume",
      })
    ).toThrow("Resume text must be");
  });

  it("validates rename input", () => {
    expect(
      renameResumeSchema.parse({
        id: "  resume_1  ",
        title: "  Product resume  ",
      })
    ).toEqual({
      id: "resume_1",
      title: "Product resume",
    });
  });

  it("validates delete input", () => {
    expect(deleteResumeSchema.parse({ id: "  resume_1  " })).toEqual({
      id: "resume_1",
    });
  });
});
