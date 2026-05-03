import { PageHeader } from "@/components/app/PageHeader";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";
import { listUserResumes } from "@/src/lib/resumes/service";

import { ApplicationCreateForm } from "./ApplicationCreateForm";

type NewApplicationPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readError(params: Record<string, string | string[] | undefined> | undefined) {
  const value = params?.error;

  return typeof value === "string" ? value : null;
}

export default async function NewApplicationPage({
  searchParams,
}: NewApplicationPageProps) {
  const [params, userId] = await Promise.all([
    searchParams,
    requireCurrentUserId(),
  ]);
  const [locale, resumes] = await Promise.all([
    getCurrentLocale(userId),
    listUserResumes(userId),
  ]);
  const dictionary = getDictionary(locale);

  return (
    <>
      <PageHeader
        title={dictionary.workspace.applicationCreate.title}
        description={dictionary.workspace.applicationCreate.description}
        secondaryAction={{
          href: "/applications",
          label: dictionary.workspace.applicationCreate.backToApplications,
        }}
      />
      <ApplicationCreateForm
        dictionary={dictionary}
        initialError={readError(params)}
        resumes={resumes.map((resume) => ({
          id: resume.id,
          title: resume.title,
        }))}
      />
    </>
  );
}
