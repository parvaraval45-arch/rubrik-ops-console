"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { WizardStepper } from "./stepper";
import { WizardFooter } from "./footer";
import { Step1Profile } from "./step-1-profile";
import { Step2Infra } from "./step-2-infra";
import { Step3Quotas } from "./step-3-quotas";
import { Step4Policy } from "./step-4-policy";
import { Step5Isolation, makeNamespace } from "./step-5-isolation";
import { Step6Billing } from "./step-6-billing";
import { Step7Review } from "./step-7-review";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5BaseSchema,
  step6Schema,
} from "./schemas";
import { WIZARD_STEPS } from "./steps";
import { useConsoleStore } from "@/lib/store";
import { mockData, currentOperator } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type {
  OnboardingDraft,
  PreFlightCheck,
  Tier,
  WizardStepNumber,
} from "@/types";

const fullSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5BaseSchema.shape,
  ...step6Schema.shape,
});
type WizardValues = z.infer<typeof fullSchema>;

const STEP_FIELDS: Record<WizardStepNumber, (keyof WizardValues)[]> = {
  1: [
    "tenantName",
    "legalEntity",
    "industry",
    "region",
    "primaryContact",
    "contactEmail",
    "resellerType",
    "resellerId",
    "isAdditionalSite",
    "parentTenantId",
    "tier",
  ],
  2: ["clusterId", "storageTier", "allocationTB"],
  3: [
    "storageTB",
    "storageSoftPct",
    "storageHardLimit",
    "workloads",
    "workloadsHardLimit",
    "transferOutTB",
    "transferOutHardLimit",
    "restorePoints",
    "restorePointsHardLimit",
    "overrideApprovalRequired",
  ],
  4: ["policyTemplateId", "inheritanceMode"],
  5: [
    "namespace",
    "iam",
    "tenantAdminEmail",
    "sendInviteOnDeploy",
    "mfaMode",
    "mfaDisabledReason",
    "keySource",
    "keyRotationDays",
    "byokKmsEndpoint",
  ],
  6: [
    "contactName",
    "billingEmail",
    "poNumber",
    "ratePerTB",
    "rateOverrideReason",
    "capacityCommitTB",
    "annualMinimumCommit",
    "overagePolicy",
    "cadence",
    "paymentTerms",
    "currency",
    "resellerCommissionPct",
    "resellerCommissionReason",
  ],
  7: [],
};

const TIER_DEFAULTS: Record<Tier, { rate: number }> = {
  Platinum: { rate: 85 },
  Gold: { rate: 65 },
  Silver: { rate: 50 },
  Bronze: { rate: 30 },
};

interface WizardProps {
  draftId: string;
}

