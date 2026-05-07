import { notFound } from "next/navigation";

import { ClerkTicketClient } from "@/app/dev/clerk-ticket/ClerkTicketClient";
import {
  isDevClerkTicketRouteEnabled,
  sanitizeDevClerkTicketNextPath,
} from "@/src/lib/auth/dev-clerk-ticket";

type ClerkTicketPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
    token?: string | string[];
  }>;
};

export default async function ClerkTicketPage({
  searchParams,
}: ClerkTicketPageProps) {
  if (!isDevClerkTicketRouteEnabled()) {
    notFound();
  }

  const params = await searchParams;
  const rawToken = Array.isArray(params?.token)
    ? params?.token[0]
    : params?.token;

  return (
    <ClerkTicketClient
      nextPath={sanitizeDevClerkTicketNextPath(params?.next)}
      token={rawToken ?? null}
    />
  );
}
