import { Settings } from "lucide-react";
import { PlaceholderPage } from "@/components/data/placeholder-page";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Workspace"
      title="Settings"
      description="Operators, API tokens, integrations, and audit retention for this MSP workspace."
      icon={Settings}
      emptyTitle="Settings wires up later"
      emptyDescription="Workspace configuration is out of Phase 1's hero scope — the polish layer will revisit it."
    />
  );
}
