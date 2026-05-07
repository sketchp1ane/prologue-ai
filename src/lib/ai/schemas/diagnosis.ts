import { z } from "zod";

const diagnosisGapSchema = z
  .object({
    label: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    evidence: z.string(),
  })
  .strict();

const diagnosisBulletSuggestionSchema = z
  .object({
    original: z.string(),
    suggestion: z.string(),
    reason: z.string(),
  })
  .strict();

export const diagnosisSchema = z
  .object({
    overallScore: z.number().min(0).max(100),
    hrThreeSecondVerdict: z.enum([
      "strong_match",
      "possible_match",
      "weak_match",
    ]),
    summary: z.string(),
    strengths: z.array(z.string()),
    gaps: z.array(diagnosisGapSchema),
    recommendedActions: z.array(z.string()),
    bulletSuggestions: z.array(diagnosisBulletSuggestionSchema),
  })
  .strict();

export type Diagnosis = z.infer<typeof diagnosisSchema>;
