import { Users } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";

export default async function CandidatesPage() {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const copy = dictionary.workspace.placeholders.candidates;

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
      />
      <EmptyState
        icon={Users}
        title={copy.emptyTitle}
        description={copy.emptyDescription}
        action={{
          label: copy.action,
          icon: Users,
        }}
      />
    </>
  );
}
