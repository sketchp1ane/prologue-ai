import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createPastedTextResume,
  deleteResumeForUser,
  getResumeByIdForUser,
  listResumesByUser,
  renameResumeForUser,
  resumeListItemSelect,
} from "../src/lib/db/resumes";

type ResumeDb = NonNullable<Parameters<typeof listResumesByUser>[1]>;

function createResumeDb(params?: {
  findFirstResult?: unknown;
  updateCount?: number;
}) {
  const findMany = vi.fn().mockResolvedValue([]);
  const findFirst = vi.fn().mockResolvedValue(params?.findFirstResult ?? null);
  const create = vi.fn().mockResolvedValue({ id: "resume_1" });
  const updateMany = vi.fn().mockResolvedValue({
    count: params?.updateCount ?? 1,
  });
  const deleteMany = vi.fn().mockResolvedValue({ count: 1 });

  return {
    db: {
      resume: {
        create,
        deleteMany,
        findFirst,
        findMany,
        updateMany,
      },
    } as unknown as ResumeDb,
    resume: {
      create,
      deleteMany,
      findFirst,
      findMany,
      updateMany,
    },
  };
}

describe("resume repository", () => {
  it("lists resumes by user without selecting full source text", async () => {
    const { db, resume } = createResumeDb();

    await listResumesByUser("user_1", db);

    expect(resume.findMany).toHaveBeenCalledWith({
      orderBy: {
        updatedAt: "desc",
      },
      select: resumeListItemSelect,
      where: {
        userId: "user_1",
      },
    });
    expect(resumeListItemSelect).not.toHaveProperty("sourceText");
  });

  it("loads a resume only by id and userId", async () => {
    const { db, resume } = createResumeDb();

    await getResumeByIdForUser("user_1", "resume_1", db);

    expect(resume.findFirst).toHaveBeenCalledWith({
      where: {
        id: "resume_1",
        userId: "user_1",
      },
    });
  });

  it("creates pasted-text resumes as ready user-owned records", async () => {
    const { db, resume } = createResumeDb();

    await createPastedTextResume(
      {
        sourceText: "Resume source text",
        title: "Frontend resume",
        userId: "user_1",
      },
      db
    );

    expect(resume.create).toHaveBeenCalledWith({
      data: {
        sourceText: "Resume source text",
        status: "READY",
        title: "Frontend resume",
        userId: "user_1",
      },
    });
  });

  it("renames resumes only when id and userId both match", async () => {
    const existingResume = { id: "resume_1", userId: "user_1" };
    const { db, resume } = createResumeDb({
      findFirstResult: existingResume,
      updateCount: 1,
    });

    await expect(
      renameResumeForUser(
        {
          id: "resume_1",
          title: "Product resume",
          userId: "user_1",
        },
        db
      )
    ).resolves.toBe(existingResume);

    expect(resume.updateMany).toHaveBeenCalledWith({
      data: {
        title: "Product resume",
      },
      where: {
        id: "resume_1",
        userId: "user_1",
      },
    });
  });

  it("returns null when a rename matches no user-owned resume", async () => {
    const { db } = createResumeDb({ updateCount: 0 });

    await expect(
      renameResumeForUser(
        {
          id: "resume_2",
          title: "Product resume",
          userId: "user_1",
        },
        db
      )
    ).resolves.toBeNull();
  });

  it("deletes resumes only by id and userId", async () => {
    const { db, resume } = createResumeDb();

    await deleteResumeForUser(
      {
        id: "resume_1",
        userId: "user_1",
      },
      db
    );

    expect(resume.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "resume_1",
        userId: "user_1",
      },
    });
  });
});
