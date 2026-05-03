"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";
import {
  createUserPdfResume,
  createUserPastedResume,
  deleteUserResume,
  renameUserResume,
  ResumeServiceError,
} from "@/src/lib/resumes/service";
import {
  createPastedResumeSchema,
  deleteResumeSchema,
  renameResumeSchema,
  validateResumePdfUpload,
} from "@/src/lib/validations/resume";

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function firstError(
  _error: ZodError,
  dictionary: Pick<AppDictionary, "errors">
) {
  return dictionary.errors.checkForm;
}

function withMessage(path: string, key: "error" | "success", message: string) {
  const params = new URLSearchParams({ [key]: message });

  return `${path}?${params.toString()}`;
}

export async function createResumeAction(formData: FormData) {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const parsed = createPastedResumeSchema.safeParse({
    sourceText: readFormString(formData, "sourceText"),
    title: readFormString(formData, "title"),
  });

  if (!parsed.success) {
    redirect(
      withMessage("/resumes/new", "error", firstError(parsed.error, dictionary))
    );
  }

  const resume = await createUserPastedResume(userId, parsed.data);

  revalidatePath("/resumes");
  redirect(`/resumes/${resume.id}`);
}

export async function createPdfResumeAction(formData: FormData) {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const parsed = (() => {
    try {
      return {
        data: validateResumePdfUpload({
          file: formData.get("pdfFile"),
          title: readFormString(formData, "title"),
        }),
        success: true as const,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          error,
          success: false as const,
        };
      }

      throw error;
    }
  })();

  if (!parsed.success) {
    redirect(
      withMessage("/resumes/new", "error", firstError(parsed.error, dictionary))
    );
  }

  try {
    const resume = await createUserPdfResume(userId, parsed.data);

    revalidatePath("/resumes");
    redirect(`/resumes/${resume.id}`);
  } catch (error) {
    if (error instanceof ResumeServiceError) {
      redirect(
        withMessage(
          "/resumes/new",
          "error",
          dictionary.workspace.resumeErrors.uploadFailed
        )
      );
    }

    throw error;
  }
}

export async function renameResumeAction(formData: FormData) {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const parsed = renameResumeSchema.safeParse({
    id: readFormString(formData, "id"),
    title: readFormString(formData, "title"),
  });
  const resumePath = parsed.success ? `/resumes/${parsed.data.id}` : "/resumes";

  if (!parsed.success) {
    redirect(withMessage(resumePath, "error", firstError(parsed.error, dictionary)));
  }

  try {
    await renameUserResume(userId, parsed.data);
  } catch (error) {
    if (error instanceof ResumeServiceError) {
      redirect(
        withMessage(
          "/resumes",
          "error",
          dictionary.workspace.resumeErrors.notFound
        )
      );
    }

    throw error;
  }

  revalidatePath("/resumes");
  revalidatePath(resumePath);
  redirect(
    withMessage(
      resumePath,
      "success",
      dictionary.workspace.resumeErrors.renamed
    )
  );
}

export async function deleteResumeAction(formData: FormData) {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const parsed = deleteResumeSchema.safeParse({
    id: readFormString(formData, "id"),
  });
  const resumePath = parsed.success ? `/resumes/${parsed.data.id}` : "/resumes";

  if (!parsed.success) {
    redirect(withMessage(resumePath, "error", firstError(parsed.error, dictionary)));
  }

  try {
    await deleteUserResume(userId, parsed.data);
  } catch (error) {
    if (error instanceof ResumeServiceError) {
      redirect(
        withMessage(
          "/resumes",
          "error",
          dictionary.workspace.resumeErrors.notFound
        )
      );
    }

    redirect(
      withMessage(
        resumePath,
        "error",
        dictionary.workspace.resumeErrors.couldNotDelete
      )
    );
  }

  revalidatePath("/resumes");
  redirect(
    withMessage(
      "/resumes",
      "success",
      dictionary.workspace.resumeErrors.deleted
    )
  );
}
