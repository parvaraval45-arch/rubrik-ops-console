import { UserPlus } from "lucide-react";
import { PlaceholderPage } from "@/components/data/placeholder-page";

export default function OnboardingPage() {
  return (
    <PlaceholderPage
      eyebrow="Lifecycle"
      title="Onboarding"
      description="Wizard-driven tenant provisioning with isolation preview and cluster assignment."
      icon={UserPlus}
      emptyTitle="Onboarding wizard wires up next"
      emptyDescription="The four-step wizard with deploy animation will land in the next iteration."
    />
  );
}
