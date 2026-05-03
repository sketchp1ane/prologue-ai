import { describe, expect, it } from "vitest";

import validResumeParseFixture from "./fixtures/resume-parse.valid.json";
import {
  getParsedResumeDisplay,
  groupResumeBullets,
} from "../src/lib/resumes/detail-view";

describe("resume detail view helpers", () => {
  it("classifies missing parsed JSON", () => {
    expect(getParsedResumeDisplay(null)).toEqual({
      data: null,
      status: "missing",
    });
  });

  it("classifies valid parsed JSON", () => {
    expect(getParsedResumeDisplay(validResumeParseFixture)).toEqual({
      data: validResumeParseFixture,
      status: "valid",
    });
  });

  it("classifies invalid parsed JSON", () => {
    expect(
      getParsedResumeDisplay({
        basics: {
          links: [],
        },
      })
    ).toEqual({
      data: null,
      status: "invalid",
    });
  });

  it("groups bullets by section type and title in orderIndex order", () => {
    expect(
      groupResumeBullets([
        {
          currentText: "Project bullet",
          id: "bullet_3",
          orderIndex: 3,
          originalText: "Project bullet",
          sectionTitle: "Interview Tracker",
          sectionType: "project",
        },
        {
          currentText: "Second experience bullet",
          id: "bullet_2",
          orderIndex: 2,
          originalText: "Second experience bullet",
          sectionTitle: "Frontend Engineer at Northstar Labs",
          sectionType: "experience",
        },
        {
          currentText: "First experience bullet",
          id: "bullet_1",
          orderIndex: 1,
          originalText: "Original first experience bullet",
          sectionTitle: "Frontend Engineer at Northstar Labs",
          sectionType: "experience",
        },
      ])
    ).toEqual([
      {
        bullets: [
          expect.objectContaining({
            currentText: "First experience bullet",
            id: "bullet_1",
          }),
          expect.objectContaining({
            currentText: "Second experience bullet",
            id: "bullet_2",
          }),
        ],
        sectionTitle: "Frontend Engineer at Northstar Labs",
        sectionType: "experience",
      },
      {
        bullets: [
          expect.objectContaining({
            currentText: "Project bullet",
            id: "bullet_3",
          }),
        ],
        sectionTitle: "Interview Tracker",
        sectionType: "project",
      },
    ]);
  });
});
