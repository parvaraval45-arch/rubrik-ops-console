"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Columns,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/data/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { SavedViewsBar } from "@/components/tenants/saved-views-bar";
import { FilterBar } from "@/components/tenants/filter-bar";
import { BulkActionsBar } from "@/components/tenants/bulk-actions-bar";
import { TenantsTable } from "@/components/tenants/tenants-table";
import { TenantCard } from "@/components/tenants/tenant-card";
import { useConsoleStore } from "@/lib/store";
import { mockData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type {
  DirectoryFilters,
  DirectorySavedView,
  Tenant,
  TenantDirectoryDensity,
  TenantDirectoryView,
} from "@/types";

const ALL_COLUMNS: Array<{ id: string; label: string; default: boolean }> = [
  { id: "status", label: "Status", default: true },
  { id: "workloads", label: "Workloads", default: true },
  { id: "backup", label: "Backup 7d", default: true },
  { id: "capacity", label: "Capacity", default: true },
  { id: "lastBackup", label: "Last Backup", default: true },
  { id: "security", label: "Security Score", default: true },
  { id: "sla", label: "SLA %", default: true },
  { id: "mrr", label: "MRR", default: true },
  { id: "cluster", label: "Cluster", default: false },
  { id: "tags", label: "Tags", default: false },
  { id: "onboarded", label: "Onboarded", default: false },
];

const TIER_RATE = { Platinum: 85, Gold: 65, Silver: 50, Bronze: 30 } as const;

export default function TenantsPage() {
  return (
    <Suspense fallback={null}>
      <TenantsDirectory />
    </Suspense>
  );
}

function TenantsDirectory() {
  const searchParams = useSearchParams();
  const tenants = useConsoleStore((s) => s.tenants);
  const savedViews = useConsoleStore((s) => s.directorySavedViews);

  const initialView = searchParams.get("view") ?? "view_all";
  const initialSearch = searchParams.get("search") ?? "";
  const initialDensity = (searchParams.get("density") as TenantDirectoryDensity) ?? "comfortable";
  const initialMode = (searchParams.get("mode") as TenantDirectoryView) ?? "table";
  const initialPageSize = Number(searchParams.get("pageSize") ?? 25);

  const [activeViewId, setActiveViewId] = useState<string>(initialView);
  const [filters, setFilters] = useState<DirectoryFilters>(() =>
    initialFilters(initialView, initialSearch, savedViews),
  );
  const [density, setDensity] = useState<TenantDirectoryDensity>(initialDensity);
  const [viewMode, setViewMode] = useState<TenantDirectoryView>(initialMode);
  const [pageSize] = useState<number>(initialPageSize);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(ALL_COLUMNS.filter((c) => c.default).map((c) => c.id)),
  );

  // Sync URL on change — only when computed query string differs from current URL.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams();
    if (activeViewId !== "view_all") sp.set("view", activeViewId);
    if (filters.search) sp.set("search", filters.search);
    if (density !== "comfortable") sp.set("density", density);
    if (viewMode !== "table") sp.set("mode", viewMode);
    if (pageSize !== 25) sp.set("pageSize", String(pageSize));
    const qs = sp.toString();
    const next = `/tenants${qs ? `?${qs}` : ""}`;
    const current = window.location.pathname + window.location.search;
    if (current !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [activeViewId, filters.search, density, viewMode, pageSize]);

  // Apply filters
  const filtered = useMemo(() => filterTenants(tenants, filters), [tenants, filters]);
  const selectedTenants = filtered.filter((t) => selected.has(t.id));

  const counts = useMemo(() => {
    const active = tenants.filter((t) => t.status === "Active").length;
    const onboarding = tenants.filter((t) => t.status === "Onboarding").length;
    const churned = tenants.filter((t) => t.status === "Churned").length;
    return { active, onboarding, churned };
  }, [tenants]);

  const countForView = (view: DirectorySavedView) => filterTenants(tenants, view.filters).length;

  const onSelectView = (view: DirectorySavedView) => {
    setActiveViewId(view.id);
    setFilters({ ...view.filters, search: filters.search });
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSelectAll = (ids: string[], v: boolean) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (v) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const toggleColumn = (id: string) => {
    setVisibleColumns((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const lastSyncedLabel = "synced 12s ago";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Customers"
        title="Tenants"
        description={`${tenants.length} organizations · ${counts.active} active · ${counts.onboarding} onboarding · ${counts.churned} churned`}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover">
              <Link href="/onboarding/new">
                <Plus className="h-4 w-4" />
                Onboard New Tenant
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onSelect={() => toast("Import Tenants (CSV)", { description: "CSV import lands in Phase 1 polish." })}>
                  Import Tenants (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast.success("Directory exported", { description: "tenants-directory.csv downloaded." })}>
                  Export Directory
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast("Manage Tags", { description: "Tag manager lands in Phase 1 polish." })}>
                  Manage Tags
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <SavedViewsBar
        activeViewId={activeViewId}
        onSelectView={onSelectView}
        currentFilters={filters}
        countForView={countForView}
      />

      <FilterBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          // Switching to "All Tenants" if a system view's filters were edited
          const sys = savedViews.find((v) => v.id === activeViewId);
          if (sys && JSON.stringify({ ...sys.filters }) !== JSON.stringify({ ...next, search: undefined })) {
            // user has diverged from the saved view — keep the chip active but allow saving
          }
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-y border-border-subtle py-2">
        <div className="flex items-center gap-2 text-[12.5px] text-text-secondary">
          <span className="tabular-nums">
            {filtered.length === tenants.length
              ? `${tenants.length} tenants`
              : `Showing ${filtered.length} of ${tenants.length}`}
          </span>
          {selected.size > 0 ? (
            <>
              <span>·</span>
              <span className="tabular-nums">
                {selected.size} selected
              </span>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-text-tertiary hover:underline"
              >
                Clear
              </button>
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-md border border-border-default bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-[4px] px-2 text-[11.5px] font-medium",
                viewMode === "table"
                  ? "bg-brand-primary-subtle text-brand-primary-hover"
                  : "text-text-secondary hover:bg-secondary",
              )}
              aria-pressed={viewMode === "table"}
            >
              <List className="h-3.5 w-3.5" />
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-[4px] px-2 text-[11.5px] font-medium",
                viewMode === "cards"
                  ? "bg-brand-primary-subtle text-brand-primary-hover"
                  : "text-text-secondary hover:bg-secondary",
              )}
              aria-pressed={viewMode === "cards"}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
          </div>
          <Select value={density} onValueChange={(v) => setDensity(v as TenantDirectoryDensity)}>
            <SelectTrigger className="h-9 w-[140px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Columns className="h-3.5 w-3.5" />
                Columns
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <DropdownMenuLabel className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
                Visible columns
              </DropdownMenuLabel>
              <ul className="mt-1 flex flex-col">
                {ALL_COLUMNS.map((col) => (
                  <li key={col.id}>
                    <button
                      type="button"
                      onClick={() => toggleColumn(col.id)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12.5px] hover:bg-secondary"
                    >
                      <span className="flex items-center gap-2">
                        <Checkbox checked={visibleColumns.has(col.id)} />
                        <span className="text-text-primary">{col.label}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-text-secondary"
            onClick={() => toast.success("Refreshed")}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="text-[11px] tabular-nums">{lastSyncedLabel}</span>
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyForFilters
          hasActiveFilters={hasActiveFilters(filters)}
          activeViewName={savedViews.find((v) => v.id === activeViewId)?.name}
          onClear={() => {
            setFilters({});
            setActiveViewId("view_all");
          }}
        />
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <TenantCard
              key={t.id}
              tenant={t}
              selected={selected.has(t.id)}
              onToggleSelect={() => toggleSelect(t.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border-subtle bg-surface shadow-card">
          <TenantsTable
            tenants={filtered}
            selected={selected}
            onToggleSelect={toggleSelect}
            onSelectAll={onSelectAll}
            visibleColumns={visibleColumns}
            density={density}
            pageSize={pageSize}
          />
        </div>
      )}

      <BulkActionsBar
        selected={selectedTenants}
        onClearSelection={() => setSelected(new Set())}
      />
    </div>
  );
}

function EmptyForFilters({
  hasActiveFilters,
  activeViewName,
  onClear,
}: {
  hasActiveFilters: boolean;
  activeViewName?: string;
  onClear: () => void;
}) {
  if (hasActiveFilters || activeViewName !== "All Tenants") {
    return (
      <EmptyState
        icon={Search}
        title={
          activeViewName && activeViewName !== "All Tenants"
            ? `No tenants in '${activeViewName}' right now`
            : "No tenants match these filters"
        }
        description="Try clearing filters, adjusting your search, or saving the current scope as a new view."
        action={
          <Button variant="outline" onClick={onClear} className="gap-2">
            Clear all filters
          </Button>
        }
      />
    );
  }
  return (
    <EmptyState
      icon={Building2}
      title="No tenants yet"
      description="Onboard your first tenant to start managing data protection."
      action={
        <Button asChild className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover">
          <Link href="/onboarding/new">
            <Plus className="h-4 w-4" />
            Onboard New Tenant
          </Link>
        </Button>
      }
    />
  );
}

function initialFilters(
  viewId: string,
  search: string,
  views: DirectorySavedView[],
): DirectoryFilters {
  const view = views.find((v) => v.id === viewId);
  return { ...(view?.filters ?? {}), search: search || undefined };
}

function filterTenants(tenants: Tenant[], filters: DirectoryFilters): Tenant[] {
  const q = filters.search?.trim().toLowerCase();
  return tenants.filter((t) => {
    if (q) {
      const hay = [
        t.name,
        t.legalEntity,
        t.namespaceId,
        t.primaryContact,
        t.contactEmail,
        t.assignedClusterId,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.status?.length && !filters.status.includes(t.status)) return false;
    if (filters.tier?.length && !filters.tier.includes(t.tier)) return false;
    if (filters.industry?.length && !filters.industry.includes(t.industry)) return false;
    if (filters.region?.length && !filters.region.includes(t.region)) return false;
    if (filters.cluster?.length && !filters.cluster.includes(t.assignedClusterId)) return false;
    if (filters.tags?.length) {
      const has = filters.tags.some((tag) => (t.tags ?? []).includes(tag));
      if (!has) return false;
    }
    if (filters.slaStatus?.length) {
      const cur = slaStatusOf(t);
      if (!filters.slaStatus.includes(cur)) return false;
    }
    if (filters.capacityStatus?.length) {
      const cur = capacityStatusOf(t);
      if (!filters.capacityStatus.includes(cur)) return false;
    }
    if (typeof filters.securityScoreMin === "number" && t.securityScore < filters.securityScoreMin) return false;
    if (typeof filters.securityScoreMax === "number" && t.securityScore > filters.securityScoreMax) return false;
    if (filters.policyTemplate?.length) {
      const policy = t.policyTemplateId ?? mockData.policies[0]?.id;
      if (!policy || !filters.policyTemplate.includes(policy)) return false;
    }
    return true;
  });
}

function slaStatusOf(t: Tenant): string {
  const target = { Platinum: 99.9, Gold: 99.0, Silver: 97.5, Bronze: 95.0 }[t.tier];
  if (t.slaCompliance < target - 1) return "Breached";
  if (t.slaCompliance < target) return "At Risk";
  return "In Compliance";
}

function capacityStatusOf(t: Tenant): string {
  if (!t.capacityCommittedTB) return "Healthy";
  const util = t.capacityUsedTB / t.capacityCommittedTB;
  if (util > 1) return "Over Commit";
  if (util >= 0.8) return "Approaching Limit";
  return "Healthy";
}

function hasActiveFilters(filters: DirectoryFilters): boolean {
  return Boolean(
    filters.search ||
      filters.status?.length ||
      filters.tier?.length ||
      filters.industry?.length ||
      filters.region?.length ||
      filters.cluster?.length ||
      filters.tags?.length ||
      filters.slaStatus?.length ||
      filters.capacityStatus?.length ||
      filters.policyTemplate?.length,
  );
}

void TIER_RATE;
