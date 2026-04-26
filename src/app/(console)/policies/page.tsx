import { Shield } from "lucide-react";
import { PlaceholderPage } from "@/components/data/placeholder-page";

export default function PoliciesPage() {
  return (
    <PlaceholderPage
      eyebrow="Governance"
      title="Policy templates"
      description="Versioned backup, retention, and replication policies with diff and propagation."
      icon={Shield}
      emptyTitle="Policy library wires up next"
      emptyDescription="Template list, version timeline, and diff view will land in the next iteration."
    />
  );
}
