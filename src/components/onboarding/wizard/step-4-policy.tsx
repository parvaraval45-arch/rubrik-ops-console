"use client";

import { useFormContext, Controller } from "react-hook-form";
import { AlertTriangle, Sparkles } from "lucide-react";
import { ContextPanel, ContextSection, FormBlock } from "./form-primitives";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { mockData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Industry, Tier } from "@/types";

const POLICY_TEMPLATES: Array<{
  id: string;
  name: string;
  version: number;
  description: string;
  compliance: string[];
  forIndustries: Industry[];
}> = [
  {
    id: "pol_0",
    name: "Healthcare HIPAA Gold v4",
    version: 4,
    description: "PHI workloads, 1h RPO, 7-year retention, immutable, AES-256-GCM.",
    compliance: ["HIPAA", "NIST 800-66", "ISO-27001"],
    forIndustries: ["Healthcare"],
  },
  {
    id: "pol_1",
    name: "Financial SOX Standard v6",
    version: 6,
    description: "OLTP and ledger systems, 15-min RPO, immutable, dual-region.",
    compliance: ["SOX", "PCI-DSS", "GLBA"],
    forIndustries: ["Financial"],
  },
  {
    id: "pol_2",
    name: "Legal Document Retention v2",
    version: 2,
    description: "Privilege hold, 10-year retention, ISO-27001 aligned.",
    compliance: ["ISO-27001", "Privilege Hold"],
    forIndustries: ["Legal"],
  },
  {
    id: "pol_3",
    name: "PCI-DSS Cardholder Data v8",
    version: 8,
    description: "Cardholder data, immutable, dual-region, audited.",
    compliance: ["PCI-DSS"],
    forIndustries: ["Retail", "Hospitality"],
  },
  {
    id: "pol_4",
    name: "General Enterprise Silver v3",
    version: 3,
    description: "Standard daily snapshots, 30-day retention, business-hours.",
    compliance: ["SOC 2 Type II"],
    forIndustries: ["Technology", "Telecommunications"],
  },
  {
    id: "pol_5",
    name: "Education FERPA Compliance v1",
    version: 1,
    description: "Student records, 7-year retention, immutable.",
    compliance: ["FERPA", "COPPA"],
    forIndustries: ["Education"],
  },
  {
    id: "pol_6",
    name: "Manufacturing OT/ICS Bronze v2",
    version: 2,
    description: "Industrial control systems, low-bandwidth nightly snapshots.",
    compliance: ["NIST 800-171", "CMMC"],
    forIndustries: ["Manufacturing", "Logistics"],
  },
  {
    id: "pol_7",
    name: "Government FedRAMP High v5",
    version: 5,
    description: "FedRAMP High, dedicated key, immutable, air-gapped vault.",
    compliance: ["FedRAMP", "NIST 800-171", "ITAR"],
    forIndustries: ["Aerospace"],
  },
];

const TIER_RPO: Record<Tier, string> = {
  Platinum: "1h",
  Gold: "4h",
  Silver: "8h",
  Bronze: "24h",
};
const TIER_RTO: Record<Tier, string> = {
  Platinum: "4h",
  Gold: "8h",
  Silver: "24h",
  Bronze: "48h",
};
const TIER_RETENTION: Record<Tier, string> = {
  Platinum: "365d / 7y compliance lock",
  Gold: "90d / 7y compliance lock",
  Silver: "30d",
  Bronze: "14d",
};

