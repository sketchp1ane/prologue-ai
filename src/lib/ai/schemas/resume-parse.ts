import { z } from "zod";

const resumeBasicsSchema = z
  .object({
    name: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    links: z.array(z.string()),
  })
  .strict();

const resumeExperienceSchema = z
  .object({
    company: z.string().nullable(),
    title: z.string().nullable(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    location: z.string().nullable(),
    bullets: z.array(z.string()),
  })
  .strict();

const resumeEducationSchema = z
  .object({
    school: z.string().nullable(),
    degree: z.string().nullable(),
    major: z.string().nullable(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
  })
  .strict();

const resumeProjectSchema = z
  .object({
    name: z.string().nullable(),
    description: z.string().nullable(),
    technologies: z.array(z.string()),
    bullets: z.array(z.string()),
  })
  .strict();

export const resumeParseSchema = z
  .object({
    basics: resumeBasicsSchema,
    summary: z.string().nullable(),
    skills: z.array(z.string()),
    experience: z.array(resumeExperienceSchema),
    education: z.array(resumeEducationSchema),
    projects: z.array(resumeProjectSchema),
    certifications: z.array(z.string()),
    languages: z.array(z.string()),
    warnings: z.array(z.string()),
  })
  .strict();

export type ResumeParse = z.infer<typeof resumeParseSchema>;
