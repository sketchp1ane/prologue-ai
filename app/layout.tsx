import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { zhCN } from "@clerk/localizations";
import { cookies } from "next/headers";
import "./globals.css";

import {
  LOCALE_COOKIE_NAME,
  getLocaleFromCookieValue,
} from "@/src/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prologue / 第一页 - AI Job-Search Workspace",
  description:
    "Parse resumes, analyze job descriptions, rewrite bullets, track applications, and prepare for interviews in one focused workspace.",
};

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value
  );
  const clerkLocalization = locale === "zh-CN" ? zhCN : undefined;
  const body = clerkPublishableKey ? (
    <ClerkProvider
      localization={clerkLocalization}
      publishableKey={clerkPublishableKey}
    >
      {children}
    </ClerkProvider>
  ) : (
    children
  );

  return (
    <html lang={locale} className="bg-background">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        {body}
      </body>
    </html>
  );
}
