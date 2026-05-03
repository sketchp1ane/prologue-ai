import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class MockResumeServiceError extends Error {
    code: string;

    constructor(message: string, code = "resume_parse_failed") {
      super(message);
      this.name = "ResumeServiceError";
      this.code = code;
    }
  }

  return {
    getCurrentUserId: vi.fn(),
    parseUserResume: vi.fn(),
    ResumeServiceError: MockResumeServiceError,
  };
});

vi.mock("@/src/lib/auth/current-user", () => ({
  getCurrentUserId: mocks.getCurrentUserId,
}));

vi.mock("@/src/lib/resumes/service", () => ({
  parseUserResume: mocks.parseUserResume,
  ResumeServiceError: mocks.ResumeServiceError,
}));

import { POST } from "../app/api/resumes/[id]/parse/route";

function routeContext(id: string) {
  return {
    params: Promise.resolve({
      id,
    }),
  };
}

async function readJson(response: Response) {
  return response.json() as Promise<unknown>;
}

describe("POST /api/resumes/[id]/parse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUserId.mockResolvedValue("user_1");
    mocks.parseUserResume.mockResolvedValue({
      bulletCount: 6,
      resumeId: "resume_1",
      status: "READY",
    });
  });

  it("requires authentication", async () => {
    mocks.getCurrentUserId.mockResolvedValue(null);

    const response = await POST(new Request("http://localhost"), routeContext("resume_1"));

    await expect(readJson(response)).resolves.toEqual({
      error: {
        code: "unauthorized",
        message: "Sign in to parse a resume.",
      },
    });
    expect(response.status).toBe(401);
    expect(mocks.parseUserResume).not.toHaveBeenCalled();
  });

  it("returns parse metadata on success without raw resume text", async () => {
    const response = await POST(new Request("http://localhost"), routeContext("resume_1"));

    await expect(readJson(response)).resolves.toEqual({
      data: {
        bulletCount: 6,
        resumeId: "resume_1",
        status: "READY",
      },
    });
    expect(response.status).toBe(200);
    expect(mocks.parseUserResume).toHaveBeenCalledWith("user_1", "resume_1");
  });

  it("maps invalid ids to a 400 response", async () => {
    mocks.parseUserResume.mockRejectedValue(
      new mocks.ResumeServiceError("Resume id is required.", "invalid_resume_id")
    );

    const response = await POST(new Request("http://localhost"), routeContext(""));

    await expect(readJson(response)).resolves.toEqual({
      error: {
        code: "invalid_resume_id",
        message: "Resume id is required.",
      },
    });
    expect(response.status).toBe(400);
  });

  it("maps service errors to stable API codes", async () => {
    const cases = [
      {
        code: "resume_source_missing",
        expectedStatus: 400,
        message: "Paste at least 20 characters of resume text.",
      },
      {
        code: "resume_not_found",
        expectedStatus: 404,
        message: "Resume not found.",
      },
      {
        code: "resume_already_parsing",
        expectedStatus: 409,
        message: "Resume parsing is already in progress.",
      },
      {
        code: "configuration",
        expectedCode: "openai_not_configured",
        expectedStatus: 503,
        message:
          "OpenAI parsing is not configured. Add the required environment variables and restart the dev server.",
      },
      {
        code: "resume_parse_failed",
        expectedStatus: 502,
        message: "Could not parse this resume. Check the source text and try again.",
      },
    ];

    for (const testCase of cases) {
      mocks.parseUserResume.mockRejectedValueOnce(
        new mocks.ResumeServiceError(testCase.message, testCase.code)
      );

      const response = await POST(
        new Request("http://localhost"),
        routeContext("resume_1")
      );

      await expect(readJson(response)).resolves.toEqual({
        error: {
          code: testCase.expectedCode ?? testCase.code,
          message: testCase.message,
        },
      });
      expect(response.status).toBe(testCase.expectedStatus);
    }
  });
});
