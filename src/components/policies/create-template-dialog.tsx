"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConsoleStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ALL_FRAMEWORKS,
  ALL_INDUSTRIES,
} from "./policy-helpers";
import { currentOperator } from "@/lib/mock-data";
import { toast } from "sonner";
import type {
  ComplianceFramework,
  PolicyTemplateConfig,
  TemplateIndustry,
  WorkloadCoverageType,
} from "@/types";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (templateId: string) => void;
}

type Step = 1 | 2 | 3;

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateTemplateDialogProps) {
  const templates = useConsoleStore((s) => s.policyTemplates);
  const tenants = useConsoleStore((s) => s.tenants);
  const createPolicyTemplate = useConsoleStore((s) => s.createPolicyTemplate);

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState<TemplateIndustry>("General");
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [startMode, setStartMode] = useState<"empty" | "clone">("empty");
  const [cloneFromId, setCloneFromId] = useState<string>(templates[0]?.id ?? "");
  const [applyOnCreate, setApplyOnCreate] = useState(false);
  const [tenantIds, setTenantIds] = useState<string[]>([]);
  const [tenantSearch, setTenantSearch] = useState("");

  const filteredTenants = useMemo(
    () =>
      tenants.filter((t) =>
        t.name.toLowerCase().includes(tenantSearch.toLowerCase()),
      ),
    [tenants, tenantSearch],
  );

  function reset(): void {
    setStep(1);
    setName("");
    setDescription("");
    setIndustry("General");
    setFrameworks([]);
    setStartMode("empty");
    setApplyOnCreate(false);
    setTenantIds([]);
    setTenantSearch("");
  }

  function handleCreate(): void {
    const baseConfig: PolicyTemplateConfig =
      startMode === "clone"
        ? templates.find((t) => t.id === cloneFromId)?.versions.slice(-1)[0].config ??
          defaultConfig()
        : defaultConfig();
    const finalConfig: PolicyTemplateConfig = {
      ...baseConfig,
      complianceFrameworks: frameworks,
    };
    const id = createPolicyTemplate({
      name: name.trim() || "Untitled Template",
      description: description.trim() || `${industry} policy template`,
      industry,
      status: "Draft",
      tags: [industry.toLowerCase()],
      workloadCoverage: ["VM", "SQL"] as WorkloadCoverageType[],
      complianceFrameworks: frameworks,
      createdBy: currentOperator.name,
      initialConfig: finalConfig,
      initialChangeSummary:
        startMode === "clone"
          ? `Cloned from ${templates.find((t) => t.id === cloneFromId)?.name ?? "existing template"}`
          : "Initial template version",
      operatorName: currentOperator.name,
      tenantIdsToAssign: applyOnCreate ? tenantIds : [],
    });
    toast.success("Template created", {
      description: `${name.trim() || "Untitled Template"} added as Draft`,
    });
    reset();
    onOpenChange(false);
    onCreated(id);
  }

  function next(): void {
    if (step < 3) setStep((step + 1) as Step);
  }
  function prev(): void {
    if (step > 1) setStep((step - 1) as Step);
  }

  const canAdvance =
    (step === 1 && name.trim().length >= 2) ||
    step === 2 ||
    step === 3;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="grid h-[680px] max-w-[720px] grid-rows-[auto_1fr_auto] gap-0 p-0 sm:max-w-[720px]">
        <header className="flex flex-col gap-1 border-b border-border-subtle px-6 py-4">
          <DialogTitle className="text-[16px] font-semibold">
            Create Policy Template
          </DialogTitle>
          <DialogDescription className="text-[12px] text-text-secondary">
            Step {step} of 3 —{" "}
            {step === 1
              ? "Template basics"
              : step === 2
                ? "Configuration starting point"
                : "Initial assignments"}
          </DialogDescription>
          <Stepper step={step} />
        </header>

        <div className="overflow-y-auto px-6 py-4">
          {step === 1 ? (
            <div className="flex flex-col gap-3">
              <Field label="Name (required)">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Healthcare HIPAA Gold"
                  className="h-9 text-[13px]"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Plain-language summary of what this template enforces"
                  className="text-[12.5px]"
                />
              </Field>
              <Field label="Industry alignment">
                <Select
                  value={industry}
                  onValueChange={(v) => setIndustry(v as TemplateIndustry)}
                >
                  <SelectTrigger className="h-9 text-[13px]" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Compliance frameworks">
                <div className="grid grid-cols-2 gap-1.5 rounded-md border border-border-subtle bg-secondary/40 p-2.5">
                  {ALL_FRAMEWORKS.map((f) => {
                    const checked = frameworks.includes(f.id);
                    return (
                      <label
                        key={f.id}
                        className="flex cursor-pointer items-center gap-2 rounded p-1.5 text-[12px] hover:bg-surface"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            setFrameworks(
                              checked
                                ? frameworks.filter((x) => x !== f.id)
                                : [...frameworks, f.id],
                            )
                          }
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-text-secondary">{f.id}</span>
                      </label>
                    );
                  })}
                </div>
              </Field>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flex flex-col gap-3">
              <RadioGroup
                value={startMode}
                onValueChange={(v) => setStartMode(v as "empty" | "clone")}
                className="flex flex-col gap-2"
              >
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border-subtle bg-surface p-3 hover:bg-secondary/40">
                  <RadioGroupItem value="empty" className="mt-0.5 h-4 w-4" />
                  <div>
                    <div className="text-[13px] font-medium text-text-primary">
                      Start from blank baseline
                    </div>
                    <div className="text-[12px] text-text-secondary">
                      Industry-aligned safe defaults: 1h RPO, 7y retention, AES-256-GCM,
                      compliance lock 90d.
                    </div>
                  </div>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border-subtle bg-surface p-3 hover:bg-secondary/40">
                  <RadioGroupItem value="clone" className="mt-0.5 h-4 w-4" />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-text-primary">
                      Clone from existing template
                    </div>
                    <div className="text-[12px] text-text-secondary">
                      Inherit all configuration from a published template; can edit before save.
                    </div>
                    {startMode === "clone" ? (
                      <Select value={cloneFromId} onValueChange={setCloneFromId}>
                        <SelectTrigger className="mt-2 h-9 text-[13px]" size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} — v{t.currentVersion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                  </div>
                </label>
              </RadioGroup>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-[13px] text-text-secondary">
                Apply this template to tenants on creation?
                <Checkbox
                  checked={applyOnCreate}
                  onCheckedChange={(v) => setApplyOnCreate(Boolean(v))}
                  className="h-4 w-4"
                />
              </label>
              {applyOnCreate ? (
                <div className="flex flex-col gap-2">
                  <Input
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                    placeholder="Search tenants..."
                    className="h-9 text-[13px]"
                  />
                  <div className="max-h-[260px] overflow-y-auto rounded-md border border-border-subtle bg-surface">
                    {filteredTenants.slice(0, 50).map((t) => {
                      const checked = tenantIds.includes(t.id);
                      return (
                        <label
                          key={t.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 border-b border-border-subtle px-3 py-2 text-[12.5px] last:border-b-0 hover:bg-secondary/40",
                            checked && "bg-brand-primary-subtle",
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() =>
                              setTenantIds(
                                checked
                                  ? tenantIds.filter((x) => x !== t.id)
                                  : [...tenantIds, t.id],
                              )
                            }
                            className="h-3.5 w-3.5"
                          />
                          <span className="font-medium text-text-primary">{t.name}</span>
                          <span className="ml-auto text-[11px] text-text-tertiary">
                            {t.industry} · {t.tier}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="text-[11.5px] text-text-tertiary">
                    {tenantIds.length} selected. Rollout strategy will default to{" "}
                    <span className="font-medium text-text-secondary">canary → staged → fleet</span>.
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border-default bg-secondary/40 p-4 text-center text-[12px] text-text-tertiary">
                  Template will be saved as Draft with no tenant assignments. You can apply
                  it later from the template editor.
                </div>
              )}
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-between border-t border-border-subtle px-6 py-3">
          <Button
            variant="outline"
            size="sm"
            disabled={step === 1}
            onClick={prev}
            className="gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          {step < 3 ? (
            <Button
              size="sm"
              onClick={next}
              disabled={!canAdvance}
              className="gap-1 bg-brand-primary text-white hover:bg-brand-primary-hover"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleCreate}
              className="gap-1 bg-brand-primary text-white hover:bg-brand-primary-hover"
            >
              <Check className="h-3.5 w-3.5" />
              Create Template
            </Button>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] font-medium text-text-secondary">{label}</Label>
      {children}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
              step === n
                ? "bg-brand-primary text-white"
                : step > n
                  ? "bg-status-success text-white"
                  : "bg-secondary text-text-tertiary",
            )}
          >
            {step > n ? <Check className="h-3 w-3" /> : n}
          </div>
          <div
            className={cn(
              "h-1 flex-1 rounded-full",
              step > n ? "bg-status-success" : "bg-secondary",
            )}
          />
        </div>
      ))}
    </div>
  );
}

