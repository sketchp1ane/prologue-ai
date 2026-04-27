import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export async function AppTopbar() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const displayName = user?.fullName ?? email ?? "Account";
  const detail = user?.fullName && email ? email : "Signed in";

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-5 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-foreground">Prologue / 第一页</p>
          <p className="text-xs text-muted-foreground">Workspace</p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-2.5 py-1.5 shadow-sm">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-7 w-7",
              },
            }}
          />
          <div className="hidden text-right sm:block">
            <p className="max-w-40 truncate text-xs font-medium text-foreground">{displayName}</p>
            <p className="max-w-40 truncate text-[10px] text-muted-foreground">{detail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
