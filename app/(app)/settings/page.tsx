"use client";

import { Bell, CreditCard, Key, Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppCard } from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

const settingsTabs = [
  { label: "Profile", icon: User, href: "/settings" },
  { label: "Notifications", icon: Bell, href: "/settings/notifications" },
  { label: "Security", icon: Shield, href: "/settings/security" },
  { label: "API Keys", icon: Key, href: "/settings/api-keys" },
  { label: "Billing", icon: CreditCard, href: "/billing" },
];

export default function SettingsPage() {
  const pathname = usePathname();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and workspace preferences."
      />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Settings Navigation */}
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {settingsTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Profile Section */}
          <AppCard>
            <h3 className="mb-4 text-lg font-medium text-foreground">
              Profile Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <span className="text-xl font-semibold text-primary">JD</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">John Doe</p>
                  <p className="text-sm text-muted-foreground">
                    john@example.com
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto rounded-lg">
                  Edit
                </Button>
              </div>
            </div>
          </AppCard>

          {/* Account Details */}
          <AppCard>
            <h3 className="mb-4 text-lg font-medium text-foreground">
              Account Details
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="john@example.com"
                    className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full resize-none rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex justify-end">
                <Button className="rounded-xl">Save Changes</Button>
              </div>
            </div>
          </AppCard>

          {/* Plan Info */}
          <AppCard>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  Current Plan
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You&apos;re on the Free plan with limited features.
                </p>
              </div>
              <div className="rounded-full border border-border bg-secondary/30 px-3 py-1 text-sm font-medium text-foreground">
                Free
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                Upgrade to Pro
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                Get unlimited AI rewrites, advanced analytics, and priority
                support.
              </p>
              <Button size="sm" className="rounded-lg">
                Upgrade Now
              </Button>
            </div>
          </AppCard>
        </div>
      </div>
    </>
  );
}
