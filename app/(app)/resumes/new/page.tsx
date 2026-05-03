import { PageHeader } from "@/components/app/PageHeader";
import { RouteToast } from "@/components/app/RouteToast";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";
import {
  RESUME_SOURCE_TEXT_MAX_LENGTH,
  RESUME_TITLE_MAX_LENGTH,
  RESUME_PDF_MAX_BYTES,
} from "@/src/lib/validations/resume";

import { createSelectedResumeAction } from "../actions";
import { ResumeCreateForm } from "./ResumeCreateForm";

type NewResumePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readError(params: Record<string, string | string[] | undefined> | undefined) {
  const value = params?.error;

  return typeof value === "string" ? value : null;
}

export default async function NewResumePage({
  searchParams,
}: NewResumePageProps) {
  const [params, userId] = await Promise.all([
    searchParams,
    requireCurrentUserId(),
  ]);
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const copy = dictionary.workspace.resumeCreate;
  const error = readError(params);

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
        secondaryAction={{
          href: "/resumes",
          label: copy.backToResumes,
        }}
      />
      <RouteToast error={error} />
      <ResumeCreateForm
        action={createSelectedResumeAction}
        cancelLabel={dictionary.common.cancel}
        copy={copy}
        pdfMaxBytes={RESUME_PDF_MAX_BYTES}
        sourceTextMaxLength={RESUME_SOURCE_TEXT_MAX_LENGTH}
        titleMaxLength={RESUME_TITLE_MAX_LENGTH}
      />
    </>
  );
}
