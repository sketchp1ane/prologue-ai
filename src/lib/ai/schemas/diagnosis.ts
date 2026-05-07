import { z } from "zod";

const scoreSchema = z.number().min(0).max(100);

const radarScoresSchema = z
  .object({
    skills: scoreSchema,
    experience: scoreSchema,
    projects: scoreSchema,
    keywords: scoreSchema,
    seniority: scoreSchema,
  })
  .strict();

const diagnosisGapSchema = z
  .object({
    label: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    evidence: z.string(),
    recommendation: z.string(),
  })
  .strict();

const diagnosisRewriteTargetSchema = z
  .object({
    resumeBulletId: z.string(),
    originalText: z.string(),
    reason: z.string(),
    priority: z.enum(["low", "medium", "high"]),
  })
  .strict();

const legacyBulletSuggestionSchema = z
  .object({
    original: z.string(),
    suggestion: z.string(),
    reason: z.string(),
  })
  .strict();

export const diagnosisSchema = z
  .object({
    overallScore: scoreSchema,
    hrThreeSecondVerdict: z.enum([
      "strong_match",
      "possible_match",
      "weak_match",
    ]),
    verdictLevel: z.enum(["green", "yellow", "red"]),
    summary: z.string(),
    radarScores: radarScoresSchema,
    strengths: z.array(z.string()),
    gaps: z.array(diagnosisGapSchema),
    recommendedActions: z.array(z.string()),
    rewriteTargets: z.array(diagnosisRewriteTargetSchema),
    warnings: z.array(z.string()),
    bulletSuggestions: z.array(legacyBulletSuggestionSchema).default([]),
  })
  .strict();

export type Diagnosis = z.infer<typeof diagnosisSchema>;
