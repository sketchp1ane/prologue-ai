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
  replaceUserResumePdfSource,
  replaceUserResumeTextSource,
  ResumeServiceError,
  updateUserParsedResume,
} from "@/src/lib/resumes/service";
import {
  createPastedResumeSchema,
  deleteResumeSchema,
  renameResumeSchema,
  updateParsedResumeSchema,
  validateReplaceResumeSource,
  validateSelectedResumeCreate,
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

export type UpdateParsedResumeActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

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

export async function createSelectedResumeAction(formData: FormData) {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const parsed = (() => {
    try {
      return {
        data: validateSelectedResumeCreate({
          file: formData.get("pdfFile"),
          sourceText: readFormString(formData, "sourceText"),
          sourceType: readFormString(formData, "sourceType"),
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
      withMessage(
        "/resumes/new",
        "error",
        dictionary.workspace.resumeCreate.validationError
      )
    );
  }

  try {
    const resume =
      parsed.data.sourceType === "pasted_text"
        ? await createUserPastedResume(userId, {
            sourceText: parsed.data.sourceText,
            title: parsed.data.title,
          })
        : await createUserPdfResume(userId, {
            file: parsed.data.file,
            title: parsed.data.title,
          });

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
  const returnTo = readFormString(formData, "returnTo");
  const parsed = deleteResumeSchema.safeParse({
    id: readFormString(formData, "id"),
  });
  const resumePath = parsed.success ? `/resumes/${parsed.data.id}` : "/resumes";
  const errorPath = returnTo === "/resumes" ? "/resumes" : resumePath;

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
          errorPath,
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

export async function replaceResumeSourceAction(formData: FormData) {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const id = readFormString(formData, "id");
  const resumePath = id ? `/resumes/${id}` : "/resumes";
  const parsed = (() => {
    try {
      return {
        data: validateReplaceResumeSource({
          file: formData.get("pdfFile"),
          id,
          sourceText: readFormString(formData, "sourceText"),
          sourceType: readFormString(formData, "sourceType"),
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
      withMessage(
        resumePath,
        "error",
        dictionary.workspace.resumeDetail.replaceSource.validationError
      )
    );
  }

  try {
    const result =
      parsed.data.sourceType === "pasted_text"
        ? await replaceUserResumeTextSource(userId, parsed.data)
        : await replaceUserResumePdfSource(userId, parsed.data);
    const resultPath = `/resumes/${result.resumeId}`;

    revalidatePath("/resumes");
    revalidatePath(resultPath);
    redirect(
      withMessage(
        resultPath,
        "success",
        dictionary.workspace.resumeDetail.replaceSource.success
      )
    );
  } catch (error) {
    if (error instanceof ResumeServiceError) {
      redirect(
        withMessage(
          resumePath,
          "error",
          error.code === "resume_not_found"
            ? dictionary.workspace.resumeErrors.notFound
            : error.code === "resume_upload_failed" ||
                error.code === "configuration"
              ? dictionary.workspace.resumeErrors.uploadFailed
              : dictionary.workspace.resumeDetail.replaceSource.saveError
        )
      );
    }

    throw error;
  }
}

export async function updateParsedResumeAction(
  _previousState: UpdateParsedResumeActionState,
  formData: FormData
): Promise<UpdateParsedResumeActionState> {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const parsed = updateParsedResumeSchema.safeParse({
    id: readFormString(formData, "id"),
    parsedResume: readFormString(formData, "parsedResume"),
  });

  if (!parsed.success) {
    return {
      message: dictionary.workspace.resumeDetail.editor.validationError,
      status: "error",
    };
  }

  try {
    const result = await updateUserParsedResume(userId, parsed.data);
    const resumePath = `/resumes/${result.resumeId}`;

    revalidatePath("/resumes");
    revalidatePath(resumePath);

    return {
      message: dictionary.workspace.resumeDetail.editor.success.replace(
        "{count}",
        result.bulletCount.toString()
      ),
      status: "success",
    };
  } catch (error) {
    if (error instanceof ResumeServiceError) {
      return {
        message:
          error.code === "resume_not_found"
            ? dictionary.workspace.resumeErrors.notFound
            : dictionary.workspace.resumeDetail.editor.saveError,
        status: "error",
      };
    }

    throw error;
  }
}
