import "server-only";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();

  return userId;
}

export async function requireCurrentUserId(): Promise<string> {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/sign-in");
  }

  return userId;
}
