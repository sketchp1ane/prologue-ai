import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
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

// Single flat list - cleaner, less visual hierarchy
export const appNavigationItems: AppNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "JD Extract",
    href: "/jd-extract",
    icon: FileSearch,
    badge: "New",
  },
  {
    label: "Resumes",
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
];

// Bottom nav items (settings, etc.)
export const appBottomNavItems: AppNavigationItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
