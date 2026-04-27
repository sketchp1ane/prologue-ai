import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign in - Prologue / 第一页",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/20 px-6 py-12">
      <SignIn />
    </main>
  );
}
