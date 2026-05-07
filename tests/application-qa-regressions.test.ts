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

    expect(form).toContain("copy.extractEmpty");
    expect(form).toContain("disabled={isExtracting}");
    expect(form).toContain("copy.extractConnectionFailed");
    expect(form).not.toContain("disabled={isExtracting || jdText.trim().length === 0}");
  });

  it("shows save and route-level async states for applications", () => {
    const form = readProjectFile(
      "app/(app)/applications/new/ApplicationCreateForm.tsx"
    );
    const loading = readProjectFile("app/(app)/applications/loading.tsx");
    const error = readProjectFile("app/(app)/applications/error.tsx");

    expect(form).toContain("useFormStatus");
    expect(form).toContain("dictionary.common.saving");
    expect(form).toContain("copy.noResumeAttached");
    expect(form).toContain('href="/resumes/new"');
    expect(loading).toContain("dictionary.workspace.applications.loadingDescription");
    expect(error).toContain("dictionary.workspace.applications.errorTitle");
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
    expect(detailPage).toContain("ApplicationDiagnosisPanel");
    expect(detailPage).toContain("resumeParseSchema.safeParse");
    expect(detailPage).toContain("resumePrerequisite={resumePrerequisite}");
    expect(detailPage).toContain('status: "resume_missing"');
    expect(detailPage).toContain('status: "resume_unparsed"');
    expect(detailPage).toContain('href="/applications"');
    expect(detailPage).toContain('href="/dashboard"');
    expect(detailPage).toContain('href={`/resumes/${application.resume.id}`}');
    expect(detailPage).toContain("copy.attachedResume");
    expect(detailPage).toContain("copy.noResumeAttached");
    expect(detailPage).toContain("label={copy.company}");
    expect(detailPage).toContain("label={copy.role}");
    expect(detailPage).toContain("label={copy.location}");
    expect(detailPage).toContain("label={copy.stage}");
    expect(detailPage).toContain("label={dictionary.common.created}");
    expect(detailPage).toContain("label={dictionary.common.updated}");
    expect(detailPage).toContain("copy.originalJd");
    expect(detailPage).toContain("copy.seniority");
    expect(detailPage).toContain("copy.employmentType");
    expect(detailPage).toContain("copy.requiredSkills");
    expect(detailPage).toContain("copy.preferredSkills");
    expect(detailPage).toContain("copy.responsibilities");
    expect(detailPage).toContain("copy.keywords");
    expect(detailPage).toContain("copy.warnings");
    expect(detailPage).toContain("copy.invalidExtract");
    expect(detailPage).toContain("key={`${item}-${index}`}");
    expect(detailPage).not.toContain("key={item}");
    expect(detailPage).toContain("parseDiagnosis");
    expect(detailPage).not.toContain("Bullet Rewrite");
    expect(notFound).toContain("dictionary.workspace.applications.notFoundDescription");
    expect(notFound).toContain('href="/applications"');
    expect(notFound).toContain('href="/dashboard"');
    expect(stageSelect).toContain("updateApplicationStageAction");
    expect(resumeSelect).toContain("updateApplicationResumeAction");
    expect(resumeSelect).toContain("dictionary.workspace.applicationControls.noResumeAttached");
    expect(actions).toContain("updateUserApplicationStage");
    expect(actions).toContain("updateUserApplicationResume");
    expect(actions).toContain(
      "revalidatePath(`/applications/${parsed.data.applicationId}`)"
    );
  });

  it("renders diagnosis report data without adding future AI scope", () => {
    const diagnosisPanel = readProjectFile(
      "components/applications/ApplicationDiagnosisPanel.tsx"
    );
    const dictionaries = readProjectFile("src/lib/i18n/dictionaries.ts");

    expect(diagnosisPanel).toContain("resumePrerequisite");
    expect(diagnosisPanel).toContain("canGenerate");
    expect(diagnosisPanel).toContain("disabled={isPending || !canGenerate}");
    expect(diagnosisPanel).toContain("copy.attachResumeFirstTitle");
    expect(diagnosisPanel).toContain("copy.parseResumeFirstTitle");
    expect(diagnosisPanel).toContain("diagnosis.radarScores");
    expect(diagnosisPanel).toContain("diagnosis.rewriteTargets");
    expect(diagnosisPanel).toContain("diagnosis.warnings");
    expect(diagnosisPanel).toContain("copy.verdictLevelLabels");
    expect(diagnosisPanel).toContain("gap.recommendation");
    expect(diagnosisPanel).toContain("copy.displayOnly");
    expect(diagnosisPanel).toContain("key={`${item}-${index}`}");
    expect(diagnosisPanel).not.toContain("key={item}");
    expect(diagnosisPanel).toContain(
      "JSON.stringify({ force: hasDiagnosis })"
    );
    expect(diagnosisPanel).not.toContain("recharts");
    expect(diagnosisPanel).not.toContain("RadarChart");
    expect(diagnosisPanel).not.toContain("Streaming");
    expect(diagnosisPanel).not.toContain("Outreach");
    expect(diagnosisPanel).not.toContain("Bullet Rewrite");
    expect(dictionaries).toContain("radarScoreLabels");
    expect(dictionaries).toContain("rewriteTargets");
    expect(dictionaries).toContain("attachResumeFirstTitle");
    expect(dictionaries).toContain("parseResumeFirstTitle");
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
    expect(board).toContain("formatRelativeDate(application.updatedAt");
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
    expect(badge).toContain("label");
    expect(badge).toContain("APPLICATION_STAGE_THEME");
    expect(badge).toContain("rounded-full");
    expect(badge).toContain("theme.dot");
    expect(board).toContain("APPLICATION_STAGE_THEME");
    expect(board).not.toContain("const STAGE_THEME");
    expect(stageMetadata).toContain("export const APPLICATION_STAGE_THEME");
  });
});
