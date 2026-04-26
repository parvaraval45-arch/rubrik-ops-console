import { Building2 } from "lucide-react";
import { PlaceholderPage } from "@/components/data/placeholder-page";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PlaceholderPage
      eyebrow={`Tenant · ${id}`}
      title="Tenant detail"
      description="Capacity trend, recent jobs, applied policies, and isolation posture for this tenant."
      icon={Building2}
      emptyTitle="Tenant detail wires up next"
      emptyDescription="Per-tenant overview, jobs, alerts, and policy assignments will land in the next iteration."
    />
  );
}
