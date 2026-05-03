import { beforeEach, describe, expect, it, vi } from "vitest";

import validResumeParseFixture from "./fixtures/resume-parse.valid.json";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => {
  return {
    completePdfResumeUploadForUser: vi.fn(),
    createPendingPdfResume: vi.fn(),
    deletePrivateResumePdf: vi.fn(),
    deleteResumeForUser: vi.fn(),
    getResumeByIdForUser: vi.fn(),
    markResumeFailedForUser: vi.fn(),
    markResumeParsingForUser: vi.fn(),
    parseResumeFromFile: vi.fn(),
    parseResumeFromText: vi.fn(),
    saveParsedResumeForUser: vi.fn(),
    uploadPrivateResumePdf: vi.fn(),
  };
});

vi.mock("@/src/lib/ai/services/parse-resume", () => ({
  parseResumeFromFile: mocks.parseResumeFromFile,
  parseResumeFromText: mocks.parseResumeFromText,
}));

vi.mock("@/src/lib/db/resumes", () => ({
  completePdfResumeUploadForUser: mocks.completePdfResumeUploadForUser,
  createPendingPdfResume: mocks.createPendingPdfResume,
  createPastedTextResume: vi.fn(),
  deleteResumeForUser: mocks.deleteResumeForUser,
  getResumeByIdForUser: mocks.getResumeByIdForUser,
  listResumesByUser: vi.fn(),
  markResumeFailedForUser: mocks.markResumeFailedForUser,
  markResumeParsingForUser: mocks.markResumeParsingForUser,
  renameResumeForUser: vi.fn(),
  saveParsedResumeForUser: mocks.saveParsedResumeForUser,
}));

vi.mock("@/src/lib/storage/resume-pdf", () => ({
  deletePrivateResumePdf: mocks.deletePrivateResumePdf,
  uploadPrivateResumePdf: mocks.uploadPrivateResumePdf,
}));

import {
  buildResumeBulletsFromParse,
  createUserPdfResume,
  deleteUserResume,
  parseUserResume,
  ResumeServiceError,
} from "../src/lib/resumes/service";

const sourceText =
  "Alex Chen\nFrontend Engineer\nBuilt React and TypeScript onboarding workflows for SaaS customers.";

function mockResume(params?: {
  filePath?: string | null;
  sourceText?: string | null;
  status?: string;
}) {
  mocks.getResumeByIdForUser.mockResolvedValue({
    filePath: params && "filePath" in params ? params.filePath : null,
    id: "resume_1",
    sourceText:
      params && "sourceText" in params ? params.sourceText : sourceText,
    status: params?.status ?? "READY",
    userId: "user_1",
  });
}

async function expectServiceError(
  promise: Promise<unknown>,
  code: ResumeServiceError["code"]
) {
  await expect(promise).rejects.toMatchObject({
    code,
    name: "ResumeServiceError",
  });
}

