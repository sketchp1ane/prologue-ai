import type { LucideIcon } from "lucide-react";
import { Briefcase, FileText, LayoutDashboard, MessageSquare, Settings } from "lucide-react";

export type AppNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const appNavigationItems: AppNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Resumes",
    href: "/resumes",
    icon: FileText,
  },
  {
    label: "Applications",
    href: "/applications",
    icon: Briefcase,
  },
  {
    label: "Interviews",
    href: "/interviews",
    icon: MessageSquare,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
