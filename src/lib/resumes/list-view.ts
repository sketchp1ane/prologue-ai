import type { ResumeStatus } from "@prisma/client";

export type ResumeListParseState = "failed" | "not_parsed" | "parsing" | "ready";

type ResumeListParseStateInput = {
  parsedJson: unknown;
  status: ResumeStatus;
};

export function hasResumeParsedJson(value: unknown) {
  return value !== null && value !== undefined;
}

export function getResumeListParseState({
  parsedJson,
  status,
}: ResumeListParseStateInput): ResumeListParseState {
  if (status === "FAILED") {
    return "failed";
  }

  if (status === "PARSING") {
    return "parsing";
  }

  if (hasResumeParsedJson(parsedJson)) {
    return "ready";
  }

  return "not_parsed";
}
