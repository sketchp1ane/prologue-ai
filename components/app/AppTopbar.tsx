"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { appBottomNavItems, appNavigationItems } from "./navigation";

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getPageTitle(pathname: string): { title: string; breadcrumb?: string } {
  const allItems = [...appNavigationItems, ...appBottomNavItems];
  const navItem = allItems.find((item) => isActiveRoute(pathname, item.href));

  if (navItem) {
    return { title: navItem.label };
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 1) {
    const parentItem = appNavigationItems.find(
      (item) => item.href === `/${segments[0]}`
    );
    if (parentItem) {
      return {
        title: segments[segments.length - 1]
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        breadcrumb: parentItem.label,
      };
    }
  }

  return { title: "Dashboard" };
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppTopbar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { title, breadcrumb } = getPageTitle(pathname);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchTitleId = useId();
  const displayName =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    user?.username ??
    "Account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "Signed in";
  const initials = getInitials(displayName) || "A";

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!userMenuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [userMenuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,32rem)_minmax(0,1fr)] lg:px-8 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,39rem)_minmax(0,1fr)]">
        {/* Left: Page Title / Breadcrumb */}
        <div className="flex min-w-0 items-center gap-3 justify-self-start pl-12 lg:pl-0">
          {breadcrumb && (
            <>
              <span className="hidden text-sm text-muted-foreground sm:block">
                {breadcrumb}
              </span>
              <span className="hidden text-muted-foreground/50 sm:block">/</span>
            </>
          )}
          <h1 className="truncate text-lg font-semibold text-foreground">
            {title}
          </h1>
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden w-full justify-center lg:flex">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1 text-left">Search applications...</span>
            <kbd className="hidden rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex min-w-max items-center gap-2 justify-self-end">
          {/* Mobile Search */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          {/* Help */}
          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex min-w-max items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card py-1 pl-1 pr-3 shadow-sm transition-colors hover:bg-secondary/50"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xs font-medium text-primary">
                  {initials}
                </span>
              </div>
              <span className="hidden text-sm font-medium text-foreground sm:block">
                {displayName}
              </span>
              <ChevronDown
                className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block"
                aria-hidden="true"
              />
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                  aria-hidden="true"
                />
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg"
                  role="menu"
                >
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="text-sm font-medium text-foreground">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">{email}</p>
                  </div>
                  <div className="py-1.5">
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      role="menuitem"
                    >
                      <User className="h-4 w-4" aria-hidden="true" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      role="menuitem"
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-border pt-1.5">
                    <button
                      type="button"
                      onClick={() => signOut({ redirectUrl: "/" })}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={searchTitleId}
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Search applications, resumes, jobs..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />
                <kbd className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ESC
                </kbd>
              </div>
              <div className="p-4">
                <p
                  id={searchTitleId}
                  className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Quick Actions
                </p>
                <div className="space-y-1">
                  {[
                    "Create new application",
                    "Upload resume",
                    "Extract from job description",
                  ].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
