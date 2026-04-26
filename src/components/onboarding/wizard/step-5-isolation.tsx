"use client";

import { useFormContext, Controller } from "react-hook-form";
import { RefreshCw } from "lucide-react";
import { ContextPanel, ContextSection, Field, FormBlock } from "./form-primitives";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { mockData } from "@/lib/mock-data";
import { ROTATION_DAYS, IAM_ROLES } from "./schemas";
import { cn } from "@/lib/utils";
import type { IamAssignment, IamRole, MFAMode } from "@/types";

export function makeNamespace(tenantName?: string) {
  const slug = (tenantName ?? "tenant")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  const hash = Array.from({ length: 4 })
    .map(() => Math.floor(Math.random() * 36).toString(36))
    .join("");
  return `tenant-${slug}-${hash}`;
}

export function Step5Isolation({ tenantName }: { tenantName?: string }) {
  const form = useFormContext();
  const iam = (form.watch("iam") ?? []) as IamAssignment[];
  const mfaMode = form.watch("mfaMode") as MFAMode | undefined;
  const keySource = form.watch("keySource") as string | undefined;
  const namespace = form.watch("namespace") as string | undefined;

  const isolationScore = computeScore({
    mfaMode,
    keySource,
    iam,
  });

  const setIam = (next: IamAssignment[]) => form.setValue("iam", next, { shouldDirty: true, shouldValidate: true });

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <FormBlock
          title="Namespace"
          description="Auto-generated and locked at deploy. Must be unique across the cluster."
        >
          <Controller
            control={form.control}
            name="namespace"
            render={({ field, fieldState }) => (
              <Field error={fieldState.error?.message} label="Namespace">
                <div className="flex gap-2">
                  <Input
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    className="font-mono text-[12.5px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => field.onChange(makeNamespace(tenantName))}
                    className="gap-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                </div>
              </Field>
            )}
          />
        </FormBlock>

        <FormBlock
          title="MSP operators with access"
          description={`Pick at least one operator. Two recommended for redundancy. ${iam.length} assigned.`}
        >
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {mockData.operators.map((op) => {
              const assignment = iam.find((a) => a.operatorId === op.id);
              const checked = !!assignment;
              return (
                <li
                  key={op.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md border p-3",
                    checked ? "border-brand-primary bg-brand-primary-subtle" : "border-border-subtle bg-surface",
                  )}
                >
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-2 text-left"
                    onClick={() => {
                      if (checked) setIam(iam.filter((a) => a.operatorId !== op.id));
                      else setIam([...iam, { operatorId: op.id, role: "Operator" }]);
                    }}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-brand-primary-subtle text-[11px] font-semibold text-brand-primary-hover">
                        {op.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-medium text-text-primary">
                        {op.name}
                      </span>
                      <span className="text-[10.5px] text-text-tertiary">
                        {op.role} · 12 tenants
                      </span>
                    </div>
                  </button>
                  {checked ? (
                    <Select
                      value={assignment.role}
                      onValueChange={(v) =>
                        setIam(iam.map((a) => (a.operatorId === op.id ? { ...a, role: v as IamRole } : a)))
                      }
                    >
                      <SelectTrigger size="sm" className="h-8 w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IAM_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {form.formState.errors.iam ? (
            <span className="text-[11.5px] text-status-critical">
              {String(form.formState.errors.iam.message)}
            </span>
          ) : null}
        </FormBlock>

        <FormBlock title="Tenant admin & MFA">
          <Controller
            control={form.control}
            name="tenantAdminEmail"
            render={({ field, fieldState }) => (
              <Field
                label="Tenant admin email"
                error={fieldState.error?.message}
                hint="Usually matches Step 1 contact email."
              >
                <Input type="email" value={field.value ?? ""} onChange={field.onChange} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="sendInviteOnDeploy"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border border-border-subtle bg-canvas px-3 py-2.5">
                <div>
                  <div className="text-[13px] font-medium text-text-primary">
                    Send Client Portal invite on deploy
                  </div>
                  <div className="text-[11.5px] text-text-tertiary">
                    Recommended. Fires after deploy success.
                  </div>
                </div>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="mfaMode"
            render={({ field }) => (
              <Field label="MFA enforcement">
                <RadioGroup
                  value={field.value ?? "required"}
                  onValueChange={field.onChange}
                  className="grid grid-cols-1 gap-2"
                >
                  {[
                    { v: "required", l: "Required (default, recommended)" },
                    { v: "optional", l: "Optional" },
                    { v: "disabled", l: "Disabled — security exception, requires reason" },
                  ].map((opt) => (
                    <label
                      key={opt.v}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px] transition-all",
                        field.value === opt.v
                          ? "border-brand-primary bg-brand-primary-subtle"
                          : "border-border-subtle bg-surface",
                        opt.v === "disabled" && field.value === opt.v && "border-status-critical bg-status-critical-subtle",
                      )}
                    >
                      <RadioGroupItem value={opt.v} />
                      <span>{opt.l}</span>
                    </label>
                  ))}
                </RadioGroup>
              </Field>
            )}
          />
          {mfaMode === "disabled" ? (
            <Controller
              control={form.control}
              name="mfaDisabledReason"
              render={({ field, fieldState }) => (
                <Field
                  label="Reason for disabling MFA"
                  error={fieldState.error?.message}
                  hint="Logged as security exception."
                >
                  <Textarea
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    rows={3}
                  />
                </Field>
              )}
            />
          ) : null}
        </FormBlock>

        <FormBlock
          title="Network isolation"
          description="Generated rules preview — applied to tenant namespace at deploy."
        >
          <pre className="overflow-x-auto rounded-md border border-border-subtle bg-canvas p-3 font-mono text-[11.5px] leading-relaxed text-text-primary">
{`network_isolation:
  inbound_rules:
    - allow: rubrik-control-plane
      port: 443
      protocol: tcp
  outbound_rules:
    - deny: all_default
    - allow: rsc-repo-east-04
    - allow: rsc-repo-east-05
  envoy_proxy:
    enabled: true
    version: v2.4.7
    cert_rotation: 90_days
  cross_tenant_block:
    enabled: true
    enforcement: hard`}
          </pre>
        </FormBlock>

        <FormBlock title="Encryption key management">
          <Controller
            control={form.control}
            name="keySource"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? "rubrik-managed"}
                onValueChange={field.onChange}
                className="grid grid-cols-1 gap-2 md:grid-cols-2"
              >
                {[
                  { v: "rubrik-managed", t: "Rubrik-Managed (Tenant-Specific)", d: "Default. AES-256 in HSM. Recommended." },
                  { v: "byok", t: "Bring Your Own Key (BYOK)", d: "Customer KMS endpoint required." },
                ].map((opt) => {
                  const sel = field.value === opt.v;
                  return (
                    <label
                      key={opt.v}
                      className={cn(
                        "flex flex-col gap-1 rounded-md border p-3",
                        sel
                          ? "border-brand-primary bg-brand-primary-subtle"
                          : "border-border-subtle bg-surface",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12.5px] font-medium text-text-primary">{opt.t}</span>
                        <RadioGroupItem value={opt.v} />
                      </div>
                      <span className="text-[11.5px] text-text-secondary">{opt.d}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            )}
          />
          {keySource === "byok" ? (
            <Controller
              control={form.control}
              name="byokKmsEndpoint"
              render={({ field, fieldState }) => (
                <Field
                  label="KMS endpoint"
                  error={fieldState.error?.message}
                  hint="e.g., kms.customer.example.com:443"
                >
                  <Input value={field.value ?? ""} onChange={field.onChange} />
                </Field>
              )}
            />
          ) : null}
          <Controller
            control={form.control}
            name="keyRotationDays"
            render={({ field }) => (
              <Field label="Key rotation cadence">
                <Select
                  value={String(field.value ?? 90)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROTATION_DAYS.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        Every {d} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Field label="Algorithm">
            <Input value="AES-256-GCM" readOnly disabled />
          </Field>
        </FormBlock>
      </div>

      <ContextPanel>
        <ContextSection title="Isolation strength">
          <div className="text-[28px] font-semibold tabular-nums text-text-primary">
            {isolationScore} / 100
          </div>
          <p className="mt-1 text-[12px] text-text-secondary">
            Default config = 95. Drops as overrides apply.
          </p>
          <ul className="mt-3 space-y-1 text-[11.5px] text-text-secondary">
            <li>Per-tenant key in HSM (default): +95</li>
            {mfaMode === "optional" ? <li className="text-status-warning">MFA optional: -10</li> : null}
            {mfaMode === "disabled" ? <li className="text-status-critical">MFA disabled: -25</li> : null}
            {keySource === "byok" ? <li className="text-status-warning">BYOK without HSM attestation: -5</li> : null}
            {iam.length === 1 ? <li className="text-status-warning">Single operator: -5</li> : null}
          </ul>
        </ContextSection>
        {namespace ? (
          <ContextSection title="Namespace">
            <code className="block break-all font-mono text-[12px] text-text-primary">
              {namespace}
            </code>
          </ContextSection>
        ) : null}
      </ContextPanel>
    </div>
  );
}

function computeScore({
  mfaMode,
  keySource,
  iam,
}: {
  mfaMode?: MFAMode;
  keySource?: string;
  iam: IamAssignment[];
}) {
  let score = 95;
  if (mfaMode === "optional") score -= 10;
  if (mfaMode === "disabled") score -= 25;
  if (keySource === "byok") score -= 5;
  if (iam.length === 1) score -= 5;
  return Math.max(0, Math.min(100, score));
}
