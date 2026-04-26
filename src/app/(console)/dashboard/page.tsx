import { LayoutDashboard } from "lucide-react";
import { PlaceholderPage } from "@/components/data/placeholder-page";

export default function DashboardPage() {
  return (
    <PlaceholderPage
      eyebrow="Overview"
      title="Multi-tenant dashboard"
      description="Health donut, drillable alerts, and at-risk tenant signal across the entire MSP fleet."
      icon={LayoutDashboard}
      emptyTitle="Dashboard wires up next"
      emptyDescription="The health donut, top alerts, and capacity signal will land in the next iteration."
    />
  );
}
