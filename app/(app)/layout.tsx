import { AppSidebar } from "@/components/app/AppSidebar";
import { AppTopbar } from "@/components/app/AppTopbar";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireCurrentUserId();

  return (
    <div className="min-h-screen bg-secondary/30 text-foreground lg:flex">
      <AppSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:border-l lg:border-border">
        <AppTopbar />
        <main className="flex-1 px-5 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
