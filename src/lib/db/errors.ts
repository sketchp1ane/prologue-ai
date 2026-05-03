import "server-only";

import { Prisma } from "@prisma/client";

export function isPrismaClientInitializationError(
  error: unknown
): error is Prisma.PrismaClientInitializationError {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Error && error.name === "PrismaClientInitializationError")
  );
}