export function OnboardingWizard({ draftId }: WizardProps) {
  const router = useRouter();
  const drafts = useConsoleStore((s) => s.drafts);
  const upsertDraft = useConsoleStore((s) => s.upsertDraft);
  const reassignDraft = useConsoleStore((s) => s.reassignDraft);

  const existingDraft = drafts.find((d) => d.id === draftId);
  const tenants = useConsoleStore((s) => s.tenants);
  const existingTenantNames = useMemo(
    () => tenants.map((t) => t.name),
    [tenants],
  );

  const initialValues = useMemo<Partial<WizardValues>>(
    () => makeInitialValues(existingDraft),
    [existingDraft],
  );

  const form = useForm<WizardValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: initialValues as WizardValues,
    mode: "onBlur",
  });

  const [currentStep, setCurrentStep] = useState<WizardStepNumber>(
    existingDraft?.currentStep ?? 1,
  );
  const [completedThrough, setCompletedThrough] = useState<WizardStepNumber>(
    existingDraft ? Math.max(1, (existingDraft.currentStep - 1) as WizardStepNumber) as WizardStepNumber : 1,
  );

  // Pre-flight state
  const [preflight, setPreflight] = useState<PreFlightCheck[]>(initialPreflight());
  const [preflightRunning, setPreflightRunning] = useState(false);
  const preflightAllPassed = preflight.every((c) => c.status === "pass");
  const [hasRunPreflightOnce, setHasRunPreflightOnce] = useState(false);

  // Autosave state
  const [saving, setSaving] = useState(false);
  const lastSerializedRef = useRef<string>("");

  // Defaults / cascading
  // eslint-disable-next-line react-hooks/incompatible-library -- watch() is the supported react-hook-form pattern; React Compiler memoization is intentionally skipped.
  const tier = form.watch("tier") as Tier | undefined;
  const allocationTB = form.watch("allocationTB") as number | undefined;
  const tenantName = form.watch("tenantName") as string | undefined;
  const contactEmail = form.watch("contactEmail") as string | undefined;
  const primaryContact = form.watch("primaryContact") as string | undefined;
  const region = form.watch("region");
  const industry = form.watch("industry");

  // Cascade tier rate to billing on first time
  useEffect(() => {
    if (tier && !form.getValues("ratePerTB")) {
      form.setValue("ratePerTB", TIER_DEFAULTS[tier].rate);
    }
  }, [tier, form]);

  // Cascade allocation to quota storage default + billing capacity commit
  useEffect(() => {
    if (allocationTB && !form.getValues("storageTB")) {
      form.setValue("storageTB", allocationTB);
    }
    if (allocationTB && !form.getValues("capacityCommitTB")) {
      form.setValue("capacityCommitTB", allocationTB);
    }
  }, [allocationTB, form]);

  // Cascade tenant name → namespace + billing contact name + tenant admin email
  useEffect(() => {
    if (!form.getValues("namespace") && tenantName) {
      form.setValue("namespace", makeNamespace(tenantName));
    }
  }, [tenantName, form]);

  useEffect(() => {
    if (primaryContact && !form.getValues("contactName")) {
      form.setValue("contactName", primaryContact);
    }
  }, [primaryContact, form]);

  useEffect(() => {
    if (contactEmail && !form.getValues("billingEmail")) {
      form.setValue("billingEmail", contactEmail);
    }
    if (contactEmail && !form.getValues("tenantAdminEmail")) {
      form.setValue("tenantAdminEmail", contactEmail);
    }
  }, [contactEmail, form]);

  // Persist to localStorage every 2s when dirty
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = setInterval(() => {
      const values = form.getValues();
      const serialized = JSON.stringify({ values, currentStep });
      if (serialized === lastSerializedRef.current) return;
      lastSerializedRef.current = serialized;
      try {
        window.localStorage.setItem(
          `rubrik-onboarding-draft:${draftId}`,
          serialized,
        );
      } catch {
        // storage may be full or disabled — silently degrade
      }
    }, 2000);
    return () => clearInterval(id);
  }, [draftId, form, currentStep]);

  // Hydrate from localStorage if no zustand draft exists yet
  useEffect(() => {
    if (existingDraft || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`rubrik-onboarding-draft:${draftId}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.values) form.reset(parsed.values);
      if (parsed.currentStep) {
        setCurrentStep(parsed.currentStep as WizardStepNumber);
        setCompletedThrough(
          Math.max(1, parsed.currentStep - 1) as WizardStepNumber,
        );
      }
    } catch {
      // ignore corrupt drafts
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistDraft = (
    nextStep: WizardStepNumber,
    completed: WizardStepNumber,
  ) => {
    const values = form.getValues();
    const draft: OnboardingDraft = mergeDraft(existingDraft, {
      id: draftId,
      currentStep: nextStep,
      values,
      assignedTo: existingDraft?.assignedTo ?? currentOperator.name,
      createdBy: existingDraft?.createdBy ?? currentOperator.name,
    });
    upsertDraft(draft);
    void completed;
  };

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep] as (keyof WizardValues)[];
    if (fields.length > 0) {
      const ok = await form.trigger(fields as Parameters<typeof form.trigger>[0]);
      if (!ok) return;
    }
    if (currentStep === 7) return;
    const nextStep = (currentStep + 1) as WizardStepNumber;
    setCurrentStep(nextStep);
    setCompletedThrough(currentStep);
    persistDraft(nextStep, currentStep);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (currentStep === 1) return;
    const back = (currentStep - 1) as WizardStepNumber;
    setCurrentStep(back);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (step: WizardStepNumber) => {
    if (step <= completedThrough || step === currentStep) {
      setCurrentStep(step);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveDraft = () => {
    setSaving(true);
    persistDraft(currentStep, completedThrough);
    setTimeout(() => {
      setSaving(false);
      toast.success("Draft saved", {
        description: "Pick up later from the onboarding queue.",
      });
    }, 350);
  };

  const handleReassign = (operator: string) => {
    reassignDraft(draftId, operator, currentOperator.name, "Reassigned from wizard.");
    toast.success(`Reassigned to ${operator}`);
  };

  const runPreFlight = () => {
    setPreflightRunning(true);
    const checks = generatePreFlightChecks({
      tenantName,
      industry,
      region,
      contactEmail,
      conflictTenant: hasRunPreflightOnce ? null : "Crawford & Associates LLP",
    });

    let i = 0;
    const next = () => {
      const check = checks[i];
      // Mark running
      setPreflight((prev) =>
        prev.map((c, idx) => (idx === i ? { ...c, status: "running" } : c)),
      );
      const startedAt = performance.now();
      setTimeout(() => {
        const duration = Math.round(performance.now() - startedAt);
        setPreflight((prev) =>
          prev.map((c, idx) =>
            idx === i ? { ...c, ...check, durationMs: duration } : c,
          ),
        );
        if (check.status === "fail") {
          setPreflightRunning(false);
          setHasRunPreflightOnce(true);
          toast.error("Pre-flight check failed", {
            description: check.detail ?? "Resolve the issue and re-run.",
          });
          return;
        }
        i += 1;
        if (i < checks.length) {
          next();
        } else {
          setPreflightRunning(false);
          setHasRunPreflightOnce(true);
          toast.success("Pre-flight passed", {
            description: "All 8 checks green. Ready to deploy.",
          });
        }
      }, 500 + Math.random() * 350);
    };
    next();
  };

  const handleDeploy = () => {
    persistDraft(7, 7);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(`rubrik-onboarding-draft:${draftId}`);
    }
    router.push(`/onboarding/deploying/${draftId}`);
  };

  // Build the live OnboardingDraft for Step 7
  const liveDraft = mergeDraft(existingDraft, {
    id: draftId,
    currentStep,
    values: form.getValues(),
    assignedTo: existingDraft?.assignedTo ?? currentOperator.name,
    createdBy: existingDraft?.createdBy ?? currentOperator.name,
  });

  return (
    <FormProvider {...form}>
      <div className="grid grid-cols-1 gap-0 xl:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-border-subtle xl:block">
          <div className="sticky top-0 px-2 py-3">
            <WizardStepper
              currentStep={currentStep}
              completedThrough={completedThrough}
              onStepClick={handleStepClick}
            />
            {existingDraft?.reassignmentHistory && existingDraft.reassignmentHistory.length > 0 ? (
              <div className="mt-4 px-3 text-[11px] text-text-tertiary">
                <div className="font-semibold uppercase tracking-wide">Handoff history</div>
                <ul className="mt-1 space-y-1">
                  {existingDraft.reassignmentHistory.slice(-3).map((r, idx) => (
                    <li key={idx}>
                      {r.from} → {r.to}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-200px)] flex-col">
          <div className="flex-1 px-2 py-4 xl:px-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                  Step {currentStep} of 7
                </div>
                <h2 className="mt-0.5 text-[20px] font-semibold tracking-tight text-text-primary">
                  {WIZARD_STEPS[currentStep - 1].title}
                </h2>
                <p className="mt-1 text-[12.5px] text-text-secondary">
                  {currentStep === 1
                    ? "Who is this tenant and how should we engage them?"
                    : currentStep === 2
                      ? "Where will this tenant's data live?"
                      : currentStep === 3
                        ? "Define enforceable limits. These trigger alerts at 80% and block at 100%."
                        : currentStep === 4
                          ? "Apply protection rules. Industry-recommended template pre-selected."
                          : currentStep === 5
                            ? "Configure security boundaries. Safe defaults pre-applied."
                            : currentStep === 6
                              ? "How will this tenant be invoiced?"
                              : "Verify configuration. Pre-flight checks must pass before deploy."}
                </p>
              </div>
              <span className="hidden items-center gap-1.5 text-[11.5px] text-text-tertiary md:inline-flex">
                <Loader2 className={cn("h-3 w-3", saving ? "animate-spin" : "opacity-0")} />
                {saving ? "Saving…" : "Drafts auto-save every 2s"}
              </span>
            </div>

            <div className="pb-24">
              {currentStep === 1 ? (
                <Step1Profile existingTenantNames={existingTenantNames} />
              ) : currentStep === 2 ? (
                <Step2Infra region={region} />
              ) : currentStep === 3 ? (
                <Step3Quotas
                  allocationTB={allocationTB}
                  ratePerTB={
                    (form.getValues("ratePerTB") as number | undefined) ??
                    (tier ? TIER_DEFAULTS[tier].rate : 65)
                  }
                />
              ) : currentStep === 4 ? (
                <Step4Policy industry={industry} tier={tier} />
              ) : currentStep === 5 ? (
                <Step5Isolation tenantName={tenantName} />
              ) : currentStep === 6 ? (
                <Step6Billing
                  tier={tier}
                  resellerName={
                    mockData.resellers.find(
                      (r) => r.id === (form.getValues("resellerId") as string | undefined),
                    )?.name
                  }
                  allocationTB={allocationTB}
                />
              ) : (
                <Step7Review
                  draft={liveDraft}
                  onEdit={(s) => setCurrentStep(s)}
                  preflight={preflight}
                  preflightRunning={preflightRunning}
                  preflightAllPassed={preflightAllPassed}
                  onRunPreflight={runPreFlight}
                  onDeploy={handleDeploy}
                  estimatedSeconds={47}
                />
              )}
            </div>
          </div>

          <WizardFooter
            step={currentStep}
            canGoBack={currentStep > 1}
            canGoNext={currentStep < 7 || preflightAllPassed}
            onBack={handleBack}
            onNext={
              currentStep === 7
                ? preflightAllPassed
                  ? handleDeploy
                  : runPreFlight
                : handleNext
            }
            onSaveDraft={handleSaveDraft}
            onReassign={handleReassign}
            saving={saving}
            nextLabel={
              currentStep === 7
                ? preflightAllPassed
                  ? "Deploy Tenant"
                  : "Run Pre-Flight Checks"
                : undefined
            }
          />
        </div>
      </div>
    </FormProvider>
  );
}

function makeInitialValues(draft?: OnboardingDraft): Partial<WizardValues> {
  if (!draft) {
    return {
      resellerType: "direct",
      isAdditionalSite: false,
      tier: "Gold",
      storageTier: "Capacity",
      storageSoftPct: 80,
      storageHardLimit: "allow-with-notification",
      workloads: 200,
      workloadsHardLimit: "block-new-backups",
      transferOutTB: 10,
      transferOutHardLimit: "allow-with-notification",
      restorePoints: 50_000,
      restorePointsHardLimit: "auto-purge-oldest",
      overrideApprovalRequired: false,
      inheritanceMode: "Locked",
      iam: [{ operatorId: "op_1", role: "Admin" }],
      sendInviteOnDeploy: true,
      mfaMode: "required",
      keySource: "rubrik-managed",
      keyRotationDays: 90,
      annualMinimumCommit: false,
      overagePolicy: "allow-with-notification",
      cadence: "Monthly",
      paymentTerms: "Net 30",
      currency: "USD",
    };
  }
  return {
    tenantName: draft.tenantName,
    legalEntity: draft.legalEntity,
    industry: draft.industry,
    region: draft.region,
    primaryContact: draft.primaryContact,
    contactEmail: draft.contactEmail,
    resellerType: draft.resellerType ?? "direct",
    resellerId: draft.resellerId,
    isAdditionalSite: draft.isAdditionalSite ?? false,
    parentTenantId: draft.parentTenantId,
    tier: draft.tier ?? "Gold",
    clusterId: draft.clusterId,
    storageTier: draft.storageTier ?? "Capacity",
    allocationTB: draft.allocationTB,
    storageTB: draft.quotas?.storageTB ?? draft.allocationTB,
    storageSoftPct: draft.quotas?.storageSoftPct ?? 80,
    storageHardLimit: draft.quotas?.storageHardLimit ?? "allow-with-notification",
    workloads: draft.quotas?.workloads ?? 200,
    workloadsHardLimit: draft.quotas?.workloadsHardLimit ?? "block-new-backups",
    transferOutTB: draft.quotas?.transferOutTB ?? 10,
    transferOutHardLimit: draft.quotas?.transferOutHardLimit ?? "allow-with-notification",
    restorePoints: draft.quotas?.restorePoints ?? 50_000,
    restorePointsHardLimit: draft.quotas?.restorePointsHardLimit ?? "auto-purge-oldest",
    overrideApprovalRequired: draft.quotas?.overrideApprovalRequired ?? false,
    policyTemplateId: draft.policyTemplateId,
    inheritanceMode: draft.inheritanceMode ?? "Locked",
    namespace: draft.isolation?.namespace,
    iam: draft.isolation?.iam ?? [{ operatorId: "op_1", role: "Admin" }],
    tenantAdminEmail: draft.isolation?.tenantAdminEmail ?? draft.contactEmail,
    sendInviteOnDeploy: draft.isolation?.sendInviteOnDeploy ?? true,
    mfaMode: draft.isolation?.mfaMode ?? "required",
    mfaDisabledReason: draft.isolation?.mfaDisabledReason,
    keySource: draft.isolation?.keySource ?? "rubrik-managed",
    keyRotationDays: draft.isolation?.keyRotationDays ?? 90,
    byokKmsEndpoint: draft.isolation?.byokKmsEndpoint,
    contactName: draft.billing?.contactName ?? draft.primaryContact,
    billingEmail: draft.billing?.billingEmail ?? draft.contactEmail,
    poNumber: draft.billing?.poNumber,
    ratePerTB: draft.billing?.ratePerTB,
    rateOverrideReason: draft.billing?.rateOverrideReason,
    capacityCommitTB: draft.billing?.capacityCommitTB ?? draft.allocationTB,
    annualMinimumCommit: draft.billing?.annualMinimumCommit ?? false,
    overagePolicy: draft.billing?.overagePolicy ?? "allow-with-notification",
    cadence: draft.billing?.cadence ?? "Monthly",
    paymentTerms: draft.billing?.paymentTerms ?? "Net 30",
    currency: draft.billing?.currency ?? "USD",
    resellerCommissionPct: draft.billing?.resellerCommissionPct,
    resellerCommissionReason: draft.billing?.resellerCommissionReason,
  };
}

function mergeDraft(
  existing: OnboardingDraft | undefined,
  patch: {
    id: string;
    currentStep: WizardStepNumber;
    values: WizardValues;
    assignedTo: string;
    createdBy: string;
  },
): OnboardingDraft {
  const v = patch.values;
  const now = new Date().toISOString();
  return {
    id: patch.id,
    status: "in-progress",
    currentStep: patch.currentStep,
    tenantName: v.tenantName,
    legalEntity: v.legalEntity,
    industry: v.industry,
    region: v.region,
    primaryContact: v.primaryContact,
    contactEmail: v.contactEmail,
    resellerType: v.resellerType,
    resellerId: v.resellerId,
    isAdditionalSite: v.isAdditionalSite,
    parentTenantId: v.parentTenantId,
    tier: v.tier,
    clusterId: v.clusterId,
    storageTier: v.storageTier,
    allocationTB: v.allocationTB,
    quotas: v.storageTB
      ? {
          storageTB: v.storageTB,
          storageSoftPct: v.storageSoftPct,
          storageHardLimit: v.storageHardLimit,
          workloads: v.workloads,
          workloadsHardLimit: v.workloadsHardLimit,
          transferOutTB: v.transferOutTB,
          transferOutHardLimit: v.transferOutHardLimit,
          restorePoints: v.restorePoints,
          restorePointsHardLimit: v.restorePointsHardLimit,
          overrideApprovalRequired: v.overrideApprovalRequired,
        }
      : undefined,
    policyTemplateId: v.policyTemplateId,
    inheritanceMode: v.inheritanceMode,
    isolation: v.namespace
      ? {
          namespace: v.namespace,
          iam: v.iam,
          tenantAdminEmail: v.tenantAdminEmail,
          sendInviteOnDeploy: v.sendInviteOnDeploy,
          mfaMode: v.mfaMode,
          mfaDisabledReason: v.mfaDisabledReason,
          keySource: v.keySource,
          keyRotationDays: v.keyRotationDays as 30 | 60 | 90,
          byokKmsEndpoint: v.byokKmsEndpoint,
        }
      : undefined,
    billing: v.contactName
      ? {
          contactName: v.contactName,
          billingEmail: v.billingEmail,
          poNumber: v.poNumber,
          ratePerTB: v.ratePerTB,
          rateOverrideReason: v.rateOverrideReason,
          capacityCommitTB: v.capacityCommitTB,
          annualMinimumCommit: v.annualMinimumCommit,
          overagePolicy: v.overagePolicy,
          cadence: v.cadence,
          paymentTerms: v.paymentTerms,
          currency: v.currency,
          resellerCommissionPct: v.resellerCommissionPct,
          resellerCommissionReason: v.resellerCommissionReason,
        }
      : undefined,
    createdAt: existing?.createdAt ?? now,
    createdBy: existing?.createdBy ?? patch.createdBy,
    updatedAt: now,
    updatedBy: currentOperator.name,
    assignedTo: existing?.assignedTo ?? patch.assignedTo,
    reassignmentHistory: existing?.reassignmentHistory ?? [],
  };
}

function initialPreflight(): PreFlightCheck[] {
  return [
    { id: "cluster", title: "Cluster Capacity Available", status: "pending", fixStep: 2 },
    { id: "namespace", title: "Namespace Uniqueness", status: "pending", fixStep: 5 },
    { id: "name", title: "Tenant Name Uniqueness", status: "pending", fixStep: 1 },
    { id: "policy", title: "Policy Template Compatibility", status: "pending", fixStep: 4 },
    { id: "iam", title: "IAM Operator Availability", status: "pending", fixStep: 5 },
    { id: "email", title: "Tenant Admin Email Reachability", status: "pending", fixStep: 5 },
    { id: "network", title: "Network Isolation Rule Conflict", status: "pending", fixStep: 5 },
    { id: "compliance", title: "Compliance Mapping Validation", status: "pending", fixStep: 4 },
  ];
}

function generatePreFlightChecks({
  tenantName,
  industry,
  contactEmail,
  conflictTenant,
}: {
  tenantName?: string;
  industry?: string;
  region?: string;
  contactEmail?: string;
  conflictTenant: string | null;
}): PreFlightCheck[] {
  const ok: Omit<PreFlightCheck, "id" | "title">[] = [
    { status: "pass", detail: "1.2 PB free, 25 TB needed." },
    {
      status: conflictTenant ? "fail" : "pass",
      detail: conflictTenant
        ? `Namespace already exists for tenant '${conflictTenant}'. Regenerate the namespace in Step 5.`
        : "Namespace is unique across the cluster.",
      fixStep: conflictTenant ? 5 : undefined,
    },
    { status: "pass", detail: `'${tenantName ?? "Unnamed"}' is unique.` },
    { status: "pass", detail: `Template compatible with selected tier.` },
    { status: "pass", detail: "All operators active and under allocation cap." },
    { status: "pass", detail: `MX records resolved for ${contactEmail?.split("@")[1] ?? "—"}.` },
    { status: "pass", detail: "No conflict with existing tenant network policies." },
    {
      status: "pass",
      detail: `Industry '${industry ?? "—"}' frameworks covered by selected template.`,
    },
  ];

  return ok.map((o, i) => {
    const base = initialPreflight()[i];
    return { ...base, status: o.status as PreFlightCheck["status"], detail: o.detail, fixStep: o.fixStep ?? base.fixStep };
  });
}
