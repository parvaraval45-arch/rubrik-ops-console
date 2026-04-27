"use client";

import { useMemo } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useConsoleStore } from "@/lib/store";
import { mockData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { DirectoryFilters } from "@/types";

const STATUSES = ["Active", "Onboarding", "Suspended", "Churned"] as const;
const TIERS = ["Platinum", "Gold", "Silver", "Bronze"] as const;
const INDUSTRIES = [
  "Healthcare",
  "Legal",
  "Financial",
  "Education",
  "Manufacturing",
  "Technology",
  "Retail",
  "Hospitality",
  "Telecommunications",
  "Insurance",
  "Logistics",
  "Aerospace",
];
const REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"];
const SLA_STATUSES = ["In Compliance", "At Risk", "Breached"];
const CAPACITY_STATUSES = ["Healthy", "Approaching Limit", "Over Commit"];

interface FilterBarProps {
  filters: DirectoryFilters;
  onChange: (next: DirectoryFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const tenants = useConsoleStore((s) => s.tenants);
  const counts = useMemo(() => buildCounts(tenants), [tenants]);
  const tags = mockData.tenantTagCatalog;
  const policies = mockData.policies;

  const setMulti = (key: keyof DirectoryFilters, value: string) => {
    const cur = (filters[key] as string[] | undefined) ?? [];
    const next = cur.includes(value)
      ? cur.filter((x) => x !== value)
      : [...cur, value];
    onChange({ ...filters, [key]: next.length === 0 ? undefined : next });
  };

  const clearAll = () => onChange({ search: filters.search });
  const removeChip = (key: keyof DirectoryFilters, value: string) => {
    if (key === "search") {
      onChange({ ...filters, search: undefined });
      return;
    }
    setMulti(key, value);
  };

  const activeChips: Array<{ key: keyof DirectoryFilters; label: string; value: string }> = [];
  (["status", "tier", "industry", "region", "cluster", "policyTemplate", "slaStatus", "capacityStatus", "tags"] as const).forEach((key) => {
    const arr = filters[key] as string[] | undefined;
    if (!arr) return;
    arr.forEach((value) => activeChips.push({ key, label: keyLabel(key), value }));
  });

  const hasFilters = activeChips.length > 0 || filters.search;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
            placeholder="Search by name, namespace, contact, cluster…"
            className="h-9 pl-8 pr-8"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => onChange({ ...filters, search: undefined })}
              className="absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-text-tertiary hover:bg-secondary"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <FilterDropdown
          label="Status"
          options={STATUSES.map((s) => ({ value: s, count: counts.status[s] ?? 0 }))}
          selected={filters.status ?? []}
          onToggle={(v) => setMulti("status", v)}
        />
        <FilterDropdown
          label="Tier"
          options={TIERS.map((s) => ({ value: s, count: counts.tier[s] ?? 0 }))}
          selected={filters.tier ?? []}
          onToggle={(v) => setMulti("tier", v)}
        />
        <FilterDropdown
          label="Industry"
          options={INDUSTRIES.map((s) => ({ value: s, count: counts.industry[s] ?? 0 }))}
          selected={filters.industry ?? []}
          onToggle={(v) => setMulti("industry", v)}
        />
        <FilterDropdown
          label="Region"
          options={REGIONS.map((s) => ({ value: s, count: counts.region[s] ?? 0 }))}
          selected={filters.region ?? []}
          onToggle={(v) => setMulti("region", v)}
        />
        <FilterDropdown
          label="Cluster"
          options={mockData.clusters.map((c) => ({ value: c.id, label: c.name, count: counts.cluster[c.id] ?? 0 }))}
          selected={filters.cluster ?? []}
          onToggle={(v) => setMulti("cluster", v)}
        />
        <FilterDropdown
          label="Policy"
          options={policies.map((p) => ({ value: p.id, label: p.name, count: 0 }))}
          selected={filters.policyTemplate ?? []}
          onToggle={(v) => setMulti("policyTemplate", v)}
        />
        <FilterDropdown
          label="SLA"
          options={SLA_STATUSES.map((s) => ({ value: s }))}
          selected={filters.slaStatus ?? []}
          onToggle={(v) => setMulti("slaStatus", v)}
        />
        <FilterDropdown
          label="Capacity"
          options={CAPACITY_STATUSES.map((s) => ({ value: s }))}
          selected={filters.capacityStatus ?? []}
          onToggle={(v) => setMulti("capacityStatus", v)}
        />
        <FilterDropdown
          label="Tags"
          options={tags.map((t) => ({ value: t.label, count: counts.tag[t.label] ?? 0 }))}
          selected={filters.tags ?? []}
          onToggle={(v) => setMulti("tags", v)}
        />
      </div>

      {hasFilters ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.search ? (
            <Chip label="Search" value={filters.search} onRemove={() => removeChip("search", filters.search!)} />
          ) : null}
          {activeChips.map((chip, i) => (
            <Chip
              key={`${chip.key}-${chip.value}-${i}`}
              label={chip.label}
              value={chip.value}
              onRemove={() => removeChip(chip.key, chip.value)}
            />
          ))}
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-text-tertiary">
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function keyLabel(key: keyof DirectoryFilters): string {
  switch (key) {
    case "status": return "Status";
    case "tier": return "Tier";
    case "industry": return "Industry";
    case "region": return "Region";
    case "cluster": return "Cluster";
    case "policyTemplate": return "Policy";
    case "slaStatus": return "SLA";
    case "capacityStatus": return "Capacity";
    case "tags": return "Tag";
    default: return String(key);
  }
}

function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: Array<{ value: string; label?: string; count?: number }>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const isActive = selected.length > 0;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-1.5 border-border-default text-text-secondary",
            isActive && "border-brand-primary bg-brand-primary-subtle text-brand-primary-hover",
          )}
        >
          {label}
          {isActive ? (
            <Badge
              variant="outline"
              className="h-4 border-transparent bg-brand-primary px-1 text-[10px] font-semibold text-white"
            >
              {selected.length}
            </Badge>
          ) : null}
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-2">
        <ul className="max-h-[260px] overflow-y-auto">
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => onToggle(opt.value)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] hover:bg-secondary"
                >
                  <span className="flex items-center gap-2">
                    <Checkbox checked={checked} />
                    <span className="text-text-primary">{opt.label ?? opt.value}</span>
                  </span>
                  {typeof opt.count === "number" ? (
                    <span className="text-[10.5px] tabular-nums text-text-tertiary">
                      {opt.count}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function Chip({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary-subtle px-2 py-0.5 text-[11px] font-medium text-brand-primary-hover">
      <span className="opacity-80">{label}:</span>
      <span>{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-brand-primary/20"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

function buildCounts(tenants: ReturnType<typeof useConsoleStore.getState>["tenants"]) {
  const status: Record<string, number> = {};
  const tier: Record<string, number> = {};
  const industry: Record<string, number> = {};
  const region: Record<string, number> = {};
  const cluster: Record<string, number> = {};
  const tag: Record<string, number> = {};
  for (const t of tenants) {
    status[t.status] = (status[t.status] ?? 0) + 1;
    tier[t.tier] = (tier[t.tier] ?? 0) + 1;
    industry[t.industry] = (industry[t.industry] ?? 0) + 1;
    region[t.region] = (region[t.region] ?? 0) + 1;
    cluster[t.assignedClusterId] = (cluster[t.assignedClusterId] ?? 0) + 1;
    (t.tags ?? []).forEach((tg) => {
      tag[tg] = (tag[tg] ?? 0) + 1;
    });
  }
  return { status, tier, industry, region, cluster, tag };
}
