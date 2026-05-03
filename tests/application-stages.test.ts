import { ApplicationStage } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  APPLICATION_STAGE_ORDER,
  getApplicationStageLabel,
  getApplicationDashboardStats,
  getApplicationStageOptions,
  groupApplicationsByStage,
} from "../src/lib/applications/stages";
import type { ApplicationListItem } from "../src/lib/db/applications";
import { dictionaries } from "../src/lib/i18n/dictionaries";

const baseDate = new Date("2026-04-28T08:00:00.000Z");

function application(
  id: string,
  stage: ApplicationStage
): ApplicationListItem {
  return {
    companyName: `Company ${id}`,
    createdAt: baseDate,
    id,
    location: null,
    roleTitle: `Role ${id}`,
    stage,
    updatedAt: baseDate,
  };
}

describe("application stage helpers", () => {
  it("keeps stage columns and options in sync with the Prisma enum", () => {
    const enumValues = Object.values(ApplicationStage);

    expect(APPLICATION_STAGE_ORDER).toEqual(enumValues);
    expect(
      getApplicationStageOptions(dictionaries.en.applicationStages).map(
        (option) => option.value
      )
    ).toEqual(enumValues);
  });

  it("resolves stage labels for English and Chinese dictionaries", () => {
    expect(
      getApplicationStageLabel(
        ApplicationStage.PREPARING,
        dictionaries.en.applicationStages
      )
    ).toBe("Preparing");
    expect(
      getApplicationStageLabel(
        ApplicationStage.PREPARING,
        dictionaries["zh-CN"].applicationStages
      )
    ).toBe("准备投递");
  });

  it("groups applications into every enum-backed stage column", () => {
    const grouped = groupApplicationsByStage([
      application("application_1", ApplicationStage.PREPARING),
      application("application_2", ApplicationStage.APPLIED),
      application("application_3", ApplicationStage.APPLIED),
    ]);

    expect(Object.keys(grouped)).toEqual(Object.values(ApplicationStage));
    expect(grouped[ApplicationStage.PREPARING]).toHaveLength(1);
    expect(grouped[ApplicationStage.APPLIED]).toHaveLength(2);
    expect(grouped[ApplicationStage.ARCHIVED]).toHaveLength(0);
  });

  it("computes dashboard statistics from exact stages", () => {
    expect(
      getApplicationDashboardStats([
        application("application_1", ApplicationStage.PREPARING),
        application("application_2", ApplicationStage.APPLIED),
        application("application_3", ApplicationStage.COMMUNICATING),
        application("application_4", ApplicationStage.INTERVIEWING),
        application("application_5", ApplicationStage.OFFER),
        application("application_6", ApplicationStage.ARCHIVED),
      ])
    ).toEqual({
      applied: 1,
      communicating: 1,
      interviewing: 1,
      offer: 1,
      total: 6,
    });
  });
});
