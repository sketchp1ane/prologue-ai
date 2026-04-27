"use client";

import { ChevronsLeft, ChevronsRight, Menu, Plus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

import { appBottomNavItems, appNavigationItems } from "./navigation";

// Sidebar context for collapse state
type SidebarContextType = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-sm ring-1 ring-border lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-xl transition-transform duration-200 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <MobileSidebarContent
          pathname={pathname}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen flex-col bg-card transition-[width] duration-200 ease-out lg:flex",
          collapsed ? "w-[72px]" : "w-60"
        )}
      >
        <DesktopSidebarContent
          pathname={pathname}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>
    </SidebarContext.Provider>
  );
}

function MobileSidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-baseline gap-1.5"
          onClick={onClose}
        >
          <span className="text-base font-semibold text-foreground">
            Prologue
          </span>
          <span className="text-xs text-muted-foreground">/ 第一页</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* New Action */}
      <div className="px-3 pb-2">
        <Button className="w-full gap-2 rounded-xl" size="default">
          <Plus className="h-4 w-4" />
          New Application
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {appNavigationItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Items */}
      <div className="px-3 pb-4">
        <ul className="space-y-1">
          {appBottomNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function DesktopSidebarContent({
  pathname,
  collapsed,
  onToggle,
}: {
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className={cn(
          "flex h-14 items-center",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-baseline gap-1.5 transition-opacity",
            collapsed && "sr-only"
          )}
        >
          <span className="text-base font-semibold text-foreground">
            Prologue
          </span>
          <span className="text-xs text-muted-foreground">/ 第一页</span>
        </Link>
        {collapsed && (
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background"
            aria-label="Prologue home"
          >
            <span className="text-sm font-bold">P</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            collapsed && "hidden"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>

      {/* New Action */}
      <div className={cn("px-3 pb-2", collapsed && "px-2")}>
        {collapsed ? (
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center rounded-xl bg-foreground text-background transition-colors hover:bg-foreground/90"
            aria-label="New Application"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <Button className="w-full gap-2 rounded-xl" size="default">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Main">
        <ul className="space-y-1">
          {appNavigationItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center rounded-xl transition-colors",
                    collapsed
                      ? "h-10 w-full justify-center px-0"
                      : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                            isActive
                              ? "bg-background/20 text-background"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-xs font-medium text-background shadow-lg group-hover:block">
                      {item.label}
                      {item.badge && (
                        <span className="ml-1.5 rounded bg-background/20 px-1 py-0.5 text-[10px] uppercase">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Items */}
      <div className={cn("px-3 pb-3", collapsed && "px-2")}>
        <ul className="space-y-1">
          {appBottomNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center rounded-xl transition-colors",
                    collapsed
                      ? "h-10 w-full justify-center px-0"
                      : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-xs font-medium text-background shadow-lg group-hover:block">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="mt-2 flex h-10 w-full items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
