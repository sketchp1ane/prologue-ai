"use client";

import { ChevronDown, Menu, Plus, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

import { appNavigationGroups, appNavigationItems } from "./navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button - shown in AppTopbar area on mobile */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-card transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <Link
              href="/"
              className="flex items-baseline gap-2"
              aria-label="Prologue home"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Prologue
              </span>
              <span className="text-sm text-muted-foreground">/ 第一页</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile New Action Button */}
          <div className="border-b border-border p-4">
            <Button className="w-full gap-2 rounded-xl" size="lg">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            {appNavigationItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Upgrade CTA */}
          <div className="border-t border-border p-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Upgrade to Pro
                </span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Unlock unlimited AI rewrites and advanced analytics.
              </p>
              <Button size="sm" className="w-full rounded-lg">
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-card lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link
            href="/"
            className="flex items-baseline gap-2"
            aria-label="Prologue home"
          >
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Prologue
            </span>
            <span className="text-sm text-muted-foreground">/ 第一页</span>
          </Link>
        </div>

        {/* Workspace Switcher */}
        <div className="border-b border-border p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-left transition-colors hover:bg-secondary/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-sm font-semibold text-primary">P</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                Personal Workspace
              </p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </div>

        {/* New Action Button */}
        <div className="p-3">
          <Button className="w-full gap-2 rounded-xl" size="default">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </div>

        {/* Navigation Groups */}
        <nav
          aria-label="Workspace navigation"
          className="flex-1 overflow-y-auto px-3 pb-3"
        >
          {appNavigationGroups.map((group, groupIndex) => (
            <div key={group.label || groupIndex} className="mb-4">
              {group.label && (
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            isActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Upgrade CTA */}
        <div className="border-t border-border p-3">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Upgrade to Pro
              </span>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Unlock unlimited AI rewrites and advanced analytics.
            </p>
            <Button size="sm" className="w-full rounded-lg">
              Upgrade
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
