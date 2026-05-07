import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  applicationListItemSelect,
  createApplicationForUser,
  getApplicationByIdForUser,
  getApplicationDiagnosisInputForUser,
  listApplicationsByUser,
  saveApplicationDiagnosisForUser,
  updateApplicationResumeForUser,
  updateApplicationStageForUser,
} from "../src/lib/db/applications";

type ApplicationDb = NonNullable<Parameters<typeof listApplicationsByUser>[1]>;

function createApplicationDb(params?: {
  findFirstResult?: unknown;
  resumeFindFirstResult?: unknown;
  updateCount?: number;
}) {
  const findMany = vi.fn().mockResolvedValue([]);
  const findFirst = vi.fn().mockResolvedValue(params?.findFirstResult ?? null);
  const create = vi.fn().mockResolvedValue({ id: "application_1" });
  const updateMany = vi.fn().mockResolvedValue({
    count: params?.updateCount ?? 1,
  });
  const resumeFindFirst = vi
    .fn()
    .mockResolvedValue(params?.resumeFindFirstResult ?? null);

  return {
    application: {
      create,
      findFirst,
      findMany,
      updateMany,
    },
    db: {
      application: {
        create,
        findFirst,
        findMany,
        updateMany,
      },
      resume: {
        findFirst: resumeFindFirst,
      },
    } as unknown as ApplicationDb,
    resume: {
      findFirst: resumeFindFirst,
    },
  };
}

