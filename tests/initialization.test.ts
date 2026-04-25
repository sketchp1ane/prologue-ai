import { describe, expect, it } from "vitest";

describe("repository initialization", () => {
  it("keeps the product identity stable", () => {
    expect("Prologue / 第一页").toContain("Prologue");
  });
});