export function Step4Policy({ industry, tier }: { industry?: Industry; tier?: Tier }) {
  const form = useFormContext();
  const policyTemplateId = form.watch("policyTemplateId") as string | undefined;
  const inheritanceMode = form.watch("inheritanceMode") as string | undefined;

  const recommended = industry
    ? POLICY_TEMPLATES.find((t) => t.forIndustries.includes(industry))
    : undefined;
  const selected = POLICY_TEMPLATES.find((t) => t.id === policyTemplateId);

  const industryCompliance = industry
    ? {
        Healthcare: ["HIPAA"],
        Financial: ["SOX"],
        Legal: ["ISO-27001"],
        Education: ["FERPA"],
        Aerospace: ["FedRAMP"],
      }[industry as string]
    : undefined;

  const complianceMismatch =
    industryCompliance && selected
      ? industryCompliance.some((c) => !selected.compliance.includes(c))
      : false;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <FormBlock
          title="Policy template"
          description="Industry-recommended template is highlighted. You can choose any."
        >
          <Controller
            control={form.control}
            name="policyTemplateId"
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {POLICY_TEMPLATES.map((tpl) => {
                  const isSelected = field.value === tpl.id;
                  const isRecommended = recommended?.id === tpl.id;
                  const usingCount = mockData.policies.find((p) => p.id === tpl.id)?.appliedTenants.length ?? 0;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => field.onChange(tpl.id)}
                      className={cn(
                        "rounded-lg border p-4 text-left transition-all",
                        isSelected
                          ? "border-brand-primary bg-brand-primary-subtle"
                          : "border-border-subtle bg-surface hover:border-brand-primary/40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[13px] font-semibold text-text-primary">
                            {tpl.name}
                          </div>
                          <div className="mt-1 text-[11.5px] text-text-tertiary">
                            {usingCount} tenants currently using
                          </div>
                        </div>
                        {isRecommended ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                            <Sparkles className="h-2.5 w-2.5" />
                            Recommended
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-[12px] text-text-secondary">
                        {tpl.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {tpl.compliance.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-text-secondary"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </FormBlock>

        <FormBlock title="Inheritance mode" description="Controls whether per-tenant overrides may diverge from template values.">
          <Controller
            control={form.control}
            name="inheritanceMode"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? "Locked"}
                onValueChange={field.onChange}
                className="grid grid-cols-1 gap-3 md:grid-cols-2"
              >
                {[
                  { v: "Locked", t: "Locked", d: "No per-tenant overrides allowed. Most secure. Default for Platinum/Gold." },
                  { v: "Override Allowed", t: "Override Allowed", d: "Overrides tracked with diff. Default for Silver/Bronze." },
                ].map((opt) => {
                  const sel = field.value === opt.v;
                  return (
                    <label
                      key={opt.v}
                      className={cn(
                        "flex flex-col gap-2 rounded-md border p-3 transition-all",
                        sel
                          ? "border-brand-primary bg-brand-primary-subtle"
                          : "border-border-subtle bg-surface hover:border-brand-primary/40",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-text-primary">
                          {opt.t}
                        </span>
                        <RadioGroupItem value={opt.v} />
                      </div>
                      <span className="text-[11.5px] text-text-secondary">{opt.d}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            )}
          />
        </FormBlock>
      </div>

      <ContextPanel>
        <ContextSection title="Template preview">
          {selected ? (
            <ul className="space-y-1.5 text-[12px] text-text-secondary">
              <Row label="RPO" value={tier ? TIER_RPO[tier] : "—"} />
              <Row label="RTO" value={tier ? TIER_RTO[tier] : "—"} />
              <Row label="Retention" value={tier ? TIER_RETENTION[tier] : "—"} />
              <Row label="Encryption" value="AES-256-GCM" />
              <Row label="Immutability" value="90-day compliance lock" />
              <Row label="Replication" value="us-east-1 → us-west-2" />
              <Row label="Inheritance" value={inheritanceMode ?? "—"} />
            </ul>
          ) : (
            <div className="text-[12px] text-text-tertiary">
              Select a template to preview computed values.
            </div>
          )}
        </ContextSection>
        {selected ? (
          <ContextSection title="Compliance frameworks">
            <div className="flex flex-wrap gap-1.5">
              {selected.compliance.map((c) => (
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
        {complianceMismatch ? (
          <ContextSection title="Compliance check">
            <div className="flex items-start gap-2 rounded-md border border-status-warning/40 bg-status-warning-subtle p-2 text-[12px] text-text-primary">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-warning" />
              <span>
                Selected industry is {industry} but template doesn&apos;t cover{" "}
                {industryCompliance?.join(", ")}. Consider a more specific template.
              </span>
            </div>
          </ContextSection>
        ) : null}
      </ContextPanel>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between border-b border-border-subtle pb-1 last:border-0 last:pb-0">
      <span className="text-text-tertiary">{label}</span>
      <span className="font-medium text-text-primary tabular-nums">{value}</span>
    </li>
  );
}