describe("application repository", () => {
  it("lists applications by user without selecting full JD text", async () => {
    const { application, db } = createApplicationDb();

    await listApplicationsByUser("user_1", db);

    expect(application.findMany).toHaveBeenCalledWith({
      orderBy: {
        updatedAt: "desc",
      },
      select: applicationListItemSelect,
      where: {
        userId: "user_1",
      },
    });
    expect(applicationListItemSelect).not.toHaveProperty("jdText");
  });

  it("loads an application only by id and userId", async () => {
    const { application, db } = createApplicationDb();

    await getApplicationByIdForUser("user_1", "application_1", db);

    expect(application.findFirst).toHaveBeenCalledWith({
      include: {
        resume: {
          select: {
            id: true,
            parsedJson: true,
            status: true,
            title: true,
            updatedAt: true,
          },
        },
      },
      where: {
        id: "application_1",
        userId: "user_1",
      },
    });
  });

  it("loads diagnosis input only by id and userId", async () => {
    const { application, db } = createApplicationDb();

    await getApplicationDiagnosisInputForUser(
      "user_1",
      "application_1",
      db
    );

    expect(application.findFirst).toHaveBeenCalledWith({
      select: expect.objectContaining({
        diagnosisJson: true,
        jdExtractJson: true,
        jdText: true,
        resume: expect.objectContaining({
          select: expect.objectContaining({
            bullets: expect.objectContaining({
              where: {
                userId: "user_1",
              },
            }),
            parsedJson: true,
          }),
        }),
        resumeId: true,
      }),
      where: {
        id: "application_1",
        userId: "user_1",
      },
    });
  });

  it("creates applications as user-owned records with nullable resumeId", async () => {
    const { application, db } = createApplicationDb();
    const jdExtractJson = {
      companyName: "Acme",
      roleTitle: "Frontend Engineer",
      location: null,
      seniority: null,
      employmentType: null,
      requiredSkills: ["React"],
      preferredSkills: [],
      responsibilities: [],
      keywords: ["frontend"],
      confidence: 0.7,
      warnings: [],
    };

    await createApplicationForUser(
      {
        companyName: "Acme",
        jdExtractJson,
        jdText: "A long enough job description for a frontend role.",
        location: null,
        resumeId: null,
        roleTitle: "Frontend Engineer",
        userId: "user_1",
      },
      db
    );

    expect(application.create).toHaveBeenCalledWith({
      data: {
        companyName: "Acme",
        jdExtractJson,
        jdText: "A long enough job description for a frontend role.",
        location: null,
        resumeId: null,
        roleTitle: "Frontend Engineer",
        stage: "PREPARING",
        userId: "user_1",
      },
    });
  });

  it("creates applications with a resume only after checking resume ownership", async () => {
    const { application, db, resume } = createApplicationDb({
      resumeFindFirstResult: { id: "resume_1" },
    });

    await createApplicationForUser(
      {
        companyName: "Acme",
        jdText: "A long enough job description for a frontend role.",
        location: null,
        resumeId: "resume_1",
        roleTitle: "Frontend Engineer",
        userId: "user_1",
      },
      db
    );

    expect(resume.findFirst).toHaveBeenCalledWith({
      select: {
        id: true,
      },
      where: {
        id: "resume_1",
        userId: "user_1",
      },
    });
    expect(application.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        resumeId: "resume_1",
        userId: "user_1",
      }),
    });
  });

  it("does not create applications with another user's resume", async () => {
    const { application, db } = createApplicationDb({
      resumeFindFirstResult: null,
    });

    await expect(
      createApplicationForUser(
        {
          companyName: "Acme",
          jdText: "A long enough job description for a frontend role.",
          location: null,
          resumeId: "resume_2",
          roleTitle: "Frontend Engineer",
          userId: "user_1",
        },
        db
      )
    ).resolves.toBeNull();

    expect(application.create).not.toHaveBeenCalled();
  });

  it("updates application stage only when id and userId both match", async () => {
    const existingApplication = { id: "application_1", userId: "user_1" };
    const { application, db } = createApplicationDb({
      findFirstResult: existingApplication,
      updateCount: 1,
    });

    await expect(
      updateApplicationStageForUser(
        {
          id: "application_1",
          stage: "INTERVIEWING",
          userId: "user_1",
        },
        db
      )
    ).resolves.toBe(existingApplication);

    expect(application.updateMany).toHaveBeenCalledWith({
      data: {
        stage: "INTERVIEWING",
      },
      where: {
        id: "application_1",
        userId: "user_1",
      },
    });
  });

  it("returns null when a stage update matches no user-owned application", async () => {
    const { db } = createApplicationDb({ updateCount: 0 });

    await expect(
      updateApplicationStageForUser(
        {
          id: "application_2",
          stage: "OFFER",
          userId: "user_1",
        },
        db
      )
    ).resolves.toBeNull();
  });

  it("updates application resume only when application and resume are user-owned", async () => {
    const existingApplication = { id: "application_1", userId: "user_1" };
    const { application, db, resume } = createApplicationDb({
      findFirstResult: existingApplication,
      resumeFindFirstResult: { id: "resume_1" },
      updateCount: 1,
    });

    await expect(
      updateApplicationResumeForUser(
        {
          id: "application_1",
          resumeId: "resume_1",
          userId: "user_1",
        },
        db
      )
    ).resolves.toBe(existingApplication);

    expect(resume.findFirst).toHaveBeenCalledWith({
      select: {
        id: true,
      },
      where: {
        id: "resume_1",
        userId: "user_1",
      },
    });
    expect(application.updateMany).toHaveBeenCalledWith({
      data: {
        resumeId: "resume_1",
      },
      where: {
        id: "application_1",
        userId: "user_1",
      },
    });
  });

  it("saves diagnosis JSON only when id and userId both match", async () => {
    const { application, db } = createApplicationDb();
    const diagnosisJson = {
      overallScore: 80,
      summary: "Possible match.",
    };

    await saveApplicationDiagnosisForUser(
      {
        diagnosisJson,
        id: "application_1",
        userId: "user_1",
      },
      db
    );

    expect(application.updateMany).toHaveBeenCalledWith({
      data: {
        diagnosisJson,
      },
      where: {
        id: "application_1",
        userId: "user_1",
      },
    });
  });

  it("detaches application resumes by setting resumeId to null", async () => {
    const existingApplication = { id: "application_1", userId: "user_1" };
    const { application, db, resume } = createApplicationDb({
      findFirstResult: existingApplication,
      updateCount: 1,
    });

    await expect(
      updateApplicationResumeForUser(
        {
          id: "application_1",
          resumeId: null,
          userId: "user_1",
        },
        db
      )
    ).resolves.toBe(existingApplication);

    expect(resume.findFirst).not.toHaveBeenCalled();
    expect(application.updateMany).toHaveBeenCalledWith({
      data: {
        resumeId: null,
      },
      where: {
        id: "application_1",
        userId: "user_1",
      },
    });
  });

  it("returns null when attaching a resume that is not user-owned", async () => {
    const { application, db } = createApplicationDb({
      resumeFindFirstResult: null,
    });

    await expect(
      updateApplicationResumeForUser(
        {
          id: "application_1",
          resumeId: "resume_2",
          userId: "user_1",
        },
        db
      )
    ).resolves.toBeNull();

    expect(application.updateMany).not.toHaveBeenCalled();
  });
});
