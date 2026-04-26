import { UserPlus } from "lucide-react";
import { PlaceholderPage } from "@/components/data/placeholder-page";

export default function OnboardingNewPage() {
  return (
    <PlaceholderPage
      eyebrow="Onboarding · New tenant"
      title="New tenant wizard"
      description="Identity, isolation, policy, and deploy — a single guided flow."
      icon={UserPlus}
      emptyTitle="Wizard implementation wires up next"
      emptyDescription="The multi-step react-hook-form wizard with deploy animation will land in the next iteration."
    />
  );
}
