import { describe, expect, it } from "vitest";

import { updateApplicationStageSchema } from "../src/lib/validations/application";

describe("application validation", () => {
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
});
