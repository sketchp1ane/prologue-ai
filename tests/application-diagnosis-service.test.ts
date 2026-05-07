import { beforeEach, describe, expect, it, vi } from "vitest";

import validDiagnosisFixture from "./fixtures/diagnosis.valid.json";
import validResumeParseFixture from "./fixtures/resume-parse.valid.json";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => {
  return {
    createApplicationForUser: vi.fn(),
    generateDiagnosis: vi.fn(),
    getApplicationByIdForUser: vi.fn(),
    getApplicationDiagnosisInputForUser: vi.fn(),
    listApplicationsByUser: vi.fn(),
    saveApplicationDiagnosisForUser: vi.fn(),
    updateApplicationResumeForUser: vi.fn(),
    updateApplicationStageForUser: vi.fn(),
  };
});

vi.mock("@/src/lib/db/applications", () => ({
  createApplicationForUser: mocks.createApplicationForUser,
  getApplicationByIdForUser: mocks.getApplicationByIdForUser,
  getApplicationDiagnosisInputForUser: mocks.getApplicationDiagnosisInputForUser,
  listApplicationsByUser: mocks.listApplicationsByUser,
  saveApplicationDiagnosisForUser: mocks.saveApplicationDiagnosisForUser,
  updateApplicationResumeForUser: mocks.updateApplicationResumeForUser,
  updateApplicationStageForUser: mocks.updateApplicationStageForUser,
}));

vi.mock("@/src/lib/ai/services/generate-diagnosis", () => ({
  DiagnosisServiceError: class DiagnosisServiceError extends Error {
    code: string;

    constructor(message: string, code = "diagnosis_failed") {
      super(message);
      this.name = "DiagnosisServiceError";
      this.code = code;
    }
  },
  generateDiagnosis: mocks.generateDiagnosis,
}));

import {
  ApplicationDiagnosisServiceError,
  generateUserApplicationDiagnosis,
} from "../src/lib/applications/service";

function diagnosisApplication(params?: {
  bullets?: unknown[];
  diagnosisJson?: unknown;
  jdText?: string;
  parsedJson?: unknown;
  resume?: unknown;
  resumeId?: string | null;
}) {
  const resumeId = params && "resumeId" in params ? params.resumeId : "resume_1";
  const resume =
    params && "resume" in params
      ? params.resume
      : {
          bullets:
            params && "bullets" in params
              ? params.bullets
              : [
                  {
                    currentText:
                      "Built React and TypeScript interfaces for customer onboarding workflows.",
                    id: "bullet_1",
                    orderIndex: 0,
                    originalText:
                      "Built React and TypeScript interfaces for customer onboarding workflows.",
                    sectionTitle: "Frontend Engineer at Northstar Labs",
                    sectionType: "experience",
                  },
                ],
          id: resumeId,
          parsedJson:
            params && "parsedJson" in params
              ? params.parsedJson
              : validResumeParseFixture,
          status: "READY",
          title: "Frontend resume",
        };

  return {
    companyName: "Acme",
    diagnosisJson: params?.diagnosisJson ?? null,
    id: "application_1",
    jdExtractJson: null,
    jdText:
      params?.jdText ??
      "Acme is hiring a Frontend Engineer to build React onboarding workflows with TypeScript and accessibility best practices.",
    location: "Remote",
    resume,
    resumeId,
    roleTitle: "Frontend Engineer",
    userId: "user_1",
  };
}

async function expectServiceError(
  promise: Promise<unknown>,
  code: ApplicationDiagnosisServiceError["code"]
) {
  await expect(promise).rejects.toMatchObject({
    code,
    name: "ApplicationDiagnosisServiceError",
  });
}

describe("generateUserApplicationDiagnosis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getApplicationDiagnosisInputForUser.mockResolvedValue(
      diagnosisApplication()
    );
    mocks.generateDiagnosis.mockResolvedValue(validDiagnosisFixture);
    mocks.saveApplicationDiagnosisForUser.mockResolvedValue({ count: 1 });
  });

  it("returns cached diagnosis without calling OpenAI unless forced", async () => {
    mocks.getApplicationDiagnosisInputForUser.mockResolvedValue(
      diagnosisApplication({
        diagnosisJson: validDiagnosisFixture,
      })
    );

    await expect(
      generateUserApplicationDiagnosis("user_1", {
        applicationId: "application_1",
        locale: "en",
      })
    ).resolves.toEqual({
      cached: true,
      diagnosis: validDiagnosisFixture,
    });

    expect(mocks.generateDiagnosis).not.toHaveBeenCalled();
    expect(mocks.saveApplicationDiagnosisForUser).not.toHaveBeenCalled();
  });

  it("loads diagnosis input by application id and user id", async () => {
    await generateUserApplicationDiagnosis("user_1", {
      applicationId: "application_1",
      force: true,
      locale: "en",
    });

    expect(mocks.getApplicationDiagnosisInputForUser).toHaveBeenCalledWith(
      "user_1",
      "application_1"
    );
  });

  it("generates and saves a diagnosis for a ready application", async () => {
    await expect(
      generateUserApplicationDiagnosis("user_1", {
        applicationId: "application_1",
        force: true,
        locale: "en",
      })
    ).resolves.toEqual({
      cached: false,
      diagnosis: validDiagnosisFixture,
    });

    expect(mocks.generateDiagnosis).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: "application_1",
        locale: "en",
        resumeId: "resume_1",
        userId: "user_1",
      })
    );
    expect(mocks.saveApplicationDiagnosisForUser).toHaveBeenCalledWith({
      diagnosisJson: validDiagnosisFixture,
      id: "application_1",
      userId: "user_1",
    });
  });

  it("rejects missing or unauthorized applications before OpenAI", async () => {
    mocks.getApplicationDiagnosisInputForUser.mockResolvedValue(null);

    await expectServiceError(
      generateUserApplicationDiagnosis("user_1", {
        applicationId: "application_2",
        locale: "en",
      }),
      "application_not_found"
    );

    expect(mocks.generateDiagnosis).not.toHaveBeenCalled();
  });

  it("rejects missing resume, unparsed resume, missing bullets, and missing JD", async () => {
    const cases = [
      {
        application: diagnosisApplication({
          resume: null,
          resumeId: null,
        }),
        code: "resume_missing",
      },
      {
        application: diagnosisApplication({
          parsedJson: null,
        }),
        code: "resume_not_parsed",
      },
      {
        application: diagnosisApplication({
          bullets: [],
        }),
        code: "resume_bullets_missing",
      },
      {
        application: diagnosisApplication({
          jdText: "   ",
        }),
        code: "jd_missing",
      },
    ];

    for (const testCase of cases) {
      mocks.getApplicationDiagnosisInputForUser.mockResolvedValueOnce(
        testCase.application
      );

      await expectServiceError(
        generateUserApplicationDiagnosis("user_1", {
          applicationId: "application_1",
          force: true,
          locale: "en",
        }),
        testCase.code as ApplicationDiagnosisServiceError["code"]
      );
    }

    expect(mocks.generateDiagnosis).not.toHaveBeenCalled();
  });
});
