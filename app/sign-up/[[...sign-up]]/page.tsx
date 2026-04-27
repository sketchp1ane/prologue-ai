import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { ClerkConfigurationNotice } from "@/components/auth/ClerkConfigurationNotice";

export const metadata: Metadata = {
  title: "Sign up - Prologue / 第一页",
};

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/20 px-6 py-12">
      {clerkPublishableKey ? (
        <SignUp />
      ) : (
        <div className="w-full max-w-md">
          <ClerkConfigurationNotice mode="sign-up" />
        </div>
      )}
    </main>
  );
}
