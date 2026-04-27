import { describe, expect, it } from "vitest";

import { jdExtractSchema } from "../src/lib/ai/schemas/jd-extract";

const validJdExtractFixture = {
  companyName: "Acme",
  roleTitle: "Frontend Engineer",
  location: "Remote",
  seniority: "Mid-level",
  employmentType: "Full-time",
  requiredSkills: ["React", "TypeScript"],
  preferredSkills: ["Next.js"],
  responsibilities: ["Build customer-facing product features"],
  keywords: ["frontend", "accessibility", "performance"],
  confidence: 0.86,
  warnings: ["Salary range was not present in the JD."],
};

const invalidJdExtractFixture = {
  companyName: "Acme",
  roleTitle: "Frontend Engineer",
  location: "Remote",
  seniority: "Mid-level",
  employmentType: "Full-time",
  requiredSkills: "React, TypeScript",
  preferredSkills: ["Next.js"],
  responsibilities: ["Build customer-facing product features"],
  keywords: ["frontend"],
  confidence: 1.4,
};

describe("JD extract schema", () => {
  it("accepts a valid JD extract fixture", () => {
    expect(jdExtractSchema.safeParse(validJdExtractFixture).success).toBe(true);
  });

  it("rejects an invalid JD extract fixture", () => {
    expect(jdExtractSchema.safeParse(invalidJdExtractFixture).success).toBe(
      false
    );
  });
});
