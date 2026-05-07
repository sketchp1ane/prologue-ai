import { beforeEach, describe, expect, it, vi } from "vitest";

import validDiagnosisFixture from "./fixtures/diagnosis.valid.json";

const mocks = vi.hoisted(() => {
  class MockApplicationDiagnosisServiceError extends Error {
    code: string;

    constructor(message: string, code = "diagnosis_failed") {
      super(message);
      this.name = "ApplicationDiagnosisServiceError";
      this.code = code;
    }
  }

  return {
    ApplicationDiagnosisServiceError: MockApplicationDiagnosisServiceError,
    generateUserApplicationDiagnosis: vi.fn(),
    getCurrentLocale: vi.fn(),
    getCurrentUserId: vi.fn(),
    revalidatePath: vi.fn(),
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/src/lib/auth/current-user", () => ({
  getCurrentUserId: mocks.getCurrentUserId,
}));

vi.mock("@/src/lib/i18n/server", () => ({
  getCurrentLocale: mocks.getCurrentLocale,
}));

vi.mock("@/src/lib/applications/service", () => ({
  ApplicationDiagnosisServiceError: mocks.ApplicationDiagnosisServiceError,
  generateUserApplicationDiagnosis: mocks.generateUserApplicationDiagnosis,
}));

import { POST } from "../app/api/applications/[id]/diagnose/route";

function routeContext(id: string) {
  return {
    params: Promise.resolve({
      id,
    }),
  };
}

function request(body?: unknown) {
  return new Request("http://localhost/api/applications/application_1/diagnose", {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers:
      body === undefined
        ? undefined
        : {
            "Content-Type": "application/json",
          },
    method: "POST",
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<unknown>;
}

describe("POST /api/applications/[id]/diagnose", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUserId.mockResolvedValue("user_1");
    mocks.getCurrentLocale.mockResolvedValue("en");
    mocks.generateUserApplicationDiagnosis.mockResolvedValue({
      cached: false,
      diagnosis: validDiagnosisFixture,
    });
  });

  it("requires authentication", async () => {
    mocks.getCurrentUserId.mockResolvedValue(null);

    const response = await POST(request(), routeContext("application_1"));

    await expect(readJson(response)).resolves.toEqual({
      error: {
        code: "unauthorized",
        message: "Sign in to generate a diagnosis.",
      },
    });
    expect(response.status).toBe(401);
    expect(mocks.generateUserApplicationDiagnosis).not.toHaveBeenCalled();
  });

  it("returns diagnosis data on success", async () => {
    const response = await POST(
      request({ force: true }),
      routeContext("application_1")
    );

    await expect(readJson(response)).resolves.toEqual({
      data: {
        cached: false,
        diagnosis: validDiagnosisFixture,
      },
    });
    expect(response.status).toBe(200);
    expect(mocks.generateUserApplicationDiagnosis).toHaveBeenCalledWith(
      "user_1",
      {
        applicationId: "application_1",
        force: true,
        locale: "en",
      }
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/applications/application_1"
    );
  });

  it("maps prerequisite errors to stable 400 responses", async () => {
    const cases = [
      {
        code: "resume_missing",
        message: "Attach a resume before generating a diagnosis.",
      },
      {
        code: "resume_not_parsed",
        message: "Run Resume Parse before generating a diagnosis.",
      },
      {
        code: "resume_bullets_missing",
        message: "Run Resume Parse to generate resume bullet records first.",
      },
      {
        code: "jd_missing",
        message: "Application job description is missing.",
      },
    ];

    for (const testCase of cases) {
      mocks.generateUserApplicationDiagnosis.mockRejectedValueOnce(
        new mocks.ApplicationDiagnosisServiceError(
          testCase.message,
          testCase.code
        )
      );

      const response = await POST(request(), routeContext("application_1"));

      await expect(readJson(response)).resolves.toEqual({
        error: {
          code: testCase.code,
          message: testCase.message,
        },
      });
      expect(response.status).toBe(400);
    }
  });

  it("maps service failures to stable status codes", async () => {
    const cases = [
      {
        code: "application_not_found",
        expectedStatus: 404,
        message: "Application not found.",
      },
      {
        code: "configuration",
        expectedCode: "openai_not_configured",
        expectedStatus: 503,
        message:
          "OpenAI diagnosis is not configured. Add the required environment variables and restart the dev server.",
      },
      {
        code: "diagnosis_failed",
        expectedStatus: 502,
        message:
          "Could not generate this diagnosis report. Check the resume and JD, then try again.",
      },
    ];

    for (const testCase of cases) {
      mocks.generateUserApplicationDiagnosis.mockRejectedValueOnce(
        new mocks.ApplicationDiagnosisServiceError(testCase.message, testCase.code)
      );

      const response = await POST(request(), routeContext("application_1"));

      await expect(readJson(response)).resolves.toEqual({
        error: {
          code: testCase.expectedCode ?? testCase.code,
          message: testCase.message,
        },
      });
      expect(response.status).toBe(testCase.expectedStatus);
    }
  });

  it("rejects invalid JSON bodies", async () => {
    const response = await POST(
      new Request("http://localhost", {
        body: "{",
        method: "POST",
      }),
      routeContext("application_1")
    );

    await expect(readJson(response)).resolves.toEqual({
      error: {
        code: "invalid_json",
        message: "Request body must be valid JSON.",
      },
    });
    expect(response.status).toBe(400);
  });
});
