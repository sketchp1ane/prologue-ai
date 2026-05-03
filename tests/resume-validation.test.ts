import { describe, expect, it } from "vitest";

import {
  createPastedResumeSchema,
  deleteResumeSchema,
  renameResumeSchema,
  RESUME_PDF_MAX_BYTES,
  RESUME_SOURCE_TEXT_MAX_LENGTH,
  updateParsedResumeSchema,
  validateReplaceResumeSource,
  validateSelectedResumeCreate,
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

  it("validates selected pasted-text resume creation with a shared title", () => {
    const result = validateSelectedResumeCreate({
      file: null,
      sourceText:
        "  Experienced frontend engineer with React and TypeScript systems.  ",
      sourceType: "pasted_text",
      title: "  Frontend resume  ",
    });

    expect(result).toEqual({
      sourceText:
        "Experienced frontend engineer with React and TypeScript systems.",
      sourceType: "pasted_text",
      title: "Frontend resume",
    });
  });

  it("validates selected PDF resume creation with a shared title", () => {
    const file = new File(["%PDF-1.7"], "resume.pdf", {
      type: "application/pdf",
    });

    expect(
      validateSelectedResumeCreate({
        file,
        sourceText: "",
        sourceType: "pdf",
        title: "  Frontend PDF  ",
      })
    ).toEqual({
      file,
      sourceType: "pdf",
      title: "Frontend PDF",
    });
  });

  it("rejects selected creation without active source content", () => {
    expect(() =>
      validateSelectedResumeCreate({
        file: null,
        sourceText: "",
        sourceType: "pasted_text",
        title: "Frontend resume",
      })
    ).toThrow("Choose a resume source.");
  });

  it("rejects selected creation when text and PDF are both present", () => {
    expect(() =>
      validateSelectedResumeCreate({
        file: new File(["%PDF-1.7"], "resume.pdf", {
          type: "application/pdf",
        }),
        sourceText:
          "Experienced frontend engineer with React and TypeScript systems.",
        sourceType: "pasted_text",
        title: "Frontend resume",
      })
    ).toThrow("Choose either pasted text or a PDF, not both.");
  });

  it("rejects invalid selected creation source types", () => {
    expect(() =>
      validateSelectedResumeCreate({
        file: null,
        sourceText:
          "Experienced frontend engineer with React and TypeScript systems.",
        sourceType: "docx",
        title: "Frontend resume",
      })
    ).toThrow();
  });

  it("validates pasted-text resume source replacement", () => {
    expect(
      validateReplaceResumeSource({
        file: null,
        id: "  resume_1  ",
        sourceText:
          "  Experienced frontend engineer with React and TypeScript systems.  ",
        sourceType: "pasted_text",
      })
    ).toEqual({
      id: "resume_1",
      sourceText:
        "Experienced frontend engineer with React and TypeScript systems.",
      sourceType: "pasted_text",
    });
  });

  it("validates PDF resume source replacement", () => {
    const file = new File(["%PDF-1.7"], "replacement.pdf", {
      type: "application/pdf",
    });

    expect(
      validateReplaceResumeSource({
        file,
        id: "resume_1",
        sourceText: "",
        sourceType: "pdf",
      })
    ).toEqual({
      file,
      id: "resume_1",
      sourceType: "pdf",
    });
  });

  it("rejects invalid resume source replacement inputs", () => {
    expect(() =>
      validateReplaceResumeSource({
        file: null,
        id: "resume_1",
        sourceText: "",
        sourceType: "pasted_text",
      })
    ).toThrow("Choose a resume source.");

    expect(() =>
      validateReplaceResumeSource({
        file: new File(["%PDF-1.7"], "resume.pdf", {
          type: "application/pdf",
        }),
        id: "resume_1",
        sourceText:
          "Experienced frontend engineer with React and TypeScript systems.",
        sourceType: "pasted_text",
      })
    ).toThrow("Choose either pasted text or a PDF, not both.");

    expect(() =>
      validateReplaceResumeSource({
        file: new File(["hello"], "resume.txt", {
          type: "text/plain",
        }),
        id: "resume_1",
        sourceText: "",
        sourceType: "pdf",
      })
    ).toThrow("Upload a PDF file only.");
  });

  it("normalizes edited parsed resume fields", () => {
    const result = updateParsedResumeSchema.parse({
      id: "  resume_1  ",
      parsedResume: JSON.stringify({
        basics: {
          email: "  alex@example.com  ",
          links: [" https://example.com ", " "],
          location: "",
          name: "  Alex Chen  ",
          phone: null,
        },
        certifications: [" AWS ", ""],
        education: [
          {
            degree: "",
            endDate: "",
            major: " Computer Science ",
            school: "  State University ",
            startDate: "2018",
          },
          {
            degree: "",
            endDate: "",
            major: "",
            school: "",
            startDate: "",
          },
        ],
        experience: [
          {
            bullets: [" Built onboarding flows. ", ""],
            company: " Northstar Labs ",
            endDate: "",
            location: "",
            startDate: "2022",
            title: " Frontend Engineer ",
          },
        ],
        languages: [" English ", " "],
        projects: [
          {
            bullets: [" Shipped search. ", ""],
            description: "",
            name: " Interview Tracker ",
            technologies: [" React ", ""],
          },
        ],
        skills: [" React ", "", "TypeScript"],
        summary: "  Product-minded engineer.  ",
        warnings: [" Parsed from PDF. ", ""],
      }),
    });

    expect(result).toEqual({
      id: "resume_1",
      parsedResume: {
        basics: {
          email: "alex@example.com",
          links: ["https://example.com"],
          location: null,
          name: "Alex Chen",
          phone: null,
        },
        certifications: ["AWS"],
        education: [
          {
            degree: null,
            endDate: null,
            major: "Computer Science",
            school: "State University",
            startDate: "2018",
          },
        ],
        experience: [
          {
            bullets: ["Built onboarding flows."],
            company: "Northstar Labs",
            endDate: null,
            location: null,
            startDate: "2022",
            title: "Frontend Engineer",
          },
        ],
        languages: ["English"],
        projects: [
          {
            bullets: ["Shipped search."],
            description: null,
            name: "Interview Tracker",
            technologies: ["React"],
          },
        ],
        skills: ["React", "TypeScript"],
        summary: "Product-minded engineer.",
        warnings: ["Parsed from PDF."],
      },
    });
  });

  it("rejects malformed edited parsed resume payloads", () => {
    expect(() =>
      updateParsedResumeSchema.parse({
        id: "",
        parsedResume: "{}",
      })
    ).toThrow();
  });
});
