import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("application QA regressions", () => {
  it("lets users click Extract JD on an empty textarea and see a local error", () => {
    const form = readProjectFile(
      "app/(app)/applications/new/ApplicationCreateForm.tsx"
    );

    expect(form).toContain("Paste a job description before extracting.");
    expect(form).toContain("disabled={isExtracting}");
    expect(form).not.toContain("disabled={isExtracting || jdText.trim().length === 0}");
  });

  it("returns a clear development error when OpenAI is not configured", () => {
    const route = readProjectFile("app/api/applications/extract-jd/route.ts");
    const service = readProjectFile("src/lib/ai/services/extract-jd.ts");

    expect(service).toContain('"OPENAI_API_KEY is not configured."');
    expect(service).toContain('"configuration"');
    expect(route).toContain('"openai_not_configured"');
    expect(route).toContain(
      "Add it to .env.local and restart the dev server."
    );
  });
});
