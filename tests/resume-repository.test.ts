import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  completePdfResumeUploadForUser,
  createPendingPdfResume,
  createPastedTextResume,
  deleteResumeForUser,
  getResumeByIdForUser,
  getResumeDetailByIdForUser,
  listResumesByUser,
  markResumeFailedForUser,
  markResumeParsingForUser,
  resumeDetailSelect,
  renameResumeForUser,
  replaceResumeSourceForUser,
  resumeListItemSelect,
  saveParsedResumeForUser,
} from "../src/lib/db/resumes";

type ResumeDb = NonNullable<Parameters<typeof listResumesByUser>[1]>;
type ResumeParseDb = NonNullable<Parameters<typeof saveParsedResumeForUser>[1]>;
type ResumeSourceReplaceDb = NonNullable<
  Parameters<typeof replaceResumeSourceForUser>[1]
>;

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
  const resumeBulletDeleteMany = vi.fn().mockResolvedValue({ count: 2 });
  const resumeBulletCreateMany = vi.fn().mockResolvedValue({ count: 1 });
  const $transaction = vi.fn(async (callback) =>
    callback({
      resume: {
        findFirst,
        updateMany,
      },
      resumeBullet: {
        createMany: resumeBulletCreateMany,
        deleteMany: resumeBulletDeleteMany,
      },
    })
  );

  return {
    db: {
      $transaction,
      resume: {
        create,
        deleteMany,
        findFirst,
        findMany,
        updateMany,
      },
      resumeBullet: {
        createMany: resumeBulletCreateMany,
        deleteMany: resumeBulletDeleteMany,
      },
    } as unknown as ResumeDb,
    parseDb: {
      $transaction,
      resume: {
        findFirst,
        updateMany,
      },
      resumeBullet: {
        createMany: resumeBulletCreateMany,
        deleteMany: resumeBulletDeleteMany,
      },
    } as unknown as ResumeParseDb,
    sourceReplaceDb: {
      $transaction,
      resume: {
        findFirst,
        updateMany,
      },
      resumeBullet: {
        deleteMany: resumeBulletDeleteMany,
      },
    } as unknown as ResumeSourceReplaceDb,
    resume: {
      create,
      deleteMany,
      findFirst,
      findMany,
      updateMany,
    },
    resumeBullet: {
      createMany: resumeBulletCreateMany,
      deleteMany: resumeBulletDeleteMany,
    },
    transaction: $transaction,
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
    expect(resumeListItemSelect).toMatchObject({
      _count: {
        select: {
          bullets: true,
        },
      },
      parsedJson: true,
      filePath: true,
      fileUrl: true,
    });
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

  it("loads a resume detail with ordered bullets only by id and userId", async () => {
    const { db, resume } = createResumeDb();

    await getResumeDetailByIdForUser("user_1", "resume_1", db);

    expect(resume.findFirst).toHaveBeenCalledWith({
      select: resumeDetailSelect,
      where: {
        id: "resume_1",
        userId: "user_1",
      },
    });
    expect(resumeDetailSelect.bullets).toMatchObject({
      orderBy: {
        orderIndex: "asc",
      },
      select: {
        currentText: true,
        originalText: true,
        sectionTitle: true,
        sectionType: true,
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

  it("creates pending PDF resumes as uploading user-owned records", async () => {
    const { db, resume } = createResumeDb();

    await createPendingPdfResume(
      {
        title: "Frontend PDF",
        userId: "user_1",
      },
      db
    );

    expect(resume.create).toHaveBeenCalledWith({
      data: {
        status: "UPLOADING",
        title: "Frontend PDF",
        userId: "user_1",
      },
    });
  });

  it("completes PDF uploads only for uploading current-user resumes", async () => {
    const existingResume = { id: "resume_1", userId: "user_1" };
    const { db, resume } = createResumeDb({
      findFirstResult: existingResume,
      updateCount: 1,
    });

    await expect(
      completePdfResumeUploadForUser(
        {
          filePath: "resumes/hash/resume_1.pdf",
          fileUrl: "https://blob.example/resume_1.pdf",
          id: "resume_1",
          userId: "user_1",
        },
        db
      )
    ).resolves.toBe(existingResume);

    expect(resume.updateMany).toHaveBeenCalledWith({
      data: {
        filePath: "resumes/hash/resume_1.pdf",
        fileUrl: "https://blob.example/resume_1.pdf",
        status: "READY",
      },
      where: {
        id: "resume_1",
        status: "UPLOADING",
        userId: "user_1",
      },
    });
  });

  it("returns null when PDF upload completion is not user-owned", async () => {
    const { db } = createResumeDb({
      updateCount: 0,
    });

    await expect(
      completePdfResumeUploadForUser(
        {
          filePath: "resumes/hash/resume_2.pdf",
          fileUrl: "https://blob.example/resume_2.pdf",
          id: "resume_2",
          userId: "user_1",
        },
        db
      )
    ).resolves.toBeNull();
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

  it("marks resumes as parsing only by id and userId", async () => {
    const { db, resume } = createResumeDb();

    await markResumeParsingForUser(
      {
        id: "resume_1",
        userId: "user_1",
      },
      db
    );

    expect(resume.updateMany).toHaveBeenCalledWith({
      data: {
        status: "PARSING",
      },
      where: {
        id: "resume_1",
        status: {
          not: "PARSING",
        },
        userId: "user_1",
      },
    });
  });

  it("marks resumes as failed only by id and userId", async () => {
    const { db, resume } = createResumeDb();

    await markResumeFailedForUser(
      {
        id: "resume_1",
        userId: "user_1",
      },
      db
    );

    expect(resume.updateMany).toHaveBeenCalledWith({
      data: {
        status: "FAILED",
      },
      where: {
        id: "resume_1",
        userId: "user_1",
      },
    });
  });

  it("saves parsed resumes and regenerates bullets in one transaction", async () => {
    const { parseDb, resume, resumeBullet, transaction } = createResumeDb();
    const bullet = {
      currentText: "Built React onboarding workflows.",
      orderIndex: 0,
      originalText: "Built React onboarding workflows.",
      resumeId: "resume_1",
      sectionTitle: "Frontend Engineer at Northstar Labs",
      sectionType: "experience",
      userId: "user_1",
    };

    await expect(
      saveParsedResumeForUser(
        {
          bullets: [bullet],
          id: "resume_1",
          parsedJson: {
            basics: {
              links: [],
            },
          },
          userId: "user_1",
        },
        parseDb
      )
    ).resolves.toEqual({
      bulletCount: 1,
      resumeUpdated: true,
    });

    expect(transaction).toHaveBeenCalled();
    expect(resume.updateMany).toHaveBeenCalledWith({
      data: {
        parsedJson: {
          basics: {
            links: [],
          },
        },
        status: "READY",
      },
      where: {
        id: "resume_1",
        userId: "user_1",
      },
    });
    expect(resumeBullet.deleteMany).toHaveBeenCalledWith({
      where: {
        resumeId: "resume_1",
        userId: "user_1",
      },
    });
    expect(resumeBullet.createMany).toHaveBeenCalledWith({
      data: [bullet],
    });
  });

  it("does not create bullets if the parsed resume update is not user-owned", async () => {
    const { parseDb, resumeBullet } = createResumeDb({
      updateCount: 0,
    });

    await expect(
      saveParsedResumeForUser(
        {
          bullets: [
            {
              currentText: "Built React onboarding workflows.",
              orderIndex: 0,
              originalText: "Built React onboarding workflows.",
              resumeId: "resume_2",
              sectionType: "experience",
              userId: "user_1",
            },
          ],
          id: "resume_2",
          parsedJson: {},
          userId: "user_1",
        },
        parseDb
      )
    ).resolves.toEqual({
      bulletCount: 0,
      resumeUpdated: false,
    });

    expect(resumeBullet.deleteMany).not.toHaveBeenCalled();
    expect(resumeBullet.createMany).not.toHaveBeenCalled();
  });

  it("replaces a resume source and clears parsed data and bullets in one transaction", async () => {
    const { resume, resumeBullet, sourceReplaceDb, transaction } =
      createResumeDb({
        findFirstResult: {
          filePath: "resumes/user_hash/old.pdf",
        },
      });

    await expect(
      replaceResumeSourceForUser(
        {
          id: "resume_1",
          sourceText: "Replacement resume text with enough detail.",
          userId: "user_1",
        },
        sourceReplaceDb
      )
    ).resolves.toEqual({
      oldFilePath: "resumes/user_hash/old.pdf",
      resumeUpdated: true,
    });

    expect(transaction).toHaveBeenCalled();
    expect(resume.findFirst).toHaveBeenCalledWith({
      select: {
        filePath: true,
      },
      where: {
        id: "resume_1",
        userId: "user_1",
      },
    });
    expect(resume.updateMany).toHaveBeenCalledWith({
      data: {
        filePath: null,
        fileUrl: null,
        parsedJson: Prisma.JsonNull,
        sourceText: "Replacement resume text with enough detail.",
        status: "READY",
      },
      where: {
        id: "resume_1",
        userId: "user_1",
      },
    });
    expect(resumeBullet.deleteMany).toHaveBeenCalledWith({
      where: {
        resumeId: "resume_1",
        userId: "user_1",
      },
    });
  });

  it("does not replace source or delete bullets when the resume is not user-owned", async () => {
    const { resume, resumeBullet, sourceReplaceDb } = createResumeDb();

    await expect(
      replaceResumeSourceForUser(
        {
          filePath: "resumes/user_hash/new.pdf",
          fileUrl: "https://blob.example/new.pdf",
          id: "resume_2",
          userId: "user_1",
        },
        sourceReplaceDb
      )
    ).resolves.toEqual({
      oldFilePath: null,
      resumeUpdated: false,
    });

    expect(resume.updateMany).not.toHaveBeenCalled();
    expect(resumeBullet.deleteMany).not.toHaveBeenCalled();
  });
});
