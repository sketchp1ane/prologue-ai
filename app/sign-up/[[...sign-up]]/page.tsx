import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign up - Prologue / 第一页",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/20 px-6 py-12">
      <SignUp />
    </main>
  );
}
