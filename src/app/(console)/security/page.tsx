import { Lock } from "lucide-react";
import { PlaceholderPage } from "@/components/data/placeholder-page";

export default function SecurityPage() {
  return (
    <PlaceholderPage
      eyebrow="Hero"
      title="Isolation verification matrix"
      description="Per-tenant, per-control isolation posture with drill-down, remediation, and attestation export."
      icon={Lock}
      emptyTitle="Matrix wires up next"
      emptyDescription="The isolation grid, cell drill-down sheet, and remediation flow will land in the next iteration."
    />
  );
}
