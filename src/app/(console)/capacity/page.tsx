import { Wallet } from "lucide-react";
import { PlaceholderPage } from "@/components/data/placeholder-page";

export default function CapacityPage() {
  return (
    <PlaceholderPage
      eyebrow="Finance"
      title="Capacity & billing"
      description="Per-tenant commit, overage, and reconciliation with line-item drill-down."
      icon={Wallet}
      emptyTitle="Capacity reconciliation wires up next"
      emptyDescription="Cluster utilization, per-tenant invoices, and side-sheet breakdowns will land in the next iteration."
    />
  );
}
