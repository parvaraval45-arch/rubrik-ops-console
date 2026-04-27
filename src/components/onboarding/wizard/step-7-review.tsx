"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, Pencil, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockData } from "@/lib/mock-data";
import { formatCurrency, formatTB } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type {
  OnboardingDraft,
  PreFlightCheck,
  WizardStepNumber,
} from "@/types";

interface Step7Props {
  draft: OnboardingDraft;
  onEdit: (step: WizardStepNumber) => void;
  preflight: PreFlightCheck[];
  preflightRunning: boolean;
  preflightAllPassed: boolean;
  onRunPreflight: () => void;
  onDeploy: () => void;
  estimatedSeconds: number;
}

export function Step7Review({
  draft,
  onEdit,
  preflight,
  preflightRunning,
  preflightAllPassed,
  onRunPreflight,
  onDeploy,
  estimatedSeconds,
}: Step7Props) {
  const cluster = mockData.clusters.find((c) => c.id === draft.clusterId);
  const policy = mockData.policies.find((p) => p.id === draft.policyTemplateId);
  const reseller = draft.resellerId ? mockData.resellers.find((r) => r.id === draft.resellerId) : undefined;

  const sections: Array<{
    step: WizardStepNumber;
    title: string;
    rows: Array<[string, string]>;
  }> = [
    {
      step: 1,
      title: "Customer Profile",
      rows: [
        ["Tenant Name", draft.tenantName ?? "—"],
        ["Legal Entity", draft.legalEntity ?? "—"],
        ["Industry", draft.industry ?? "—"],
        ["Region", draft.region ?? "—"],
        ["Primary Contact", `${draft.primaryContact ?? "—"} <${draft.contactEmail ?? "—"}>`],
        ["Reseller", reseller?.name ?? "Direct customer"],
        ["Tier", draft.tier ?? "—"],
      ],
    },
    {
      step: 2,
      title: "Infrastructure",
      rows: [
        ["Cluster", cluster?.name ?? "—"],
        ["Storage Tier", draft.storageTier ?? "—"],
        ["Allocation", draft.allocationTB ? formatTB(draft.allocationTB) : "—"],
      ],
    },
    {
      step: 3,
      title: "Quotas",
      rows: draft.quotas
        ? [
            ["Storage", `${draft.quotas.storageTB} TB · soft ${draft.quotas.storageSoftPct}%`],
            ["Workloads", draft.quotas.workloads.toString()],
            ["Transfer-out / mo", `${draft.quotas.transferOutTB} TB`],
            ["Restore points", draft.quotas.restorePoints.toLocaleString()],
            ["Override approval", draft.quotas.overrideApprovalRequired ? "Required" : "Not required"],
          ]
        : [["Quotas", "Not configured"]],
    },
    {
      step: 4,
      title: "Policy",
      rows: [
        ["Template", policy?.name ?? draft.policyTemplateId ?? "—"],
        ["Inheritance", draft.inheritanceMode ?? "—"],
      ],
    },
    {
      step: 5,
      title: "Isolation & Access",
      rows: draft.isolation
        ? [
            ["Namespace", draft.isolation.namespace],
            ["Operators", `${draft.isolation.iam.length} assigned`],
            ["Tenant Admin", draft.isolation.tenantAdminEmail],
            ["MFA", draft.isolation.mfaMode],
            ["Encryption Key", draft.isolation.keySource === "byok" ? "BYOK" : "Rubrik-managed"],
            ["Rotation", `Every ${draft.isolation.keyRotationDays} days`],
          ]
        : [["Isolation", "Not configured"]],
    },
    {
      step: 6,
      title: "Billing",
      rows: draft.billing
        ? [
            ["Billing Contact", `${draft.billing.contactName} <${draft.billing.billingEmail}>`],
            ["Rate", `${formatCurrency(draft.billing.ratePerTB)}/TB`],
            ["Capacity Commit", `${draft.billing.capacityCommitTB} TB`],
            ["Cadence", draft.billing.cadence],
            ["Payment Terms", draft.billing.paymentTerms],
            ["Currency", draft.billing.currency],
            ["Annual minimum", draft.billing.annualMinimumCommit ? "Yes" : "No"],
          ]
        : [["Billing", "Not configured"]],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-3">
        {sections.map((s) => (
          <ReviewSection
            key={s.step}
            title={s.title}
            rows={s.rows}
            onEdit={() => onEdit(s.step)}
          />
        ))}
      </div>

      <aside className="flex flex-col gap-4">
        <div className="sticky top-0 flex flex-col gap-4">
          <section className="rounded-lg border border-border-subtle bg-surface p-5 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-[14px] font-semibold text-text-primary">
                  Pre-Flight Validation
                </h3>
                <p className="mt-0.5 text-[12px] text-text-secondary">
                  All 8 checks must pass before deploy.
                </p>
              </div>
              <Button
                onClick={onRunPreflight}
                disabled={preflightRunning}
                className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover"
              >
                {preflightRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {preflightRunning ? "Running…" : "Run Pre-Flight Checks"}
              </Button>
            </div>

            <ol className="mt-4 flex flex-col gap-2">
              {preflight.map((c, i) => (
                <li
                  key={`${c.id}-${i}`}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-2.5 text-[12.5px]",
                    c.status === "fail"
                      ? "border-status-critical/30 bg-status-critical-subtle"
                      : c.status === "running"
                        ? "border-brand-primary/40 bg-brand-primary-subtle"
                        : c.status === "pass"
                          ? "border-status-success/30 bg-status-success-subtle"
                          : "border-border-subtle bg-canvas",
                  )}
                >
                  <span className="mt-0.5">
                    {c.status === "pending" ? (
                      <span className="block h-3.5 w-3.5 rounded-full border border-text-tertiary" />
                    ) : c.status === "running" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" />
                    ) : c.status === "pass" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-status-critical" />
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-text-primary">
                        {i + 1}. {c.title}
                      </span>
                      {c.durationMs ? (
                        <span className="text-[11px] tabular-nums text-text-tertiary">
                          {c.durationMs}ms
                        </span>
                      ) : null}
                    </div>
                    {c.detail ? (
                      <div className="mt-0.5 text-[11.5px] text-text-secondary">
                        {c.detail}
                      </div>
                    ) : null}
                    {c.status === "fail" && c.fixStep ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-6 px-2 text-status-critical hover:bg-status-critical-subtle"
                        onClick={() => onEdit(c.fixStep!)}
                      >
                        Fix in Step {c.fixStep}
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>

            {preflightAllPassed ? (
              <>
                <div className="mt-4 rounded-md border border-status-success/30 bg-status-success-subtle px-3 py-2 text-[12.5px] text-status-success">
                  All pre-flight checks passed. Estimated provisioning time:{" "}
                  <span className="font-semibold tabular-nums">{estimatedSeconds}s</span>
                </div>
                <Button
                  onClick={onDeploy}
                  className="mt-3 w-full bg-brand-primary text-white hover:bg-brand-primary-hover"
                >
                  Deploy Tenant
                </Button>
              </>
            ) : (
              <div className="mt-4 text-[11.5px] text-text-tertiary">
                Deploy is disabled until all checks pass.
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

function ReviewSection({
  title,
  rows,
  onEdit,
}: {
  title: string;
  rows: Array<[string, string]>;
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-text-tertiary" />
          ) : (
            <ChevronRight className="h-4 w-4 text-text-tertiary" />
          )}
          <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="gap-1.5 text-brand-primary-hover"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>
      {open ? (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-2 p-5 text-[12.5px] sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between gap-2 border-b border-border-subtle pb-1.5 last:border-0 last:pb-0">
              <span className="text-text-tertiary">{k}</span>
              <span className="text-right font-medium text-text-primary truncate">{v}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
