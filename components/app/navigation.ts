import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  CreditCard,
  FileSearch,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export type AppNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type AppNavigationGroup = {
  label?: string;
  items: AppNavigationItem[];
};

export const appNavigationGroups: AppNavigationGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        label: "JD Extract",
        href: "/jd-extract",
        icon: FileSearch,
        badge: "New",
      },
      {
        label: "Resume Builder",
        href: "/resumes",
        icon: FileText,
      },
      {
        label: "Candidates",
        href: "/candidates",
        icon: Users,
      },
      {
        label: "Job Posts",
        href: "/applications",
        icon: Briefcase,
      },
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        label: "Billing",
        href: "/billing",
        icon: CreditCard,
      },
    ],
  },
];

// Flat list for mobile navigation
export const appNavigationItems: AppNavigationItem[] = appNavigationGroups.flatMap(
  (group) => group.items
);
