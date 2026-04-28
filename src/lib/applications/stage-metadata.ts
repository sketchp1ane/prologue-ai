import type { ApplicationStage } from "@prisma/client";

export const APPLICATION_STAGE_ORDER = [
  "PREPARING",
  "APPLIED",
  "COMMUNICATING",
  "INTERVIEWING",
  "OFFER",
  "ARCHIVED",
] as const satisfies readonly ApplicationStage[];

export type ApplicationStageValue = (typeof APPLICATION_STAGE_ORDER)[number];

export type ApplicationStageTheme = {
  accent: string;
  countBg: string;
  dot: string;
};

export const APPLICATION_STAGE_LABELS = {
  PREPARING: "Preparing",
  APPLIED: "Applied",
  COMMUNICATING: "Communicating",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  ARCHIVED: "Archived",
} satisfies Record<ApplicationStage, string>;

export const APPLICATION_STAGE_THEME = {
  PREPARING: {
    accent: "bg-zinc-300",
    countBg: "bg-zinc-100 text-zinc-700",
    dot: "bg-zinc-400",
  },
  APPLIED: {
    accent: "bg-blue-400",
    countBg: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  COMMUNICATING: {
    accent: "bg-amber-400",
    countBg: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  INTERVIEWING: {
    accent: "bg-purple-400",
    countBg: "bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  OFFER: {
    accent: "bg-emerald-400",
    countBg: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  ARCHIVED: {
    accent: "bg-zinc-200",
    countBg: "bg-zinc-100 text-zinc-600",
    dot: "bg-zinc-300",
  },
} satisfies Record<ApplicationStage, ApplicationStageTheme>;

export function isApplicationStageValue(
  value: string
): value is ApplicationStageValue {
  return APPLICATION_STAGE_ORDER.includes(value as ApplicationStageValue);
}
