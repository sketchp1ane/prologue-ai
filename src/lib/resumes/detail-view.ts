import {
  resumeParseSchema,
  type ResumeParse,
} from "@/src/lib/ai/schemas/resume-parse";

export type ParsedResumeDisplay =
  | {
      data: null;
      status: "missing";
    }
  | {
      data: null;
      status: "invalid";
    }
  | {
      data: ResumeParse;
      status: "valid";
    };

export type ResumeBulletDisplay = {
  currentText: string;
  id: string;
  orderIndex: number;
  originalText: string;
  sectionTitle: string | null;
  sectionType: string;
};

export type ResumeBulletGroup = {
  bullets: ResumeBulletDisplay[];
  sectionTitle: string | null;
  sectionType: string;
};

export function getParsedResumeDisplay(value: unknown): ParsedResumeDisplay {
  if (!value) {
    return {
      data: null,
      status: "missing",
    };
  }

  const parsed = resumeParseSchema.safeParse(value);

  if (!parsed.success) {
    return {
      data: null,
      status: "invalid",
    };
  }

  return {
    data: parsed.data,
    status: "valid",
  };
}

export function groupResumeBullets(
  bullets: ResumeBulletDisplay[]
): ResumeBulletGroup[] {
  const groups = new Map<string, ResumeBulletGroup>();

  for (const bullet of [...bullets].sort(
    (first, second) => first.orderIndex - second.orderIndex
  )) {
    const key = `${bullet.sectionType}:${bullet.sectionTitle ?? ""}`;
    const existing = groups.get(key);

    if (existing) {
      existing.bullets.push(bullet);
      continue;
    }

    groups.set(key, {
      bullets: [bullet],
      sectionTitle: bullet.sectionTitle,
      sectionType: bullet.sectionType,
    });
  }

  return [...groups.values()];
}
