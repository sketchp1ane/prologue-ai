import { z } from "zod";

export const jdExtractSchema = z.object({
  companyName: z.string().nullable(),
  roleTitle: z.string().nullable(),
  location: z.string().nullable(),
  seniority: z.string().nullable(),
  employmentType: z.string().nullable(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  keywords: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string()),
});

export type JdExtract = z.infer<typeof jdExtractSchema>;
