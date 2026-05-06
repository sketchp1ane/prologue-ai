import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("resume QA regressions", () => {
  it("renders the resume detail page with one visible parse control", () => {
    const detailPage = readProjectFile("app/(app)/resumes/[id]/page.tsx");
    const iconActions = readProjectFile(
      "components/resumes/ResumeDetailIconActions.tsx"
    );

    expect(detailPage).toContain("ResumeParseControl");
    expect(detailPage).toContain("copy.parseTitle");
    expect(detailPage).toContain("copy.parseDescription");
    expect(detailPage).toContain("hasParsedJson={hasStoredParsedJson}");
    expect(iconActions).not.toContain("/api/resumes/${resumeId}/parse");
    expect(iconActions).not.toContain("handleParse");
  });

  it("keeps original resume source text visible from detail", () => {
    const detailPage = readProjectFile("app/(app)/resumes/[id]/page.tsx");

    expect(detailPage).toContain("copy.sourceTitle");
    expect(detailPage).toContain("copy.sourceDescription");
    expect(detailPage).toContain("whitespace-pre-wrap");
    expect(detailPage).toContain("{resume.sourceText}");
    expect(detailPage).toContain("copy.pdfStored");
    expect(detailPage).toContain("copy.noSourceTextStored");
  });

  it("shows specific API parse errors in the client toast", () => {
    const parseControl = readProjectFile(
      "components/resumes/ResumeParseControl.tsx"
    );

    expect(parseControl).toContain("body.error?.message ?? copy.genericError");
    expect(parseControl).toContain("copy.connectionFailed");
  });

  it("does not expand resume detail scope into future AI features", () => {
    const detailPage = readProjectFile("app/(app)/resumes/[id]/page.tsx");

    expect(detailPage).not.toContain("Diagnosis");
    expect(detailPage).not.toContain("Bullet Rewrite");
    expect(detailPage).not.toContain("Streaming");
  });
});
