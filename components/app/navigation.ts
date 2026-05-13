import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export type AppNavigationItem = {
  labelKey: AppNavigationLabelKey;
  href: string;
  icon: LucideIcon;
  badgeKey?: AppNavigationBadgeKey;
};

export type AppNavigationLabelKey =
  | "analytics"
  | "applications"
  | "billing"
  | "candidates"
  | "dashboard"
  | "interviews"
  | "jdExtract"
  | "resumes"
  | "settings";

export type AppNavigationBadgeKey = "new";

// Single flat list - cleaner, less visual hierarchy
export const appNavigationItems: AppNavigationItem[] = [
  {
    labelKey: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    labelKey: "resumes",
    href: "/resumes",
    icon: FileText,
  },
  {
    labelKey: "candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    labelKey: "applications",
    href: "/applications",
    icon: Briefcase,
  },
];

// Bottom nav items (settings, etc.)
export const appBottomNavItems: AppNavigationItem[] = [
  {
    labelKey: "settings",
    href: "/settings",
    icon: Settings,
  },
];
