import { Bell, Check, CreditCard, Key, Languages, Shield, User } from "lucide-react";
import Link from "next/link";

import { AppCard } from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@/src/lib/i18n/config";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";
import { cn } from "@/src/lib/utils";

import { updateLocaleAction } from "./actions";

type SettingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string
) {
  const value = params?.[key];

  return typeof value === "string" ? value : null;
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const [params, userId] = await Promise.all([
    searchParams,
    requireCurrentUserId(),
  ]);
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const settings = dictionary.settings;
  const status = readSearchParam(params, "language");
  const error = readSearchParam(params, "error");
  const settingsTabs = [
    { label: settings.profile, icon: User, href: "/settings" },
    {
      label: settings.notifications,
      icon: Bell,
      href: "/settings/notifications",
    },
    { label: settings.security, icon: Shield, href: "/settings/security" },
    { label: settings.apiKeys, icon: Key, href: "/settings/api-keys" },
    { label: settings.billing, icon: CreditCard, href: "/billing" },
  ];

  return (
    <>
      <PageHeader title={settings.title} description={settings.description} />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {settingsTabs.map((tab) => {
            const isActive = tab.href === "/settings";
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

        <div className="space-y-6">
          <AppCard>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Languages className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  {settings.languageTitle}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {settings.languageDescription}
                </p>
              </div>
            </div>
            <form action={updateLocaleAction} className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {SUPPORTED_LOCALES.map((option) => (
                  <LocaleOption
                    key={option}
                    currentLocale={locale}
                    locale={option}
                  />
                ))}
              </div>
              {status === "saved" && (
                <p className="text-sm text-muted-foreground">
                  {settings.languageSaved}
                </p>
              )}
              {error === "invalid_locale" && (
                <p className="text-sm text-destructive">
                  {dictionary.errors.invalidLocale}
                </p>
              )}
              <div className="flex justify-end">
                <Button className="rounded-xl">{settings.saveChanges}</Button>
              </div>
            </form>
          </AppCard>

          <AppCard>
            <h3 className="mb-4 text-lg font-medium text-foreground">
              {settings.profileInformation}
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
                  {settings.edit}
                </Button>
              </div>
            </div>
          </AppCard>

          <AppCard>
            <h3 className="mb-4 text-lg font-medium text-foreground">
              {settings.accountDetails}
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {settings.fullName}
                  </label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {settings.email}
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
                  {settings.bio}
                </label>
                <textarea
                  rows={3}
                  placeholder={settings.bioPlaceholder}
                  className="w-full resize-none rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex justify-end">
                <Button className="rounded-xl">{settings.saveChanges}</Button>
              </div>
            </div>
          </AppCard>

          <AppCard>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  {settings.currentPlan}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {settings.planDescription}
                </p>
              </div>
              <div className="rounded-full border border-border bg-secondary/30 px-3 py-1 text-sm font-medium text-foreground">
                {settings.free}
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                {settings.upgradeTitle}
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                {settings.upgradeDescription}
              </p>
              <Button size="sm" className="rounded-lg">
                {settings.upgradeNow}
              </Button>
            </div>
          </AppCard>
        </div>
      </div>
    </>
  );
}

function LocaleOption({
  currentLocale,
  locale,
}: {
  currentLocale: AppLocale;
  locale: AppLocale;
}) {
  return (
    <label
      className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground transition hover:bg-secondary/60 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground"
    >
      <input
        type="radio"
        name="locale"
        value={locale}
        defaultChecked={currentLocale === locale}
        className="peer sr-only"
      />
      <span className="font-medium">{LOCALE_LABELS[locale]}</span>
      <Check
        className="h-4 w-4 opacity-0 transition-opacity peer-checked:opacity-100"
        aria-hidden="true"
      />
    </label>
  );
}
