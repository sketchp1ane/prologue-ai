import { describe, expect, it } from "vitest";

import {
  createPastedResumeSchema,
  deleteResumeSchema,
  renameResumeSchema,
  RESUME_PDF_MAX_BYTES,
  RESUME_SOURCE_TEXT_MAX_LENGTH,
  validateResumePdfUpload,
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

  it("validates PDF uploads", () => {
    const file = new File(["%PDF-1.7"], "resume.pdf", {
      type: "application/pdf",
    });

    expect(
      validateResumePdfUpload({
        file,
        title: "  Frontend resume  ",
      })
    ).toEqual({
      file,
      title: "Frontend resume",
    });
  });

  it("rejects missing, non-PDF, and oversized PDF uploads", () => {
    expect(() =>
      validateResumePdfUpload({
        file: null,
        title: "Frontend resume",
      })
    ).toThrow("Choose a PDF resume file.");

    expect(() =>
      validateResumePdfUpload({
        file: new File(["hello"], "resume.txt", {
          type: "text/plain",
        }),
        title: "Frontend resume",
      })
    ).toThrow("Upload a PDF file only.");

    expect(() =>
      validateResumePdfUpload({
        file: new File(["x".repeat(RESUME_PDF_MAX_BYTES + 1)], "resume.pdf", {
          type: "application/pdf",
        }),
        title: "Frontend resume",
      })
    ).toThrow("PDF must be 10MB or smaller.");
  });
});
