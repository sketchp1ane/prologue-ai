import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { isPrismaClientInitializationError } from "../src/lib/db/errors";

describe("database error helpers", () => {
  it("detects Prisma client initialization errors", () => {
    const error = new Prisma.PrismaClientInitializationError(
      "Can't reach database server",
      "6.19.3"
    );

    expect(isPrismaClientInitializationError(error)).toBe(true);
  });

  it("detects serialized Prisma client initialization errors by name", () => {
    const error = new Error("Can't reach database server");
    error.name = "PrismaClientInitializationError";

    expect(isPrismaClientInitializationError(error)).toBe(true);
  });

  it("does not classify unrelated errors as database initialization failures", () => {
    expect(isPrismaClientInitializationError(new Error("Unexpected"))).toBe(
      false
    );
  });
});
