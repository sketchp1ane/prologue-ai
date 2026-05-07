import { describe, expect, it } from "vitest";

import validDiagnosisFixture from "../fixtures/diagnosis.valid.json";
import invalidDiagnosisFixture from "../fixtures/diagnosis.invalid.json";
import { diagnosisSchema } from "../../src/lib/ai/schemas/diagnosis";

describe("diagnosis schema", () => {
  it("accepts a valid diagnosis fixture", () => {
    expect(diagnosisSchema.safeParse(validDiagnosisFixture).success).toBe(true);
  });

  it("rejects an invalid diagnosis fixture", () => {
    expect(diagnosisSchema.safeParse(invalidDiagnosisFixture).success).toBe(
      false
    );
  });
});