function defaultConfig(): PolicyTemplateConfig {
  return {
    rpoValue: 1,
    rpoUnit: "hours",
    rtoValue: 4,
    rtoUnit: "hours",
    scheduleType: "Cron",
    scheduleExpression: "0 */1 9-18 * * 1-5",
    scheduleHumanLabel: "Hourly between 9 AM-6 PM, Mon-Fri",
    retentionShortValue: 30,
    retentionShortUnit: "days",
    retentionLongValue: 7,
    retentionLongUnit: "years",
    hardDeleteAfterLongTerm: true,
    primaryRepository: "rsc-repo-east-04",
    archiveTier: "rsc-glacier-tier",
    replicationRegions: ["us-east-1", "us-west-2"],
    replicationMode: "Async",
    encryptionAlgorithm: "AES-256-GCM",
    keyManagement: "Rubrik-Managed",
    keyRotationDays: 90,
    immutabilityLockType: "Compliance",
    immutabilityLockDays: 90,
    quorumOverride: false,
    airGap: true,
    crossTenantBlock: true,
    complianceFrameworks: [],
    attestationCadence: "Quarterly",
    anomalySensitivity: "Medium",
    massDeletionThresholdPerHour: 1000,
    encryptionRateChangePct: 50,
    autoQuarantine: true,
    notifyOnFailure: ["tenant-admin", "msp-operator"],
    notifyOnDrift: ["tenant-admin", "msp-operator"],
    notifyOnComplianceViolation: ["msp-operator", "compliance-team"],
    notificationChannels: ["email", "slack"],
  };
}
