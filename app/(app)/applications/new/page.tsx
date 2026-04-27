import { PageHeader } from "@/components/app/PageHeader";

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
  const params = await searchParams;

  return (
    <>
      <PageHeader
        title="New Application"
        description="Paste a JD, run extraction, review the fields, and save."
        secondaryAction={{
          href: "/applications",
          label: "Back to applications",
        }}
      />
      <ApplicationCreateForm initialError={readError(params)} />
    </>
  );
}
