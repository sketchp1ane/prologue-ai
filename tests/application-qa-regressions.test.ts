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
    expect(form).toContain("Could not reach JD extraction.");
    expect(form).not.toContain("disabled={isExtracting || jdText.trim().length === 0}");
  });

  it("shows save and route-level async states for applications", () => {
    const form = readProjectFile(
      "app/(app)/applications/new/ApplicationCreateForm.tsx"
    );
    const loading = readProjectFile("app/(app)/applications/loading.tsx");
    const error = readProjectFile("app/(app)/applications/error.tsx");

    expect(form).toContain("useFormStatus");
    expect(form).toContain("Saving...");
    expect(form).toContain("No resume attached");
    expect(form).toContain('href="/resumes/new"');
    expect(loading).toContain("Loading your tracked applications.");
    expect(error).toContain("Applications could not load");
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

  it("hardens the application detail page without expanding AI scope", () => {
    const detailPage = readProjectFile("app/(app)/applications/[id]/page.tsx");
    const notFound = readProjectFile(
      "app/(app)/applications/[id]/not-found.tsx"
    );
    const stageSelect = readProjectFile(
      "components/applications/ApplicationStageSelect.tsx"
    );
    const resumeSelect = readProjectFile(
      "components/applications/ApplicationResumeSelect.tsx"
    );
    const actions = readProjectFile("app/(app)/applications/actions.ts");

    expect(detailPage).toContain("ApplicationStageSelect");
    expect(detailPage).toContain("ApplicationResumeSelect");
    expect(detailPage).toContain('href="/applications"');
    expect(detailPage).toContain('href="/dashboard"');
    expect(detailPage).toContain('href={`/resumes/${application.resume.id}`}');
    expect(detailPage).toContain("Attached resume");
    expect(detailPage).toContain("No resume attached");
    expect(detailPage).toContain('label="Company"');
    expect(detailPage).toContain('label="Role"');
    expect(detailPage).toContain('label="Location"');
    expect(detailPage).toContain('label="Stage"');
    expect(detailPage).toContain('label="Created"');
    expect(detailPage).toContain('label="Updated"');
    expect(detailPage).toContain("Original JD");
    expect(detailPage).toContain("Seniority");
    expect(detailPage).toContain("Employment type");
    expect(detailPage).toContain("Required skills");
    expect(detailPage).toContain("Preferred skills");
    expect(detailPage).toContain("Responsibilities");
    expect(detailPage).toContain("Keywords");
    expect(detailPage).toContain("Warnings");
    expect(detailPage).toContain("could not be displayed safely");
    expect(detailPage).not.toContain("Diagnosis");
    expect(detailPage).not.toContain("Bullet Rewrite");
    expect(notFound).toContain("may not belong to the current workspace");
    expect(notFound).toContain('href="/applications"');
    expect(notFound).toContain('href="/dashboard"');
    expect(stageSelect).toContain("updateApplicationStageAction");
    expect(resumeSelect).toContain("updateApplicationResumeAction");
    expect(resumeSelect).toContain("No resume attached");
    expect(actions).toContain("updateUserApplicationStage");
    expect(actions).toContain("updateUserApplicationResume");
    expect(actions).toContain(
      "revalidatePath(`/applications/${parsed.data.applicationId}`)"
    );
  });

  it("renders the dashboard with a draggable compact application board", () => {
    const dashboard = readProjectFile("app/(app)/dashboard/page.tsx");
    const board = readProjectFile(
      "components/applications/ApplicationBoard.tsx"
    );
    const actions = readProjectFile("app/(app)/applications/actions.ts");

    expect(dashboard).toContain("ApplicationBoard");
    expect(dashboard).toContain("updatedAt.toISOString()");
    expect(board).toContain("DndContext");
    expect(board).toContain("useDraggable");
    expect(board).toContain("useDroppable");
    expect(board).toContain("moveApplicationStageAction");
    expect(board).toContain("Updated {formatRelativeDate");
    expect(board).toContain("application.location");
    expect(board).toContain("GripVertical");
    expect(board).toContain("APPLICATION_STAGE_ORDER.map");
    expect(board).not.toContain("ApplicationStageSelect");
    expect(board).not.toContain("border-t border-border/70 pt-3");
    expect(actions).toContain("export async function moveApplicationStageAction");
    expect(actions).toContain("updateApplicationStageSchema.safeParse(input)");
  });

  it("uses shared stage badge styling on the applications list", () => {
    const applicationsPage = readProjectFile("app/(app)/applications/page.tsx");
    const badge = readProjectFile(
      "components/applications/ApplicationStageBadge.tsx"
    );
    const board = readProjectFile(
      "components/applications/ApplicationBoard.tsx"
    );
    const stageMetadata = readProjectFile(
      "src/lib/applications/stage-metadata.ts"
    );

    expect(applicationsPage).toContain("ApplicationStageBadge");
    expect(applicationsPage).toContain("stage={application.stage}");
    expect(applicationsPage).not.toContain("function stageLabel");
    expect(applicationsPage).not.toContain("stageLabel(application.stage)");
    expect(badge).toContain("APPLICATION_STAGE_LABELS");
    expect(badge).toContain("APPLICATION_STAGE_THEME");
    expect(badge).toContain("rounded-full");
    expect(badge).toContain("theme.dot");
    expect(board).toContain("APPLICATION_STAGE_THEME");
    expect(board).not.toContain("const STAGE_THEME");
    expect(stageMetadata).toContain("export const APPLICATION_STAGE_THEME");
  });
});
