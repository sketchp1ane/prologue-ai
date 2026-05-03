import "server-only";

import type { PrismaClient, UserLocale } from "@prisma/client";

import { prisma } from "@/src/lib/db/prisma";

type UserPreferenceDb = Pick<PrismaClient, "userPreference">;

export type UserPreferenceRecord = {
  locale: UserLocale;
  userId: string;
};

export async function findUserPreference(
  userId: string,
  db: UserPreferenceDb = prisma
): Promise<UserPreferenceRecord | null> {
  return db.userPreference.findUnique({
    select: {
      locale: true,
      userId: true,
    },
    where: {
      userId,
    },
  });
}

export async function upsertUserPreferenceLocale(
  userId: string,
  locale: UserLocale,
  db: UserPreferenceDb = prisma
): Promise<UserPreferenceRecord> {
  return db.userPreference.upsert({
    create: {
      locale,
      userId,
    },
    select: {
      locale: true,
      userId: true,
    },
    update: {
      locale,
    },
    where: {
      userId,
    },
  });
}