describe("resume parse state machine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResume();
    mocks.completePdfResumeUploadForUser.mockResolvedValue({
      id: "resume_1",
      userId: "user_1",
    });
    mocks.createPendingPdfResume.mockResolvedValue({
      id: "resume_1",
      userId: "user_1",
    });
    mocks.deletePrivateResumePdf.mockResolvedValue(undefined);
    mocks.deleteResumeForUser.mockResolvedValue({ count: 1 });
    mocks.markResumeParsingForUser.mockResolvedValue({ count: 1 });
    mocks.markResumeFailedForUser.mockResolvedValue({ count: 1 });
    mocks.parseResumeFromFile.mockResolvedValue(validResumeParseFixture);
    mocks.parseResumeFromText.mockResolvedValue(validResumeParseFixture);
    mocks.saveParsedResumeForUser.mockResolvedValue({
      bulletCount: 6,
      resumeUpdated: true,
    });
    mocks.uploadPrivateResumePdf.mockResolvedValue({
      contentLength: 8,
      contentType: "application/pdf",
      downloadUrl: "https://blob.example/resume.pdf?download=1",
      pathname: "resumes/user_hash/resume_1.pdf",
      url: "https://blob.example/resume.pdf",
    });
  });

  it("rejects malformed resume ids before loading data", async () => {
    await expectServiceError(parseUserResume("user_1", ""), "invalid_resume_id");

    expect(mocks.getResumeByIdForUser).not.toHaveBeenCalled();
    expect(mocks.markResumeParsingForUser).not.toHaveBeenCalled();
  });

  it("rejects missing or unauthorized resumes", async () => {
    mocks.getResumeByIdForUser.mockResolvedValue(null);

    await expectServiceError(
      parseUserResume("user_1", "resume_2"),
      "resume_not_found"
    );

    expect(mocks.getResumeByIdForUser).toHaveBeenCalledWith(
      "user_1",
      "resume_2"
    );
    expect(mocks.markResumeParsingForUser).not.toHaveBeenCalled();
  });

  it("rejects resumes without valid source text before changing status", async () => {
    mockResume({
      sourceText: null,
    });

    await expectServiceError(
      parseUserResume("user_1", "resume_1"),
      "resume_source_missing"
    );

    expect(mocks.markResumeParsingForUser).not.toHaveBeenCalled();
    expect(mocks.parseResumeFromText).not.toHaveBeenCalled();
  });

  it("parses PDF resumes from file input when pasted text is absent", async () => {
    mockResume({
      filePath: "resumes/user_hash/resume_1.pdf",
      sourceText: null,
    });

    await expect(parseUserResume("user_1", "resume_1")).resolves.toEqual({
      bulletCount: 6,
      resumeId: "resume_1",
      status: "READY",
    });

    expect(mocks.parseResumeFromText).not.toHaveBeenCalled();
    expect(mocks.parseResumeFromFile).toHaveBeenCalledWith({
      filePath: "resumes/user_hash/resume_1.pdf",
      resumeId: "resume_1",
      userId: "user_1",
    });
  });

  it("rejects resumes that are already parsing", async () => {
    mockResume({
      status: "PARSING",
    });

    await expectServiceError(
      parseUserResume("user_1", "resume_1"),
      "resume_already_parsing"
    );

    expect(mocks.markResumeParsingForUser).not.toHaveBeenCalled();
    expect(mocks.parseResumeFromText).not.toHaveBeenCalled();
  });

  it("treats a failed parsing transition as an in-flight parse", async () => {
    mocks.markResumeParsingForUser.mockResolvedValue({ count: 0 });

    await expectServiceError(
      parseUserResume("user_1", "resume_1"),
      "resume_already_parsing"
    );

    expect(mocks.parseResumeFromText).not.toHaveBeenCalled();
  });

  it("sets parsing, parses text, saves parsed JSON, and creates bullets", async () => {
    await expect(parseUserResume("user_1", "resume_1")).resolves.toEqual({
      bulletCount: 6,
      resumeId: "resume_1",
      status: "READY",
    });

    expect(mocks.markResumeParsingForUser).toHaveBeenCalledWith({
      id: "resume_1",
      userId: "user_1",
    });
    expect(mocks.parseResumeFromText).toHaveBeenCalledWith({
      resumeId: "resume_1",
      sourceText,
      userId: "user_1",
    });
    expect(mocks.parseResumeFromFile).not.toHaveBeenCalled();
    expect(mocks.saveParsedResumeForUser).toHaveBeenCalledWith({
      bullets: expect.arrayContaining([
        expect.objectContaining({
          currentText:
            "Built React and TypeScript interfaces for customer onboarding workflows.",
          orderIndex: 0,
          originalText:
            "Built React and TypeScript interfaces for customer onboarding workflows.",
          resumeId: "resume_1",
          sectionTitle: "Frontend Engineer at Northstar Labs",
          sectionType: "experience",
          userId: "user_1",
        }),
        expect.objectContaining({
          orderIndex: 5,
          sectionTitle: "Interview Tracker",
          sectionType: "project",
        }),
      ]),
      id: "resume_1",
      parsedJson: validResumeParseFixture,
      userId: "user_1",
    });
    expect(mocks.markResumeFailedForUser).not.toHaveBeenCalled();
  });

  it("marks the resume failed when OpenAI parsing fails", async () => {
    mocks.parseResumeFromText.mockRejectedValue(new Error("model failed"));

    await expectServiceError(
      parseUserResume("user_1", "resume_1"),
      "resume_parse_failed"
    );

    expect(mocks.markResumeFailedForUser).toHaveBeenCalledWith({
      id: "resume_1",
      userId: "user_1",
    });
  });

  it("preserves OpenAI configuration failures after setting FAILED", async () => {
    const error = Object.assign(new Error("OPENAI_API_KEY is not configured."), {
      code: "configuration",
      name: "ResumeParseServiceError",
    });
    mocks.parseResumeFromText.mockRejectedValue(error);

    await expectServiceError(parseUserResume("user_1", "resume_1"), "configuration");

    expect(mocks.markResumeFailedForUser).toHaveBeenCalledWith({
      id: "resume_1",
      userId: "user_1",
    });
  });

  it("creates PDF resumes by uploading private storage metadata", async () => {
    const file = new File(["%PDF-1.7"], "resume.pdf", {
      type: "application/pdf",
    });

    await expect(
      createUserPdfResume("user_1", {
        file,
        title: "Frontend PDF",
      })
    ).resolves.toEqual({
      id: "resume_1",
      userId: "user_1",
    });

    expect(mocks.createPendingPdfResume).toHaveBeenCalledWith({
      title: "Frontend PDF",
      userId: "user_1",
    });
    expect(mocks.uploadPrivateResumePdf).toHaveBeenCalledWith({
      file,
      resumeId: "resume_1",
      userId: "user_1",
    });
    expect(mocks.completePdfResumeUploadForUser).toHaveBeenCalledWith({
      filePath: "resumes/user_hash/resume_1.pdf",
      fileUrl: "https://blob.example/resume.pdf",
      id: "resume_1",
      userId: "user_1",
    });
    expect(mocks.markResumeFailedForUser).not.toHaveBeenCalled();
  });

  it("marks PDF resumes failed when storage upload fails", async () => {
    mocks.uploadPrivateResumePdf.mockRejectedValue(new Error("storage failed"));

    await expectServiceError(
      createUserPdfResume("user_1", {
        file: new File(["%PDF-1.7"], "resume.pdf", {
          type: "application/pdf",
        }),
        title: "Frontend PDF",
      }),
      "resume_upload_failed"
    );

    expect(mocks.markResumeFailedForUser).toHaveBeenCalledWith({
      id: "resume_1",
      userId: "user_1",
    });
  });

  it("deletes a stored PDF after deleting the user-owned resume", async () => {
    mockResume({
      filePath: "resumes/user_hash/resume_1.pdf",
    });

    await expect(
      deleteUserResume("user_1", {
        id: "resume_1",
      })
    ).resolves.toEqual({ count: 1 });

    expect(mocks.deleteResumeForUser).toHaveBeenCalledWith({
      id: "resume_1",
      userId: "user_1",
    });
    expect(mocks.deletePrivateResumePdf).toHaveBeenCalledWith(
      "resumes/user_hash/resume_1.pdf"
    );
  });
});

describe("buildResumeBulletsFromParse", () => {
  it("creates ordered experience and project bullets while skipping blanks", () => {
    const bullets = buildResumeBulletsFromParse({
      parsedResume: {
        ...validResumeParseFixture,
        experience: [
          {
            ...validResumeParseFixture.experience[0],
            bullets: [" First bullet. ", "   ", "Second bullet."],
          },
        ],
        projects: [
          {
            ...validResumeParseFixture.projects[0],
            bullets: ["Project bullet."],
          },
        ],
      },
      resumeId: "resume_1",
      userId: "user_1",
    });

    expect(bullets).toEqual([
      expect.objectContaining({
        currentText: "First bullet.",
        orderIndex: 0,
        originalText: "First bullet.",
        sectionTitle: "Frontend Engineer at Northstar Labs",
        sectionType: "experience",
      }),
      expect.objectContaining({
        currentText: "Second bullet.",
        orderIndex: 1,
        originalText: "Second bullet.",
        sectionType: "experience",
      }),
      expect.objectContaining({
        currentText: "Project bullet.",
        orderIndex: 2,
        originalText: "Project bullet.",
        sectionTitle: "Interview Tracker",
        sectionType: "project",
      }),
    ]);
  });
});
