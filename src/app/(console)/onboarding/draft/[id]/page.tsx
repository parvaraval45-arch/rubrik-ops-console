"use client";

import { useParams } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/wizard/wizard";

export default function OnboardingDraftPage() {
  const params = useParams<{ id: string }>();
  const draftId = params.id;
  if (!draftId) return null;
  return <OnboardingWizard draftId={draftId} />;
}
