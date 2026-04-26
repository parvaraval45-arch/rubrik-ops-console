import { Building2 } from "lucide-react";
import { PlaceholderPage } from "@/components/data/placeholder-page";

export default function TenantsPage() {
  return (
    <PlaceholderPage
      eyebrow="Customers"
      title="Tenants"
      description="Every tenant under management — tier, region, capacity, security score, and SLA."
      icon={Building2}
      emptyTitle="Tenant directory wires up next"
      emptyDescription="The full tenant table with filters, saved views, and bulk actions will land in the next iteration."
    />
  );
}
