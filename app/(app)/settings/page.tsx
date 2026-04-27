import { Settings } from "lucide-react";

import { EmptyState } from "@/components/app/EmptyState";

export default function SettingsPage() {
  return (
    <EmptyState
      icon={Settings}
      eyebrow="Settings"
      title="Workspace settings will stay tidy."
      description="Account details, preferences, usage visibility, and AI configuration will live here when the app services are connected."
      statusLabel="Placeholder"
    />
  );
}
