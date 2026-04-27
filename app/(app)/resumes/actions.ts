"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import {
  createUserPastedResume,
  deleteUserResume,
  renameUserResume,
  ResumeServiceError,
} from "@/src/lib/resumes/service";
import {
  createPastedResumeSchema,
  deleteResumeSchema,
  renameResumeSchema,
} from "@/src/lib/validations/resume";

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function firstError(error: ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

function withMessage(path: string, key: "error" | "success", message: string) {
  const params = new URLSearchParams({ [key]: message });

  return `${path}?${params.toString()}`;
}

export async function createResumeAction(formData: FormData) {
  const userId = await requireCurrentUserId();
  const parsed = createPastedResumeSchema.safeParse({
    sourceText: readFormString(formData, "sourceText"),
    title: readFormString(formData, "title"),
  });

  if (!parsed.success) {
    redirect(withMessage("/resumes/new", "error", firstError(parsed.error)));
  }

  const resume = await createUserPastedResume(userId, parsed.data);

  revalidatePath("/resumes");
  redirect(`/resumes/${resume.id}`);
}

export async function renameResumeAction(formData: FormData) {
  const userId = await requireCurrentUserId();
  const parsed = renameResumeSchema.safeParse({
    id: readFormString(formData, "id"),
    title: readFormString(formData, "title"),
  });
  const resumePath = parsed.success ? `/resumes/${parsed.data.id}` : "/resumes";

  if (!parsed.success) {
    redirect(withMessage(resumePath, "error", firstError(parsed.error)));
  }

  try {
    await renameUserResume(userId, parsed.data);
  } catch (error) {
    if (error instanceof ResumeServiceError) {
      redirect(withMessage("/resumes", "error", "Resume not found."));
    }

    throw error;
  }

  revalidatePath("/resumes");
  revalidatePath(resumePath);
  redirect(withMessage(resumePath, "success", "Resume renamed."));
}

export async function deleteResumeAction(formData: FormData) {
  const userId = await requireCurrentUserId();
  const parsed = deleteResumeSchema.safeParse({
    id: readFormString(formData, "id"),
  });
  const resumePath = parsed.success ? `/resumes/${parsed.data.id}` : "/resumes";

  if (!parsed.success) {
    redirect(withMessage(resumePath, "error", firstError(parsed.error)));
  }

  try {
    await deleteUserResume(userId, parsed.data);
  } catch (error) {
    if (error instanceof ResumeServiceError) {
      redirect(withMessage("/resumes", "error", "Resume not found."));
    }

    redirect(
      withMessage(
        resumePath,
        "error",
        "Resume could not be deleted. Remove linked records first."
      )
    );
  }

  revalidatePath("/resumes");
  redirect(withMessage("/resumes", "success", "Resume deleted."));
}
