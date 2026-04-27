import { describe, expect, it, vi } from "vitest";

import {
  assertApplicationOwner,
  assertResumeOwner,
  OwnershipError,
} from "../src/lib/db/ownership";

type ResumeOwnershipDb = NonNullable<Parameters<typeof assertResumeOwner>[2]>;
type ApplicationOwnershipDb = NonNullable<
  Parameters<typeof assertApplicationOwner>[2]
>;

function createOwnershipDb(params: {
  resumeResult?: Awaited<ReturnType<typeof assertResumeOwner>> | null;
  applicationResult?: Awaited<ReturnType<typeof assertApplicationOwner>> | null;
}) {
  const resumeFindFirst = vi.fn().mockResolvedValue(params.resumeResult ?? null);
  const applicationFindFirst = vi
    .fn()
    .mockResolvedValue(params.applicationResult ?? null);

  return {
    applicationFindFirst,
    db: {
      application: {
        findFirst: applicationFindFirst,
      },
      resume: {
        findFirst: resumeFindFirst,
      },
    } as unknown as ResumeOwnershipDb & ApplicationOwnershipDb,
    resumeFindFirst,
  };
}

describe("database ownership helpers", () => {
  it("returns a resume only when id and userId both match", async () => {
    const resume = {
      id: "resume_1",
      userId: "user_1",
    } as Awaited<ReturnType<typeof assertResumeOwner>>;
    const { db, resumeFindFirst } = createOwnershipDb({ resumeResult: resume });

    await expect(assertResumeOwner("user_1", "resume_1", db)).resolves.toBe(
      resume
    );

    expect(resumeFindFirst).toHaveBeenCalledWith({
      where: {
        id: "resume_1",
        userId: "user_1",
      },
    });
  });

  it("throws when a resume is missing or owned by another user", async () => {
    const { db } = createOwnershipDb({ resumeResult: null });

    await expect(assertResumeOwner("user_1", "resume_2", db)).rejects.toThrow(
      OwnershipError
    );
  });

  it("returns an application only when id and userId both match", async () => {
    const application = {
      id: "application_1",
      userId: "user_1",
    } as Awaited<ReturnType<typeof assertApplicationOwner>>;
    const { applicationFindFirst, db } = createOwnershipDb({
      applicationResult: application,
    });

    await expect(
      assertApplicationOwner("user_1", "application_1", db)
    ).resolves.toBe(application);

    expect(applicationFindFirst).toHaveBeenCalledWith({
      where: {
        id: "application_1",
        userId: "user_1",
      },
    });
  });

  it("throws when an application is missing or owned by another user", async () => {
    const { db } = createOwnershipDb({ applicationResult: null });

    await expect(
      assertApplicationOwner("user_1", "application_2", db)
    ).rejects.toThrow(OwnershipError);
  });
});
