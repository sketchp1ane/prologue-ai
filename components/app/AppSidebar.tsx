"use client";

import { Menu, PanelLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";

import { cn } from "@/src/lib/utils";

import {
  appBottomNavItems,
  appNavigationItems,
  type AppNavigationItem,
} from "./navigation";

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
        className="fixed left-4 top-3.5 z-40 flex h-9 w-9 items-center justify-center rounded-lg bg-card text-foreground ring-1 ring-border transition-colors hover:bg-secondary lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-[18px] w-[18px]" />
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
          "fixed inset-y-0 left-0 z-50 w-[260px] bg-card shadow-xl transition-transform duration-200 ease-out lg:hidden",
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
          collapsed ? "w-[60px]" : "w-64"
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

/* ---------------- Mobile Sidebar ---------------- */

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
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/" className="flex items-baseline gap-1.5" onClick={onClose}>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Prologue
          </span>
          <span className="text-xs text-muted-foreground">/ 第一页</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close menu"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* New Action */}
      <div className="px-3 pb-2">
        <button
          type="button"
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          <Plus className="h-4 w-4" />
          New Application
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Main">
        <ul className="space-y-0.5">
          {appNavigationItems.map((item) => (
            <li key={item.href}>
              <NavItemExpanded
                item={item}
                isActive={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                }
                onClick={onClose}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Items */}
      <div className="px-3 pb-4">
        <ul className="space-y-0.5">
          {appBottomNavItems.map((item) => (
            <li key={item.href}>
              <NavItemExpanded
                item={item}
                isActive={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                }
                onClick={onClose}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Desktop Sidebar ---------------- */

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
          "flex h-16 items-center",
          collapsed ? "justify-center px-2" : "justify-between px-5"
        )}
      >
        {collapsed ? (
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background transition-colors hover:bg-foreground/90"
            aria-label="Prologue home"
          >
            <span className="text-[13px] font-semibold leading-none">P</span>
          </Link>
        ) : (
          <>
            <Link href="/" className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-semibold tracking-tight text-foreground">
                Prologue
              </span>
              <span className="text-xs text-muted-foreground">/ 第一页</span>
            </Link>
            <button
              type="button"
              onClick={onToggle}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Collapse sidebar"
            >
              <PanelLeft className="h-[15px] w-[15px]" />
            </button>
          </>
        )}
      </div>

      {/* New Action */}
      <div className={cn("pb-2", collapsed ? "px-3" : "px-3")}>
        {collapsed ? (
          <NavTooltip label="New Application">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background transition-colors hover:bg-foreground/90"
              aria-label="New Application"
            >
              <Plus className="h-[15px] w-[15px]" />
            </button>
          </NavTooltip>
        ) : (
          <button
            type="button"
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            <Plus className="h-4 w-4" />
            New Application
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto py-2",
          collapsed ? "px-3" : "px-3"
        )}
        aria-label="Main"
      >
        <ul className={cn(collapsed ? "space-y-1" : "space-y-0.5")}>
          {appNavigationItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                {collapsed ? (
                  <NavItemCollapsed item={item} isActive={isActive} />
                ) : (
                  <NavItemExpanded item={item} isActive={isActive} />
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: Settings + Collapse Toggle */}
      <div className={cn("pb-3 pt-1", collapsed ? "px-3" : "px-3")}>
        <ul className={cn(collapsed ? "space-y-1" : "space-y-0.5")}>
          {appBottomNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                {collapsed ? (
                  <NavItemCollapsed item={item} isActive={isActive} />
                ) : (
                  <NavItemExpanded item={item} isActive={isActive} />
                )}
              </li>
            );
          })}

          {/* Collapse toggle - aligned with settings in collapsed mode */}
          {collapsed && (
            <li>
              <NavTooltip label="Expand sidebar">
                <button
                  type="button"
                  onClick={onToggle}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Expand sidebar"
                >
                  <PanelLeft className="h-[15px] w-[15px] rotate-180" />
                </button>
              </NavTooltip>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Nav Item: Expanded ---------------- */

function NavItemExpanded({
  item,
  isActive,
  onClick,
}: {
  item: AppNavigationItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      )}
    >
      <item.icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground/80 group-hover:text-foreground"
        )}
        strokeWidth={isActive ? 2.25 : 2}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            isActive
              ? "bg-foreground text-background"
              : "bg-foreground/5 text-foreground/70"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

/* ---------------- Nav Item: Collapsed (compact icon) ---------------- */

function NavItemCollapsed({
  item,
  isActive,
}: {
  item: AppNavigationItem;
  isActive: boolean;
}) {
  return (
    <NavTooltip label={item.label} badge={item.badge}>
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          isActive
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <item.icon className="h-[15px] w-[15px]" strokeWidth={2} />
        {item.badge && !isActive && (
          <span
            aria-hidden="true"
            className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-foreground"
          />
        )}
      </Link>
    </NavTooltip>
  );
}

/* ---------------- Tooltip (collapsed mode) ---------------- */

function NavTooltip({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
      >
        {label}
        {badge && (
          <span className="ml-1.5 rounded-sm bg-background/20 px-1 py-px text-[9px] uppercase tracking-wide">
            {badge}
          </span>
        )}
      </span>
    </div>
  );
}
