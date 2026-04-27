"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConsoleStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ALL_FRAMEWORKS,
  ALL_INDUSTRIES,
  ALL_REGIONS,
} from "./policy-helpers";
import type {
  ComplianceFramework,
  PolicyTemplate,
  PolicyTemplateConfig,
  Region,
} from "@/types";

interface TabConfigurationProps {
  template: PolicyTemplate;
  draft: PolicyTemplate;
  onDraftChange: (draft: PolicyTemplate) => void;
}

export function TabConfiguration({
  template,
  draft,
  onDraftChange,
}: TabConfigurationProps) {
  const assignments = useConsoleStore((s) => s.policyTemplateAssignments);
  const tenants = useConsoleStore((s) => s.tenants);

  const config = draft.versions[draft.versions.length - 1].config;
  const baseConfig = template.versions[template.versions.length - 1].config;

  const breakingChanges = useMemo(() => {
    const issues: string[] = [];
    if (
      config.retentionLongValue < baseConfig.retentionLongValue ||
      (config.retentionLongValue === baseConfig.retentionLongValue &&
        config.retentionLongUnit !== baseConfig.retentionLongUnit)
    ) {
      issues.push(
        `Retention reduced from ${baseConfig.retentionLongValue} ${baseConfig.retentionLongUnit} to ${config.retentionLongValue} ${config.retentionLongUnit}. May cause permanent data loss for affected tenants.`,
      );
    }
    if (config.encryptionAlgorithm !== baseConfig.encryptionAlgorithm) {
      issues.push(
        `Encryption algorithm changed (${baseConfig.encryptionAlgorithm} to ${config.encryptionAlgorithm}). Will trigger full re-encryption on next migration.`,
      );
    }
    if (
      config.immutabilityLockType !== baseConfig.immutabilityLockType &&
      baseConfig.immutabilityLockType === "Compliance"
    ) {
      issues.push(
        "Compliance lock relaxed. Compliance frameworks may require migration audit.",
      );
    }
    return issues;
  }, [config, baseConfig]);

  const affectedTenants = assignments.filter(
    (a) => a.templateId === template.id && a.appliedVersion === template.currentVersion,
  );

  function setConfig(patch: Partial<PolicyTemplateConfig>): void {
    const last = draft.versions[draft.versions.length - 1];
    const newVersions = [
      ...draft.versions.slice(0, -1),
      { ...last, config: { ...last.config, ...patch } },
    ];
    onDraftChange({ ...draft, versions: newVersions });
  }

  function setTemplateField<K extends keyof PolicyTemplate>(
    key: K,
    value: PolicyTemplate[K],
  ): void {
    onDraftChange({ ...draft, [key]: value });
  }

  return (
    <div className="flex flex-col gap-4 pb-32">
      <Section title="Basic Information" defaultOpen>
        <Field label="Template Name">
          <Input
            value={draft.name}
            onChange={(e) => setTemplateField("name", e.target.value)}
            className="h-9 text-[13px]"
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={draft.description}
            onChange={(e) => setTemplateField("description", e.target.value)}
            rows={2}
            className="text-[13px]"
          />
        </Field>
        <Field label="Tags">
          <ChipInput
            values={draft.tags}
            onAdd={(v) => setTemplateField("tags", [...draft.tags, v])}
            onRemove={(v) =>
              setTemplateField("tags", draft.tags.filter((x) => x !== v))
            }
            placeholder="Add tag..."
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Industry alignment">
            <Select
              value={draft.industry}
              onValueChange={(v) => setTemplateField("industry", v as PolicyTemplate["industry"])}
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
          <Field label="Status">
            <Select
              value={draft.status}
              onValueChange={(v) => setTemplateField("status", v as PolicyTemplate["status"])}
            >
              <SelectTrigger className="h-9 text-[13px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Protection Rules" defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <Field label="RPO">
            <NumberWithUnit
              value={config.rpoValue}
              unit={config.rpoUnit}
              units={["minutes", "hours", "days"]}
              onChange={(v, u) =>
                setConfig({ rpoValue: v, rpoUnit: u as PolicyTemplateConfig["rpoUnit"] })
              }
            />
          </Field>
          <Field label="RTO">
            <NumberWithUnit
              value={config.rtoValue}
              unit={config.rtoUnit}
              units={["minutes", "hours", "days"]}
              onChange={(v, u) =>
                setConfig({ rtoValue: v, rtoUnit: u as PolicyTemplateConfig["rtoUnit"] })
              }
            />
          </Field>
        </div>
        <Field label="Backup Frequency">
          <RadioGroup
            value={config.scheduleType}
            onValueChange={(v) =>
              setConfig({ scheduleType: v as PolicyTemplateConfig["scheduleType"] })
            }
            className="flex gap-3 text-[13px]"
          >
            {(["Cron", "Recurring", "Continuous"] as const).map((opt) => (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-1.5 text-text-secondary"
              >
                <RadioGroupItem value={opt} className="h-3.5 w-3.5" />
                {opt}
              </label>
            ))}
          </RadioGroup>
          {config.scheduleType === "Cron" ? (
            <div className="mt-2 flex flex-col gap-1">
              <Input
                value={config.scheduleExpression}
                onChange={(e) => setConfig({ scheduleExpression: e.target.value })}
                className="h-9 font-mono text-[12px]"
                placeholder="0 */1 9-18 * * 1-5"
              />
              <span className="text-[11px] text-text-tertiary">
                Reads as: {config.scheduleHumanLabel}
              </span>
            </div>
          ) : config.scheduleType === "Recurring" ? (
            <div className="mt-2 flex flex-col gap-1.5 rounded-md border border-border-subtle bg-secondary/40 p-2.5 text-[12px] text-text-secondary">
              <div>
                <span className="font-medium text-text-primary">Hourly during business hours:</span>{" "}
                Mon-Fri 8am-6pm
              </div>
              <div>
                <span className="font-medium text-text-primary">Every 4 hours overnight:</span>{" "}
                Mon-Fri 6pm-8am, weekends
              </div>
            </div>
          ) : (
            <div className="mt-2 rounded-md border border-status-info-subtle bg-status-info-subtle p-2.5 text-[12px] text-status-info">
              Continuous data protection: snapshots committed every change, no schedule windows.
            </div>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Retention — short-term">
            <NumberWithUnit
              value={config.retentionShortValue}
              unit={config.retentionShortUnit}
              units={["days", "months", "years"]}
              onChange={(v, u) =>
                setConfig({
                  retentionShortValue: v,
                  retentionShortUnit: u as PolicyTemplateConfig["retentionShortUnit"],
                })
              }
            />
          </Field>
          <Field label="Retention — long-term">
            <NumberWithUnit
              value={config.retentionLongValue}
              unit={config.retentionLongUnit}
              units={["days", "months", "years"]}
              onChange={(v, u) =>
                setConfig({
                  retentionLongValue: v,
                  retentionLongUnit: u as PolicyTemplateConfig["retentionLongUnit"],
                })
              }
            />
          </Field>
        </div>
        <ToggleField
          label="Hard delete after long-term"
          value={config.hardDeleteAfterLongTerm}
          onChange={(v) => setConfig({ hardDeleteAfterLongTerm: v })}
        />
      </Section>

      <Section title="Storage Targets">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary repository">
            <Select
              value={config.primaryRepository}
              onValueChange={(v) => setConfig({ primaryRepository: v })}
            >
              <SelectTrigger className="h-9 text-[13px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "rsc-repo-east-04",
                  "rsc-repo-west-02",
                  "rsc-repo-eu-01",
                  "rsc-repo-govcloud-01",
                ].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Archive tier">
            <Select
              value={config.archiveTier}
              onValueChange={(v) => setConfig({ archiveTier: v })}
            >
              <SelectTrigger className="h-9 text-[13px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["rsc-glacier-tier", "rsc-glacier-fips", "rsc-deep-archive"].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Replication regions">
          <div className="flex flex-wrap gap-2">
            {ALL_REGIONS.map((r) => {
              const checked = config.replicationRegions.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() =>
                    setConfig({
                      replicationRegions: checked
                        ? config.replicationRegions.filter((x) => x !== r)
                        : ([...config.replicationRegions, r] as Region[]),
                    })
                  }
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-[12px] tabular-nums transition-colors",
                    checked
                      ? "border-brand-primary bg-brand-primary-subtle text-brand-primary-hover"
                      : "border-border-subtle bg-surface text-text-secondary hover:bg-secondary",
                  )}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Replication mode">
          <Select
            value={config.replicationMode}
            onValueChange={(v) =>
              setConfig({ replicationMode: v as PolicyTemplateConfig["replicationMode"] })
            }
          >
            <SelectTrigger className="h-9 w-[180px] text-[13px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["Async", "Sync", "On-demand"] as const).map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Section title="Security">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Encryption Algorithm">
            <Select
              value={config.encryptionAlgorithm}
              onValueChange={(v) =>
                setConfig({
                  encryptionAlgorithm: v as PolicyTemplateConfig["encryptionAlgorithm"],
                })
              }
            >
              <SelectTrigger className="h-9 text-[13px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AES-256-GCM">AES-256-GCM (recommended)</SelectItem>
                <SelectItem value="AES-256-CBC">AES-256-CBC (legacy)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Key Management">
            <RadioGroup
              value={config.keyManagement}
              onValueChange={(v) =>
                setConfig({ keyManagement: v as PolicyTemplateConfig["keyManagement"] })
              }
              className="flex gap-3 pt-1.5 text-[13px]"
            >
              <label className="flex cursor-pointer items-center gap-1.5 text-text-secondary">
                <RadioGroupItem value="Rubrik-Managed" className="h-3.5 w-3.5" />
                Rubrik-Managed
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-text-secondary">
                <RadioGroupItem value="BYOK" className="h-3.5 w-3.5" />
                BYOK
              </label>
            </RadioGroup>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Immutability Lock Type">
            <Select
              value={config.immutabilityLockType}
              onValueChange={(v) =>
                setConfig({
                  immutabilityLockType: v as PolicyTemplateConfig["immutabilityLockType"],
                })
              }
            >
              <SelectTrigger className="h-9 text-[13px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compliance">Compliance Lock</SelectItem>
                <SelectItem value="Governance">Governance Lock</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Lock Duration (days)">
            <Input
              type="number"
              value={config.immutabilityLockDays}
              onChange={(e) =>
                setConfig({ immutabilityLockDays: Number(e.target.value) || 0 })
              }
              className="h-9 text-[13px]"
            />
          </Field>
        </div>
        <ToggleField
          label="Allow early unlock with quorum approval"
          value={config.quorumOverride}
          onChange={(v) => setConfig({ quorumOverride: v })}
        />
        <ToggleField
          label="Air-Gap"
          value={config.airGap}
          onChange={(v) => setConfig({ airGap: v })}
        />
        <ToggleField
          label="Cross-tenant Block"
          value={config.crossTenantBlock}
          onChange={(v) => setConfig({ crossTenantBlock: v })}
        />
      </Section>

      <Section title="Compliance Mappings">
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_FRAMEWORKS.map((f) => {
            const checked = config.complianceFrameworks.includes(f.id);
            return (
              <label
                key={f.id}
                className="flex cursor-pointer items-start gap-2 rounded p-1.5 text-[12px] hover:bg-secondary"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() =>
                    setConfig({
                      complianceFrameworks: checked
                        ? config.complianceFrameworks.filter((x) => x !== f.id)
                        : ([...config.complianceFrameworks, f.id] as ComplianceFramework[]),
                    })
                  }
                  className="mt-0.5 h-3.5 w-3.5"
                />
                <span className="text-text-secondary">{f.label}</span>
              </label>
            );
          })}
        </div>
      </Section>

      <Section title="Anomaly Detection">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Sensitivity">
            <Select
              value={config.anomalySensitivity}
              onValueChange={(v) =>
                setConfig({
                  anomalySensitivity: v as PolicyTemplateConfig["anomalySensitivity"],
                })
              }
            >
              <SelectTrigger className="h-9 text-[13px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Mass Deletion (per hour)">
            <Input
              type="number"
              value={config.massDeletionThresholdPerHour}
              onChange={(e) =>
                setConfig({
                  massDeletionThresholdPerHour: Number(e.target.value) || 0,
                })
              }
              className="h-9 text-[13px]"
            />
          </Field>
          <Field label="Encryption Rate Change (%)">
            <Input
              type="number"
              value={config.encryptionRateChangePct}
              onChange={(e) =>
                setConfig({ encryptionRateChangePct: Number(e.target.value) || 0 })
              }
              className="h-9 text-[13px]"
            />
          </Field>
        </div>
        <ToggleField
          label="Auto-quarantine on detection"
          value={config.autoQuarantine}
          onChange={(v) => setConfig({ autoQuarantine: v })}
        />
      </Section>

      <Section title="Notifications">
        <div className="grid grid-cols-3 gap-3">
          <Field label="On Backup Failure">
            <NotifyTargets
              values={config.notifyOnFailure}
              onChange={(next) => setConfig({ notifyOnFailure: next })}
            />
          </Field>
          <Field label="On Policy Drift">
            <NotifyTargets
              values={config.notifyOnDrift}
              onChange={(next) => setConfig({ notifyOnDrift: next })}
            />
          </Field>
          <Field label="On Compliance Violation">
            <NotifyTargets
              values={config.notifyOnComplianceViolation}
              onChange={(next) =>
                setConfig({ notifyOnComplianceViolation: next })
              }
            />
          </Field>
        </div>
        <Field label="Notification channels">
          <div className="flex flex-wrap gap-2">
            {(["email", "slack", "teams", "pagerduty"] as const).map((ch) => {
              const checked = config.notificationChannels.includes(ch);
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() =>
                    setConfig({
                      notificationChannels: checked
                        ? config.notificationChannels.filter((x) => x !== ch)
                        : [...config.notificationChannels, ch],
                    })
                  }
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-[12px] capitalize",
                    checked
                      ? "border-brand-primary bg-brand-primary-subtle text-brand-primary-hover"
                      : "border-border-subtle bg-surface text-text-secondary hover:bg-secondary",
                  )}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </Field>
      </Section>

      <div className="sticky bottom-0 -mx-6 -mb-4 border-t border-border-subtle bg-status-info-subtle px-6 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-status-info text-white">
            <ChevronDown className="h-4 w-4 rotate-180" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-text-primary">
              Change Impact Preview
            </div>
            <div className="mt-0.5 text-[12px] text-text-secondary">
              Saving this version will affect{" "}
              <span className="font-medium tabular-nums text-text-primary">
                {affectedTenants.length}
              </span>{" "}
              tenants currently using v{template.currentVersion}.
            </div>
            {affectedTenants.length > 0 ? (
              <div className="mt-1 line-clamp-2 text-[11.5px] text-text-tertiary">
                {affectedTenants
                  .map((a) => tenants.find((t) => t.id === a.tenantId)?.name)
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            ) : null}
            <div className="mt-1 text-[11px] text-text-tertiary">
              Migration plan: rolling deployment starting with smallest tenant first ·
              Estimated propagation time: 12 minutes · Tenants will receive notification
              email on policy update.
            </div>
            {breakingChanges.length > 0 ? (
              <div className="mt-2 flex flex-col gap-1 rounded-md border border-status-warning bg-status-warning-subtle p-2 text-[12px] text-text-primary">
                <div className="flex items-center gap-1.5 font-medium text-status-warning">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Breaking changes detected
                </div>
                {breakingChanges.map((b, i) => (
                  <div key={i} className="text-[11.5px] text-text-secondary">
                    {b}
                  </div>
                ))}
                <Badge
                  variant="outline"
                  className="mt-1 w-fit border-status-warning bg-white px-1.5 py-0 text-[10px] uppercase tracking-wide text-status-warning"
                >
                  Compliance Re-Validation Required
                </Badge>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md border border-border-subtle bg-surface px-3 py-2 text-left transition-colors hover:bg-secondary">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
          {title}
        </span>
        <ChevronDown className="h-4 w-4 text-text-tertiary transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 flex flex-col gap-3 px-1 pb-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11.5px] font-medium text-text-secondary">{label}</Label>
      {children}
    </div>
  );
}

function NumberWithUnit({
  value,
  unit,
  units,
  onChange,
}: {
  value: number;
  unit: string;
  units: string[];
  onChange: (v: number, u: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0, unit)}
        className="h-9 w-[100px] tabular-nums text-[13px]"
      />
      <Select value={unit} onValueChange={(u) => onChange(value, u)}>
        <SelectTrigger className="h-9 flex-1 text-[13px]" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {units.map((u) => (
            <SelectItem key={u} value={u}>
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] text-text-secondary">
      {label}
      <Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}

function NotifyTargets({
  values,
  onChange,
}: {
  values: PolicyTemplateConfig["notifyOnFailure"];
  onChange: (next: PolicyTemplateConfig["notifyOnFailure"]) => void;
}) {
  const ALL: Array<{
    id: PolicyTemplateConfig["notifyOnFailure"][number];
    label: string;
  }> = [
    { id: "tenant-admin", label: "Tenant admin" },
    { id: "msp-operator", label: "MSP operator" },
    { id: "compliance-team", label: "Compliance team" },
  ];
  return (
    <div className="flex flex-col gap-1">
      {ALL.map((opt) => {
        const checked = values.includes(opt.id);
        return (
          <label
            key={opt.id}
            className="flex cursor-pointer items-center gap-1.5 text-[12px] text-text-secondary"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() =>
                onChange(
                  checked
                    ? values.filter((x) => x !== opt.id)
                    : [...values, opt.id],
                )
              }
              className="h-3.5 w-3.5"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

function ChipInput({
  values,
  onAdd,
  onRemove,
  placeholder,
}: {
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border-subtle bg-surface px-2 py-1.5">
      {values.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="gap-1 border-border-default bg-secondary px-1.5 py-0 text-[11px] text-text-secondary"
        >
          {tag}
          <button
            type="button"
            onClick={() => onRemove(tag)}
            className="text-text-tertiary hover:text-text-primary"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            e.preventDefault();
            onAdd(draft.trim());
            setDraft("");
          }
        }}
        placeholder={placeholder}
        className="min-w-[100px] flex-1 bg-transparent text-[12px] text-text-primary outline-none placeholder:text-text-tertiary"
      />
      {draft.trim() ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px]"
          onClick={() => {
            onAdd(draft.trim());
            setDraft("");
          }}
        >
          Add
        </Button>
      ) : null}
    </div>
  );
}
