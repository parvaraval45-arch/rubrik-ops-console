"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { mockData } from "@/lib/mock-data";
import { INDUSTRIES, REGIONS, TIERS } from "./schemas";
import type { Industry, Tier } from "@/types";

const INDUSTRY_RECOMMENDED_TIER: Record<string, Tier> = {
  Healthcare: "Platinum",
  Financial: "Platinum",
  Aerospace: "Platinum",
  Insurance: "Gold",
  Legal: "Gold",
  Manufacturing: "Gold",
  Technology: "Silver",
  Telecommunications: "Silver",
  Logistics: "Silver",
  Hospitality: "Silver",
  Retail: "Silver",
  Education: "Bronze",
};

const INDUSTRY_COMPLIANCE: Record<string, string[]> = {
  Healthcare: ["HIPAA", "HITECH", "NIST 800-66"],
  Financial: ["SOX", "PCI-DSS", "GLBA"],
  Legal: ["ISO-27001", "Privilege Hold"],
  Education: ["FERPA", "COPPA"],
  Manufacturing: ["NIST 800-171", "CMMC"],
  Technology: ["SOC 2 Type II", "ISO-27001"],
  Aerospace: ["ITAR", "FedRAMP", "NIST 800-171"],
  Insurance: ["NAIC", "SOX"],
  Hospitality: ["PCI-DSS", "GDPR"],
  Telecommunications: ["CPNI", "FCC"],
  Logistics: ["C-TPAT", "ISO-27001"],
  Retail: ["PCI-DSS", "GDPR"],
};

const TIER_DETAILS: Record<Tier, { rpo: string; rto: string; retention: string; immutable: string; sla: string; accent: string }> = {
  Platinum: { rpo: "1h", rto: "4h", retention: "365d", immutable: "Yes", sla: "99.99%", accent: "border-purple-500/30 bg-purple-50" },
  Gold: { rpo: "4h", rto: "8h", retention: "90d", immutable: "Yes", sla: "99.9%", accent: "border-amber-500/30 bg-amber-50" },
  Silver: { rpo: "8h", rto: "24h", retention: "30d", immutable: "No", sla: "99.5%", accent: "border-slate-300 bg-slate-50" },
  Bronze: { rpo: "24h", rto: "48h", retention: "14d", immutable: "No", sla: "99%", accent: "border-orange-500/30 bg-orange-50" },
};

