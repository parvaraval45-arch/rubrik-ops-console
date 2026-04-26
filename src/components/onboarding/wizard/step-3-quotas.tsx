"use client";

import { useFormContext, Controller } from "react-hook-form";
import { ContextPanel, ContextSection, Field, FormBlock } from "./form-primitives";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { QUOTA_HARD_LIMIT_LABELS } from "./schemas";
import { formatCurrency } from "@/lib/formatters";
import type { QuotaHardLimit } from "@/types";

const STORAGE_HARD_OPTS: QuotaHardLimit[] = [
  "block-new-backups",
  "allow-with-notification",
  "allow-with-auto-upgrade",
];
const WORKLOAD_HARD_OPTS: QuotaHardLimit[] = [
  "block-new-backups",
  "allow-with-notification",
];
const TRANSFER_HARD_OPTS: QuotaHardLimit[] = [
  "block-restore",
  "allow-with-notification",
];
const RP_HARD_OPTS: QuotaHardLimit[] = [
  "auto-purge-oldest",
  "block-new-backups",
  "notify-only",
];

export function Step3Quotas({ allocationTB, ratePerTB }: { allocationTB?: number; ratePerTB: number }) {
  const form = useFormContext();
  const storageTB = form.watch("storageTB") as number | undefined;
  const storageSoftPct = form.watch("storageSoftPct") as number | undefined;

  const projectedMonthlyAtSoft =
    storageTB && storageSoftPct
      ? Math.round(storageTB * (storageSoftPct / 100) * ratePerTB)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <FormBlock
          title="Storage quota"
          description="Hard limit triggers when usage reaches commitment. Soft limit fires alerts at the configured threshold."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={form.control}
              name="storageTB"
              render={({ field }) => (
                <Field label="Capacity (TB)" hint={`Default = allocation (${allocationTB ?? "—"} TB).`}>
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
              name="storageSoftPct"
              render={({ field }) => (
                <Field label={`Soft limit threshold (${field.value ?? 80}%)`}>
                  <input
                    type="range"
                    min={50}
                    max={95}
                    step={5}
                    value={field.value ?? 80}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-brand-primary"
                  />
                </Field>
              )}
            />
          </div>
          <Controller
            control={form.control}
            name="storageHardLimit"
            render={({ field }) => (
              <Field label="Hard limit behavior">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STORAGE_HARD_OPTS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {QUOTA_HARD_LIMIT_LABELS[o]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </FormBlock>

        <FormBlock
          title="Workload count quota"
          description="Caps the number of protected resources for this tenant."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={form.control}
              name="workloads"
              render={({ field }) => (
                <Field label="Workload count">
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
              name="workloadsHardLimit"
              render={({ field }) => (
                <Field label="Hard limit behavior">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKLOAD_HARD_OPTS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {QUOTA_HARD_LIMIT_LABELS[o]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
        </FormBlock>

        <FormBlock title="Transfer-out (per month)" description="Restore + replication egress quota.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={form.control}
              name="transferOutTB"
              render={({ field }) => (
                <Field label="Transfer-out (TB)">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="transferOutHardLimit"
              render={({ field }) => (
                <Field label="Hard limit behavior">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSFER_HARD_OPTS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {QUOTA_HARD_LIMIT_LABELS[o]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
        </FormBlock>

        <FormBlock title="Restore points" description="Maximum number of restore points retained.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={form.control}
              name="restorePoints"
              render={({ field }) => (
                <Field label="Max restore points">
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="restorePointsHardLimit"
              render={({ field }) => (
                <Field label="Hard limit behavior">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RP_HARD_OPTS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {QUOTA_HARD_LIMIT_LABELS[o]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
        </FormBlock>

        <FormBlock title="Override approval" description="Should hard-limit overrides require approval?">
          <Controller
            control={form.control}
            name="overrideApprovalRequired"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border border-border-subtle bg-canvas px-3 py-2.5">
                <div>
                  <div className="text-[13px] font-medium text-text-primary">
                    Require approval for overrides
                  </div>
                  <div className="text-[11.5px] text-text-tertiary">
                    Default ON for Bronze/Silver, OFF for Gold/Platinum.
                  </div>
                </div>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
        </FormBlock>
      </div>

      <ContextPanel>
        <ContextSection title="Quota profile">
          <ul className="space-y-1.5 text-[12px] text-text-secondary">
            <Row label="Storage" value={`${storageTB ?? 0} TB`} />
            <Row label="Workloads" value={`${form.watch("workloads") ?? 0}`} />
            <Row label="Transfer-out / mo" value={`${form.watch("transferOutTB") ?? 0} TB`} />
            <Row label="Restore points" value={`${(form.watch("restorePoints") ?? 0).toLocaleString()}`} />
          </ul>
        </ContextSection>
        <ContextSection title="Cost projection">
          <div className="text-[12px] text-text-secondary">
            At {storageSoftPct ?? 80}% of storage quota and the selected rate, monthly cost will run approximately{" "}
            <span className="font-semibold text-text-primary tabular-nums">
              {formatCurrency(projectedMonthlyAtSoft)}
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
