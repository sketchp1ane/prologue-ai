import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const body = clerkPublishableKey ? (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      {children}
    </ClerkProvider>
  ) : (
    children
  );

  return (
    <html lang="en" className="bg-background">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        {body}
      </body>
    </html>
  );
}