export function Step1Profile({ existingTenantNames }: { existingTenantNames: string[] }) {
  const form = useFormContext();
  const tenantName = form.watch("tenantName") as string | undefined;
  const industry = form.watch("industry") as Industry | undefined;
  const tier = form.watch("tier") as Tier | undefined;
  const resellerType = form.watch("resellerType") as string | undefined;
  const isAdditionalSite = form.watch("isAdditionalSite") as boolean | undefined;
  const parentTenantId = form.watch("parentTenantId") as string | undefined;

  const recommendedTier = industry ? INDUSTRY_RECOMMENDED_TIER[industry] : undefined;
  const compliance = industry ? INDUSTRY_COMPLIANCE[industry] ?? [] : [];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <FormBlock title="Tenant identity">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Tenant Name"
              error={form.formState.errors.tenantName?.message as string | undefined}
            >
              <Input
                {...form.register("tenantName")}
                placeholder="e.g., Mercy General Hospital"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && existingTenantNames.includes(v)) {
                    form.setError("tenantName", {
                      message: "A tenant with this name already exists",
                    });
                  }
                }}
              />
            </Field>
            <Field
              label="Legal Entity"
              error={form.formState.errors.legalEntity?.message as string | undefined}
            >
              <Input
                {...form.register("legalEntity")}
                placeholder={tenantName ? `${tenantName} LLC` : "e.g., Mercy General Hospital, Inc."}
              />
            </Field>
            <Controller
              control={form.control}
              name="industry"
              render={({ field, fieldState }) => (
                <Field label="Industry" error={fieldState.error?.message}>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => (
                        <SelectItem key={i} value={i}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="region"
              render={({ field, fieldState }) => (
                <Field label="Region" error={fieldState.error?.message}>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Field
              label="Primary Contact Name"
              error={form.formState.errors.primaryContact?.message as string | undefined}
            >
              <Input {...form.register("primaryContact")} placeholder="e.g., Karen Mitchell" />
            </Field>
            <Field
              label="Contact Email"
              error={form.formState.errors.contactEmail?.message as string | undefined}
            >
              <Input
                type="email"
                {...form.register("contactEmail")}
                placeholder="e.g., karen.mitchell@mercygeneral.org"
              />
            </Field>
          </div>
        </FormBlock>

        <FormBlock
          title="Reseller relationship"
          description="Direct customers are billed by the MSP. Reseller-managed customers route through a partner."
        >
          <Controller
            control={form.control}
            name="resellerType"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? "direct"}
                onValueChange={field.onChange}
                className="grid grid-cols-1 gap-2 md:grid-cols-2"
              >
                <RadioCard
                  value="direct"
                  label="Direct customer"
                  description="MSP holds the billing relationship."
                  selected={field.value === "direct"}
                />
                <RadioCard
                  value="reseller"
                  label="Under reseller"
                  description="Partner resells; MSP shares commission."
                  selected={field.value === "reseller"}
                />
              </RadioGroup>
            )}
          />
          {resellerType === "reseller" ? (
            <Controller
              control={form.control}
              name="resellerId"
              render={({ field }) => (
                <Field label="Reseller">
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reseller" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockData.resellers.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          ) : null}
        </FormBlock>

        <FormBlock
          title="Site consolidation"
          description="Multi-site customers can be linked under one Company entity for shared billing and quotas."
        >
          <Controller
            control={form.control}
            name="isAdditionalSite"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border border-border-subtle bg-canvas px-3 py-2.5">
                <div>
                  <div className="text-[13px] font-medium text-text-primary">
                    This is an additional site of an existing customer
                  </div>
                  <div className="text-[11.5px] text-text-tertiary">
                    Inherits master billing account and quotas from the parent tenant.
                  </div>
                </div>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
          {isAdditionalSite ? (
            <>
              <Controller
                control={form.control}
                name="parentTenantId"
                render={({ field }) => (
                  <Field label="Parent tenant">
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose parent tenant" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[260px]">
                        {mockData.tenants.slice(0, 25).map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              {parentTenantId ? (
                <div className="rounded-md border border-status-info/30 bg-status-info-subtle px-3 py-2 text-[12px] text-text-primary">
                  Will inherit{" "}
                  <span className="font-semibold">
                    {mockData.tenants.find((t) => t.id === parentTenantId)?.name}
                  </span>
                  &apos;s master billing account.
                </div>
              ) : null}
            </>
          ) : null}
        </FormBlock>

        <FormBlock
          title="Service Tier"
          description="Determines RPO/RTO/retention defaults. Editable later via tenant detail."
        >
          <Controller
            control={form.control}
            name="tier"
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {TIERS.map((t) => {
                  const def = TIER_DETAILS[t];
                  const selected = field.value === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => field.onChange(t)}
                      className={cn(
                        "rounded-lg border p-4 text-left transition-all",
                        selected
                          ? "border-brand-primary bg-brand-primary-subtle"
                          : "border-border-subtle bg-surface hover:border-brand-primary/40",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-text-primary">
                          {t}
                        </span>
                        {recommendedTier === t ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                            <Sparkles className="h-2.5 w-2.5" />
                            Recommended
                          </span>
                        ) : null}
                      </div>
                      <ul className="mt-3 space-y-1 text-[12px] text-text-secondary">
                        <Detail label="RPO" value={def.rpo} />
                        <Detail label="RTO" value={def.rto} />
                        <Detail label="Retention" value={def.retention} />
                        <Detail label="Immutable" value={def.immutable} />
                        <Detail label="SLA" value={def.sla} />
                      </ul>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </FormBlock>
      </div>

      <ContextPanel>
        <ContextSection title="Industry-Recommended Tier">
          {industry && recommendedTier ? (
            <>
              <div className="rounded-md bg-canvas p-3">
                <div className="text-[12px] font-medium text-text-primary">
                  {industry} → <span className="text-brand-primary-hover">{recommendedTier}</span>
                </div>
                <div className="mt-1 text-[11.5px] leading-relaxed text-text-secondary">
                  Based on typical compliance and SLA expectations for{" "}
                  {industry.toLowerCase()} workloads. {tier && tier !== recommendedTier
                    ? "Your selection differs from the recommendation — confirm this is intentional."
                    : ""}
                </div>
              </div>
            </>
          ) : (
            <div className="text-[12px] text-text-tertiary">
              Select an industry to see a tier recommendation.
            </div>
          )}
        </ContextSection>
        {compliance.length > 0 ? (
          <ContextSection title="Common compliance">
            <div className="flex flex-wrap gap-1.5">
              {compliance.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-brand-primary-subtle px-2 py-0.5 text-[11px] font-medium text-brand-primary-hover"
                >
                  {c}
                </span>
              ))}
            </div>
          </ContextSection>
        ) : null}
      </ContextPanel>
    </div>
  );
}

function FormBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface p-5 shadow-card">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-[12px] text-text-secondary">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] font-medium text-text-primary">{label}</Label>
      {children}
      {error ? (
        <span className="text-[11.5px] text-status-critical">{error}</span>
      ) : null}
    </div>
  );
}

function RadioCard({
  value,
  label,
  description,
  selected,
}: {
  value: string;
  label: string;
  description: string;
  selected: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-md border p-3 transition-all",
        selected
          ? "border-brand-primary bg-brand-primary-subtle"
          : "border-border-subtle bg-surface hover:border-brand-primary/40",
      )}
    >
      <RadioGroupItem value={value} className="mt-0.5" />
      <div>
        <div className="text-[13px] font-medium text-text-primary">{label}</div>
        <div className="text-[11.5px] text-text-secondary">{description}</div>
      </div>
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-text-tertiary">{label}</span>
      <span className="font-medium text-text-primary tabular-nums">{value}</span>
    </li>
  );
}

function ContextPanel({ children }: { children: React.ReactNode }) {
  return (
    <aside className="hidden flex-col gap-4 xl:flex">
      <div className="sticky top-0 flex flex-col gap-4">{children}</div>
    </aside>
  );
}

function ContextSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface p-4 shadow-card">
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
        {title}
      </h4>
      {children}
    </section>
  );
}
