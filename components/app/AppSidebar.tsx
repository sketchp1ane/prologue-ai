"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/src/lib/utils";

import { appNavigationItems } from "./navigation";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-secondary/20 lg:min-h-screen lg:w-64 lg:border-r">
      <div className="hidden h-16 items-center border-b border-border px-6 lg:flex">
        <Link href="/" className="flex items-baseline gap-2" aria-label="Prologue home">
          <span className="text-lg font-semibold tracking-tight text-foreground">Prologue</span>
          <span className="text-sm text-muted-foreground">/ 第一页</span>
        </Link>
      </div>

      <nav aria-label="Workspace navigation" className="flex gap-2 overflow-x-auto p-4 lg:block lg:p-3">
        {appNavigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
