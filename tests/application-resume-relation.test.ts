import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("application resume relation", () => {
  it("keeps applications when an attached resume is deleted", () => {
    const schema = readProjectFile("prisma/schema.prisma");
    const migration = readProjectFile(
      "prisma/migrations/20260428112000_set_application_resume_delete_null/migration.sql"
    );

    expect(schema).toContain(
      "resume        Resume?           @relation(fields: [resumeId], references: [id], onDelete: SetNull)"
    );
    expect(migration).toContain('ON DELETE SET NULL ON UPDATE CASCADE');
  });
});
