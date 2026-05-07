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
    const contextRail = readProjectFile(
      "components/applications/ApplicationContextRail.tsx"
    );
    const jdDrawers = readProjectFile(
      "components/applications/ApplicationJdDrawers.tsx"
    );
    const sheet = readProjectFile("components/ui/sheet.tsx");
    const globals = readProjectFile("app/globals.css");
    const resumeSelect = readProjectFile(
      "components/applications/ApplicationResumeSelect.tsx"
    );
    const actions = readProjectFile("app/(app)/applications/actions.ts");

    expect(detailPage).toContain("ApplicationContextRail");
    expect(detailPage).toContain("ApplicationDiagnosisPanel");
    expect(detailPage).toContain("resumeParseSchema.safeParse");
    expect(detailPage).toContain("resumePrerequisite={resumePrerequisite}");
    expect(detailPage).toContain('status: "resume_missing"');
    expect(detailPage).toContain('status: "resume_unparsed"');
    expect(detailPage).toContain('href="/applications"');
    expect(detailPage).toContain('href="/dashboard"');
    expect(detailPage).toContain("resumePreview={");
    expect(detailPage).toContain("stageOptions={stageOptions}");
    expect(detailPage).toContain("jdText={application.jdText}");
    expect(detailPage).not.toContain("<pre className=\"mt-6");
    expect(detailPage).toContain("parseDiagnosis");
    expect(detailPage).not.toContain("Bullet Rewrite");
    expect(notFound).toContain("dictionary.workspace.applications.notFoundDescription");
    expect(notFound).toContain('href="/applications"');
    expect(notFound).toContain('href="/dashboard"');
    expect(stageSelect).toContain("updateApplicationStageAction");
    expect(stageSelect).toContain("@radix-ui/react-select");
    expect(stageSelect).toContain("APPLICATION_STAGE_THEME");
    expect(stageSelect).toContain("Select.Item");
    expect(contextRail).toContain("useState(false)");
    expect(contextRail).toContain("ApplicationStageSelect");
    expect(contextRail).toContain("ApplicationJdDrawers");
    expect(contextRail).toContain("ApplicationResumeSelect");
    expect(contextRail).toContain("lg:transition-[grid-template-columns]");
    expect(contextRail).toContain("lg:grid-cols-[minmax(0,1fr)_4.5rem]");
    expect(contextRail).toContain("lg:grid-cols-[minmax(0,1fr)_22rem]");
    expect(contextRail).toContain("lg:top-24");
    expect(contextRail).toContain("railScrollRef");
    expect(contextRail).toContain("scrollTo");
    expect(contextRail).not.toContain("right-full");
    expect(contextRail).toContain("context-rail-shell");
    expect(contextRail).toContain("context-rail-collapsed");
    expect(contextRail).toContain("context-rail-expanded");
    expect(contextRail).toContain("flex flex-col items-center px-3 py-3");
    expect(contextRail).toContain("flex flex-col items-center gap-4");
    expect(contextRail).toContain('data-state={expanded ? "open" : "closed"}');
    expect(contextRail).toContain("w-[22rem]");
    expect(contextRail).toContain("w-[4.5rem]");
    expect(contextRail).toContain("max-h-[calc(100dvh-7rem)]");
    expect(globals).toContain(".context-rail-shell");
    expect(globals).toContain("width 320ms cubic-bezier(0.16, 1, 0.3, 1)");
    expect(globals).toContain(".context-rail-shell[data-state=\"open\"]");
    expect(globals).toContain("prefers-reduced-motion: reduce");
    expect(contextRail).toContain("copy.contextRailTitle");
    expect(contextRail).toContain("copy.expandContextRail");
    expect(contextRail).toContain("copy.collapseContextRail");
    expect(contextRail).not.toContain("scrollIntoView");
    expect(contextRail).toContain("sectionRefs");
    expect(contextRail).toContain("copy.currentStage");
    expect(contextRail).toContain("copy.jdMaterials");
    expect(contextRail).toContain("copy.attachedResume");
    expect(contextRail).toContain("copy.noResumeAttached");
    expect(contextRail).toContain("label={copy.company}");
    expect(contextRail).toContain("label={copy.role}");
    expect(contextRail).toContain("label={copy.location}");
    expect(contextRail).not.toContain("label={copy.stage}");
    expect(contextRail).toContain("label={dictionary.common.created}");
    expect(contextRail).toContain("label={dictionary.common.updated}");
    expect(contextRail).toContain('href={resumePreview.href}');
    expect(jdDrawers).toContain("@/components/ui/sheet");
    expect(jdDrawers).toContain("SheetTrigger");
    expect(jdDrawers).toContain("SheetContent");
    expect(jdDrawers).toContain("copy.originalJd");
    expect(jdDrawers).toContain("copy.extractedFields");
    expect(jdDrawers).toContain("copy.invalidExtract");
    expect(jdDrawers).toContain("copy.missingExtract");
    expect(jdDrawers).toContain("key={`${item}-${index}`}");
    expect(jdDrawers).not.toContain("key={item}");
    expect(sheet).toContain("@radix-ui/react-dialog");
    expect(sheet).toContain("sm:w-[66vw]");
    expect(sheet).toContain("sheet-content");
    expect(globals).toContain("sheet-slide-in-from-right");
    expect(globals).toContain("sheet-slide-out-to-right");
    expect(globals).toContain("360ms cubic-bezier(0.16, 1, 0.3, 1)");
    expect(globals).toContain("240ms cubic-bezier(0.7, 0, 0.84, 0)");
    expect(globals).toContain(".sheet-content[data-side=\"right\"][data-state=\"open\"]");
    expect(globals).toContain("@media (prefers-reduced-motion: reduce)");
    expect(resumeSelect).toContain("updateApplicationResumeAction");
    expect(resumeSelect).toContain("@radix-ui/react-dialog");
    expect(resumeSelect).toContain("Dialog.Trigger");
    expect(resumeSelect).toContain("Dialog.Content");
    expect(resumeSelect).toContain('name="resumeId"');
    expect(resumeSelect).toContain("controlsCopy.configureAttachedResume");
    expect(resumeSelect).toContain("controlsCopy.noResumeAttached");
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
    const globals = readProjectFile("app/globals.css");

    expect(diagnosisPanel).toContain("resumePrerequisite");
    expect(diagnosisPanel).toContain("canGenerate");
    expect(diagnosisPanel).toContain("disabled={isPending || !canGenerate}");
    expect(diagnosisPanel).toContain("copy.attachResumeFirstTitle");
    expect(diagnosisPanel).toContain("copy.parseResumeFirstTitle");
    expect(diagnosisPanel).toContain("diagnosis.radarScores");
    expect(diagnosisPanel).toContain("diagnosis.rewriteTargets");
    expect(diagnosisPanel).toContain("diagnosis.warnings");
    expect(diagnosisPanel).toContain("ScoreRing");
    expect(diagnosisPanel).toContain("AnimatedScoreBar");
    expect(diagnosisPanel).toContain("useAnimatedNumber");
    expect(diagnosisPanel).toContain("useAnimatedProgress");
    expect(diagnosisPanel).toContain("useInViewOnce");
    expect(diagnosisPanel).toContain("IntersectionObserver");
    expect(diagnosisPanel).toContain("threshold: 0.01");
    expect(diagnosisPanel).toContain("DIAGNOSIS_NAV_SECTIONS");
    expect(diagnosisPanel).toContain("DiagnosisSectionNav");
    expect(diagnosisPanel).toContain("useActiveDiagnosisSection");
    expect(diagnosisPanel).toContain("data-diagnosis-section");
    expect(diagnosisPanel).toContain("diagnosis-section-summary");
    expect(diagnosisPanel).toContain("diagnosis-section-${id}");
    expect(diagnosisPanel).toContain('id: "scores"');
    expect(diagnosisPanel).toContain('id: "strengths"');
    expect(diagnosisPanel).toContain('id: "gaps"');
    expect(diagnosisPanel).toContain('id: "actions"');
    expect(diagnosisPanel).toContain('id: "rewriteTargets"');
    expect(diagnosisPanel).toContain('id: "warnings"');
    expect(diagnosisPanel).toContain("copy.sectionNavigation");
    expect(diagnosisPanel).toContain("copy[section.labelKey]");
    expect(diagnosisPanel).toContain("scroll-mt-28");
    expect(diagnosisPanel).toContain("w-max min-w-full justify-center");
    expect(diagnosisPanel).toContain("hasSummaryEnteredView");
    expect(diagnosisPanel).toContain("hasScoresEnteredView");
    expect(diagnosisPanel).toContain("RevealSection");
    expect(diagnosisPanel).toContain("RevealCard");
    expect(diagnosisPanel).toContain("diagnosis-card-reveal");
    expect(diagnosisPanel).toContain("data-visible={visible}");
    expect(diagnosisPanel).toContain("--reveal-delay");
    expect(diagnosisPanel).toContain("index * 70");
    expect(diagnosisPanel).toContain("requestAnimationFrame(() => {");
    expect(diagnosisPanel).toContain("setProgress(0)");
    expect(diagnosisPanel).toContain("setProgress(target)");
    expect(diagnosisPanel).toContain("const rowDelay = index * 80");
    expect(diagnosisPanel).toContain("delay={rowDelay}");
    expect(diagnosisPanel).toContain("duration={650}");
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
    expect(diagnosisPanel).not.toContain("framer-motion");
    expect(diagnosisPanel).not.toContain("motion/react");
    expect(diagnosisPanel).not.toContain("Streaming");
    expect(diagnosisPanel).not.toContain("Outreach");
    expect(diagnosisPanel).not.toContain("Bullet Rewrite");
    expect(globals).toContain("diagnosis-ring-draw");
    expect(globals).toContain("diagnosis-score-bar-fill");
    expect(globals).toContain("diagnosis-fade-up");
    expect(globals).toContain(".diagnosis-card-reveal");
    expect(globals).toContain('.diagnosis-card-reveal[data-visible="true"]');
    expect(globals).toContain(
      "translate3d(1.75rem, 1.25rem, 0) scale(0.985)"
    );
    expect(globals).toContain("translate3d(0, 0, 0) scale(1)");
    expect(globals).toContain("opacity 460ms cubic-bezier(0.16, 1, 0.3, 1)");
    expect(globals).toContain("transform 460ms cubic-bezier(0.16, 1, 0.3, 1)");
    expect(globals).toContain("transition-delay: var(--reveal-delay, 0ms)");
    expect(globals).toContain("var(--score-duration, 650ms)");
    expect(globals).toContain("@media (prefers-reduced-motion: reduce)");
    expect(dictionaries).toContain("radarScoreLabels");
    expect(dictionaries).toContain("sectionNavigation");
    expect(dictionaries).toContain("summarySection");
    expect(dictionaries).toContain("rewriteTargets");
    expect(dictionaries).toContain("attachResumeFirstTitle");
    expect(dictionaries).toContain("parseResumeFirstTitle");
    expect(dictionaries).toContain("contextRailTitle");
    expect(dictionaries).toContain("expandContextRail");
    expect(dictionaries).toContain("collapseContextRail");
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
