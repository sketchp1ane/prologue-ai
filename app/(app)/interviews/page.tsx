import { MessageSquare } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";

export default async function InterviewsPage() {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const copy = dictionary.workspace.placeholders.interviews;

  return (
    <EmptyState
      icon={MessageSquare}
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      statusLabel={copy.status}
    />
  );
}
