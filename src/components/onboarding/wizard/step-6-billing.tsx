"use client";

import { useFormContext, Controller } from "react-hook-form";
import { ContextPanel, ContextSection, Field, FormBlock } from "./form-primitives";
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
import { CURRENCIES, INVOICE_CADENCES, PAYMENT_TERMS } from "./schemas";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Tier } from "@/types";

const TIER_RATES: Record<Tier, number> = {
  Platinum: 85,
  Gold: 65,
  Silver: 50,
  Bronze: 30,
};

export function Step6Billing({
  tier,
  resellerName,
  allocationTB,
}: {
  tier?: Tier;
  resellerName?: string;
  allocationTB?: number;
}) {
  const form = useFormContext();
  const ratePerTB = form.watch("ratePerTB") as number | undefined;
  const capacityCommit = form.watch("capacityCommitTB") as number | undefined;
  const cadence = form.watch("cadence") as string | undefined;
  const resellerCommissionPct = form.watch("resellerCommissionPct") as number | undefined;
  const tierDefault = tier ? TIER_RATES[tier] : 65;
  const overridingRate = ratePerTB !== undefined && ratePerTB !== tierDefault;

  const baseMonthly = (capacityCommit ?? 0) * (ratePerTB ?? 0);
  const commissionAmount = resellerName
    ? Math.round((baseMonthly * (resellerCommissionPct ?? 15)) / 100)
    : 0;
  const netToMsp = baseMonthly - commissionAmount;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <FormBlock title="Billing contact">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={form.control}
              name="contactName"
              render={({ field, fieldState }) => (
                <Field label="Billing contact name" error={fieldState.error?.message}>
                  <Input value={field.value ?? ""} onChange={field.onChange} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="billingEmail"
              render={({ field, fieldState }) => (
                <Field label="Billing email" error={fieldState.error?.message}>
                  <Input type="email" value={field.value ?? ""} onChange={field.onChange} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="poNumber"
              render={({ field }) => (
                <Field label="PO number" required={false}>
                  <Input
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="e.g., PO-2026-04-1432"
                  />
                </Field>
              )}
            />
          </div>
        </FormBlock>

        <FormBlock
          title="Rate card"
          description={`Default for ${tier ?? "—"} tier is ${formatCurrency(tierDefault)}/TB. Override requires a reason.`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={form.control}
              name="ratePerTB"
              render={({ field }) => (
                <Field label="Rate ($/TB)">
                  <Input
                    type="number"
                    min={1}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </Field>
              )}
            />
            {overridingRate ? (
              <Controller
                control={form.control}
                name="rateOverrideReason"
                render={({ field }) => (
                  <Field label="Override reason" hint="Logged on the tenant's audit trail.">
                    <Textarea
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      rows={2}
                    />
                  </Field>
                )}
              />
            ) : null}
          </div>
        </FormBlock>

        <FormBlock title="Capacity commit & overage">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={form.control}
              name="capacityCommitTB"
              render={({ field }) => (
                <Field label="Capacity commit (TB)" hint={`Default = allocation (${allocationTB ?? "—"} TB).`}>
                  <Input
                    type="number"
                    min={1}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="annualMinimumCommit"
              render={({ field }) => (
                <Field label="Annual minimum commit" hint="Locks tenant in for 12 months at this rate.">
                  <div className="flex h-9 items-center justify-between rounded-md border border-border-subtle bg-canvas px-3">
                    <span className="text-[12.5px] text-text-secondary">
                      {field.value ? "Annual commitment" : "Month-to-month"}
                    </span>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </div>
                </Field>
              )}
            />
          </div>
          <Controller
            control={form.control}
            name="overagePolicy"
            render={({ field }) => (
              <Field label="Overage policy">
                <RadioGroup
                  value={field.value ?? "allow-with-notification"}
                  onValueChange={field.onChange}
                  className="grid grid-cols-1 gap-2"
                >
                  {[
                    { v: "block-new-backups", l: "Block new backups when over commit (auto for Bronze)" },
                    { v: "allow-with-notification", l: "Allow with notification (default)" },
                    { v: "allow-with-auto-upgrade", l: "Allow with auto-upgrade to next tier" },
                  ].map((opt) => (
                    <label
                      key={opt.v}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px]",
                        field.value === opt.v
                          ? "border-brand-primary bg-brand-primary-subtle"
                          : "border-border-subtle bg-surface",
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
        </FormBlock>

        <FormBlock title="Invoice configuration">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Controller
              control={form.control}
              name="cadence"
              render={({ field }) => (
                <Field label="Cadence">
                  <Select value={field.value ?? "Monthly"} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_CADENCES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <Field label="Payment terms">
                  <Select value={field.value ?? "Net 30"} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="currency"
              render={({ field }) => (
                <Field label="Currency">
                  <Select value={field.value ?? "USD"} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
        </FormBlock>

        {resellerName ? (
          <FormBlock title="Reseller commission" description={`Reseller: ${resellerName}.`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                control={form.control}
                name="resellerCommissionPct"
                render={({ field }) => (
                  <Field label="Commission (% of MRR)">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={field.value ?? 15}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="resellerCommissionReason"
                render={({ field }) => (
                  <Field label="Override reason" required={false}>
                    <Input
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="e.g., Strategic partnership tier"
                    />
                  </Field>
                )}
              />
            </div>
          </FormBlock>
        ) : null}
      </div>

      <ContextPanel>
        <ContextSection title="Estimated MRR">
          <ul className="space-y-1.5 text-[12px] text-text-secondary">
            <Row label={`Commit (${capacityCommit ?? 0} TB × $${ratePerTB ?? 0})`} value={formatCurrency(baseMonthly)} />
            {resellerName ? (
              <Row
                label={`Reseller commission (${resellerCommissionPct ?? 15}%)`}
                value={`-${formatCurrency(commissionAmount)}`}
              />
            ) : null}
            <li className="border-t border-border-subtle pt-2 text-[13px] font-semibold text-text-primary">
              <div className="flex justify-between">
                <span>Net MRR to MSP</span>
                <span className="tabular-nums">{formatCurrency(netToMsp)}</span>
              </div>
            </li>
          </ul>
        </ContextSection>
        <ContextSection title="12-month projection">
          <div className="text-[12px] text-text-secondary">
            Annual revenue at {cadence?.toLowerCase() ?? "monthly"} cadence:{" "}
            <span className="font-semibold text-text-primary tabular-nums">
              {formatCurrency(netToMsp * 12)}
            </span>
            .
          </div>
        </ContextSection>
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
