"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";

export default function OnboardingNewPage() {
  const router = useRouter();
  const createDraft = useConsoleStore((s) => s.createDraft);
  const created = useRef(false);

  useEffect(() => {
    if (created.current) return;
    created.current = true;
    const id = createDraft(currentOperator.name);
    router.replace(`/onboarding/draft/${id}`);
  }, [createDraft, router]);

  return (
    <div className="flex h-[60vh] items-center justify-center text-text-tertiary">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Creating draft…
    </div>
  );
}
