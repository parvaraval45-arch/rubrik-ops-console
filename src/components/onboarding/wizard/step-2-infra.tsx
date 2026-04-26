"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Cpu, Sparkles } from "lucide-react";
import { ContextPanel, ContextSection, Field, FormBlock } from "./form-primitives";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { mockData } from "@/lib/mock-data";
import { formatCurrency, formatPercent, formatTB } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Region, StorageTier } from "@/types";

const STORAGE_TIER_DEFS: Array<{
  id: StorageTier;
  label: string;
  pricePerTB: number;
  description: string;
}> = [
  {
    id: "Performance",
    label: "Performance",
    pricePerTB: 85,
    description: "NVMe, hot data, fast restore RTO.",
  },
  {
    id: "Capacity",
    label: "Capacity",
    pricePerTB: 50,
    description: "HDD/QLC, warm data, balanced cost.",
  },
  {
    id: "Archive",
    label: "Archive",
    pricePerTB: 15,
    description: "Glacier-class, cold data, long retention.",
  },
];

export function Step2Infra({ region }: { region?: Region }) {
  const form = useFormContext();
  const clusterId = form.watch("clusterId") as string | undefined;
  const storageTier = form.watch("storageTier") as StorageTier | undefined;
  const allocationTB = form.watch("allocationTB") as number | undefined;

  const selectedCluster = mockData.clusters.find((c) => c.id === clusterId);
  const selectedTier = STORAGE_TIER_DEFS.find((t) => t.id === storageTier);

  const recommendedCluster =
    region
      ? [...mockData.clusters]
          .filter((c) => c.region === region)
          .sort((a, b) => a.usedTB / a.capacityTB - b.usedTB / b.capacityTB)[0]
      : undefined;

  const maxAllocation = selectedCluster
    ? Math.max(10, selectedCluster.capacityTB - selectedCluster.usedTB - 50)
    : 200;

  const beforePct = selectedCluster
    ? (selectedCluster.usedTB / selectedCluster.capacityTB) * 100
    : 0;
  const afterPct = selectedCluster && allocationTB
    ? ((selectedCluster.usedTB + allocationTB) / selectedCluster.capacityTB) * 100
    : beforePct;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <FormBlock
          title="Cluster"
          description="Auto-recommended based on selected region and current utilization."
        >
          <Controller
            control={form.control}
            name="clusterId"
            render={({ field, fieldState }) => (
              <>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {mockData.clusters.map((c) => {
                    const util = (c.usedTB / c.capacityTB) * 100;
                    const isSelected = field.value === c.id;
                    const isRecommended =
                      recommendedCluster?.id === c.id && util < 60;
                    const isHigh = util > 90;
                    const utilColor =
                      util > 95
                        ? "bg-status-critical"
                        : util > 80
                          ? "bg-status-warning"
                          : "bg-brand-primary";
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => field.onChange(c.id)}
                        className={cn(
                          "rounded-lg border p-4 text-left transition-all",
                          isSelected
                            ? "border-brand-primary bg-brand-primary-subtle"
                            : "border-border-subtle bg-surface hover:border-brand-primary/40",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-3.5 w-3.5 text-text-tertiary" />
                            <span className="font-mono text-[12.5px] font-semibold text-text-primary">
                              {c.name}
                            </span>
                          </div>
                          {isRecommended ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                              <Sparkles className="h-2.5 w-2.5" />
                              Recommended
                            </span>
                          ) : isHigh ? (
                            <span className="rounded-full bg-status-warning-subtle px-2 py-0.5 text-[10px] font-semibold uppercase text-status-warning">
                              High utilization
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 text-[11.5px] text-text-tertiary">
                          {c.region} · Atlas r6 · NVMe · {c.tenantCount} tenants
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[11.5px]">
                            <span className="text-text-secondary">
                              {formatTB(c.usedTB)} / {formatTB(c.capacityTB)}
                            </span>
                            <span className="tabular-nums text-text-secondary">
                              {formatPercent(util, 1)}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn("h-full rounded-full", utilColor)}
                              style={{ width: `${Math.min(100, util)}%` }}
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-text-tertiary tabular-nums">
                            <span>Available {formatTB(c.capacityTB - c.usedTB)}</span>
                            <span>~12ms latency</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {fieldState.error?.message ? (
                  <span className="text-[11.5px] text-status-critical">
                    {fieldState.error.message}
                  </span>
                ) : null}
              </>
            )}
          />
        </FormBlock>

        <FormBlock
          title="Storage tier"
          description="Determines media class and per-TB cost. Capacity is the default for most production workloads."
        >
          <Controller
            control={form.control}
            name="storageTier"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? "Capacity"}
                onValueChange={field.onChange}
                className="grid grid-cols-1 gap-3 md:grid-cols-3"
              >
                {STORAGE_TIER_DEFS.map((t) => {
                  const selected = field.value === t.id;
                  return (
                    <label
                      key={t.id}
                      className={cn(
                        "flex flex-col gap-2 rounded-lg border p-4 transition-all",
                        selected
                          ? "border-brand-primary bg-brand-primary-subtle"
                          : "border-border-subtle bg-surface hover:border-brand-primary/40",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-text-primary">
                          {t.label}
                        </span>
                        <RadioGroupItem value={t.id} />
                      </div>
                      <span className="text-[11.5px] text-text-secondary">
                        {t.description}
                      </span>
                      <span className="text-[11px] font-medium text-text-tertiary">
                        {formatCurrency(t.pricePerTB)}/TB · month
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            )}
          />
        </FormBlock>

        <FormBlock
          title="Capacity allocation"
          description={`Reserves capacity from the selected cluster. Cluster reserves a 50 TB buffer.`}
        >
          <Controller
            control={form.control}
            name="allocationTB"
            render={({ field, fieldState }) => (
              <Field label="Capacity (TB)" error={fieldState.error?.message}>
                <Input
                  type="number"
                  min={10}
                  max={maxAllocation}
                  step={1}
                  inputMode="numeric"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    field.onChange(Number.isFinite(v) ? v : 10);
                  }}
                />
              </Field>
            )}
          />
          {selectedCluster && allocationTB ? (
            <div className="rounded-md bg-canvas px-3 py-2.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Cluster impact</span>
                <span className="tabular-nums text-text-secondary">
                  {formatPercent(beforePct, 1)} → {formatPercent(afterPct, 1)}
                </span>
              </div>
              <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="absolute inset-y-0 left-0 bg-text-tertiary/60"
                  style={{ width: `${Math.min(100, beforePct)}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-brand-primary"
                  style={{
                    left: `${Math.min(100, beforePct)}%`,
                    width: `${Math.max(0, Math.min(100 - beforePct, afterPct - beforePct))}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </FormBlock>
      </div>

      <ContextPanel>
        <ContextSection title="Recommendation">
          {recommendedCluster && region ? (
            <div className="text-[12px] leading-relaxed text-text-secondary">
              <span className="font-semibold text-text-primary">
                {recommendedCluster.name}
              </span>{" "}
              matches selected region {region}, with{" "}
              <span className="font-semibold tabular-nums">
                {formatPercent(
                  ((recommendedCluster.capacityTB - recommendedCluster.usedTB) /
                    recommendedCluster.capacityTB) *
                    100,
                  0,
                )}{" "}
              </span>{" "}
              capacity available. Similar-industry tenants already on this
              cluster benefit resource pooling efficiency.
            </div>
          ) : (
            <div className="text-[12px] text-text-tertiary">
              Set a region in Step 1 to get a cluster recommendation.
            </div>
          )}
        </ContextSection>
        {selectedTier && allocationTB ? (
          <ContextSection title="Storage cost (est.)">
            <div className="text-[12px] text-text-secondary">
              <div className="flex justify-between">
                <span>Tier rate</span>
                <span className="tabular-nums text-text-primary">
                  {formatCurrency(selectedTier.pricePerTB)}/TB
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Allocation</span>
                <span className="tabular-nums text-text-primary">
                  {allocationTB} TB
                </span>
              </div>
              <div className="mt-2 border-t border-border-subtle pt-2 text-[13px] font-semibold text-text-primary">
                <div className="flex justify-between">
                  <span>Monthly storage</span>
                  <span className="tabular-nums">
                    {formatCurrency(selectedTier.pricePerTB * allocationTB)}
                  </span>
                </div>
              </div>
            </div>
          </ContextSection>
        ) : null}
      </ContextPanel>
    </div>
  );
}
