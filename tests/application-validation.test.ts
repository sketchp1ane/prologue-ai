import { describe, expect, it } from "vitest";

import {
  createApplicationSchema,
  updateApplicationResumeSchema,
  updateApplicationStageSchema,
} from "../src/lib/validations/application";

describe("application validation", () => {
  it("normalizes optional resume ids during application creation", () => {
    expect(
      createApplicationSchema.parse({
        companyName: "Acme",
        jdText:
          "This is a long enough job description for a frontend engineer role.",
        location: "",
        resumeId: "  resume_1  ",
        roleTitle: "Frontend Engineer",
      })
    ).toMatchObject({
      location: null,
      resumeId: "resume_1",
      stage: "PREPARING",
    });

    expect(
      createApplicationSchema.parse({
        companyName: "Acme",
        jdText:
          "This is a long enough job description for a frontend engineer role.",
        location: "",
        resumeId: "",
        roleTitle: "Frontend Engineer",
      })
    ).toMatchObject({
      resumeId: null,
    });
  });

  it("validates and trims stage update input", () => {
    expect(
      updateApplicationStageSchema.parse({
        applicationId: "  application_1  ",
        stage: "COMMUNICATING",
      })
    ).toEqual({
      applicationId: "application_1",
      stage: "COMMUNICATING",
    });
  });

  it("rejects invalid stage update input", () => {
    expect(() =>
      updateApplicationStageSchema.parse({
        applicationId: "",
        stage: "SCREENING",
      })
    ).toThrow();
  });

  it("validates and normalizes resume attachment input", () => {
    expect(
      updateApplicationResumeSchema.parse({
        applicationId: "  application_1  ",
        resumeId: "  resume_1  ",
      })
    ).toEqual({
      applicationId: "application_1",
      resumeId: "resume_1",
    });

    expect(
      updateApplicationResumeSchema.parse({
        applicationId: "application_1",
        resumeId: "",
      })
    ).toEqual({
      applicationId: "application_1",
      resumeId: null,
    });

    expect(
      updateApplicationResumeSchema.parse({
        applicationId: "application_1",
        resumeId: null,
      })
    ).toEqual({
      applicationId: "application_1",
      resumeId: null,
    });
  });
});
