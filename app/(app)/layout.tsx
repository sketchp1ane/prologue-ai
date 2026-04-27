import { AppSidebar } from "@/components/app/AppSidebar";
import { AppTopbar } from "@/components/app/AppTopbar";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireCurrentUserId();

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[16rem_1fr]">
      <AppSidebar />
      <div className="min-w-0">
        <AppTopbar />
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
