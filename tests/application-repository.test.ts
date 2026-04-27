import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  applicationListItemSelect,
  createApplicationForUser,
  getApplicationByIdForUser,
  listApplicationsByUser,
} from "../src/lib/db/applications";

type ApplicationDb = NonNullable<Parameters<typeof listApplicationsByUser>[1]>;

function createApplicationDb(params?: { findFirstResult?: unknown }) {
  const findMany = vi.fn().mockResolvedValue([]);
  const findFirst = vi.fn().mockResolvedValue(params?.findFirstResult ?? null);
  const create = vi.fn().mockResolvedValue({ id: "application_1" });

  return {
    application: {
      create,
      findFirst,
      findMany,
    },
    db: {
      application: {
        create,
        findFirst,
        findMany,
      },
    } as unknown as ApplicationDb,
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
        roleTitle: "Frontend Engineer",
        stage: "PREPARING",
        userId: "user_1",
      },
    });
  });
});
