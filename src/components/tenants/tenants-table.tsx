"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  CheckCircle2,
  FileDown,
  Flag,
  KeyRound,
  Loader2,
  MoreHorizontal,
  PauseCircle,
  PencilLine,
  PlayCircle,
  Repeat,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/components/data/data-table";
import { Sparkline } from "@/components/data/sparkline";
import { StatusDot } from "@/components/data/status-dot";
import { mockData } from "@/lib/mock-data";
import {
  formatCurrency,
  formatPercent,
  formatRelativeTime,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Tenant, TenantDirectoryDensity, Tier } from "@/types";

const TIER_BADGE: Record<Tier, string> = {
  Platinum: "bg-slate-900 text-white",
  Gold: "bg-amber-100 text-amber-900",
  Silver: "bg-slate-200 text-slate-700",
  Bronze: "bg-orange-100 text-orange-900",
};

const STATUS_TONE: Record<Tenant["status"], "success" | "info" | "warning" | "critical"> = {
  Active: "success",
  Onboarding: "info",
  Suspended: "warning",
  Churned: "critical",
};

const TIER_RATE: Record<Tier, number> = {
  Platinum: 85,
  Gold: 65,
  Silver: 50,
  Bronze: 30,
};

const SLA_TARGET: Record<Tier, number> = {
  Platinum: 99.9,
  Gold: 99.0,
  Silver: 97.5,
  Bronze: 95.0,
};

interface TenantsTableProps {
  tenants: Tenant[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[], selected: boolean) => void;
  visibleColumns: Set<string>;
  density: TenantDirectoryDensity;
  pageSize: number;
}

export function TenantsTable({
  tenants,
  selected,
  onToggleSelect,
  onSelectAll,
  visibleColumns,
  density,
  pageSize,
}: TenantsTableProps) {
  const router = useRouter();

  const allSelected = tenants.length > 0 && tenants.every((t) => selected.has(t.id));

  const columns: ColumnDef<Tenant>[] = useMemo(() => {
    const all: Array<{ id: string; def: ColumnDef<Tenant> }> = [
      {
        id: "select",
        def: {
          id: "select",
          size: 36,
          header: () => (
            <Checkbox
              checked={allSelected}
              onCheckedChange={(v) => onSelectAll(tenants.map((t) => t.id), v === true)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <span data-stop-row-click="true">
              <Checkbox
                checked={selected.has(row.original.id)}
                onCheckedChange={() => onToggleSelect(row.original.id)}
                aria-label={`Select ${row.original.name}`}
              />
            </span>
          ),
          enableSorting: false,
        },
      },
      {
        id: "tenant",
        def: {
          accessorKey: "name",
          header: "Tenant",
          cell: ({ row }) => (
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className={cn(
                      "text-[11px] font-semibold",
                      avatarTone(row.original.id),
                    )}
                  >
                    {initials(row.original.name)}
                  </AvatarFallback>
                </Avatar>
                {atRisk(row.original) ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-status-critical ring-2 ring-surface"
                    aria-hidden
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-medium text-text-primary">{row.original.name}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent text-[9.5px] font-semibold uppercase",
                      TIER_BADGE[row.original.tier],
                    )}
                  >
                    {row.original.tier}
                  </Badge>
                </div>
                <span className="text-[11px] text-text-tertiary">{row.original.industry}</span>
              </div>
            </div>
          ),
        },
      },
      {
        id: "status",
        def: {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => (
            <StatusDot tone={STATUS_TONE[row.original.status]} label={row.original.status} />
          ),
        },
      },
      {
        id: "workloads",
        def: {
          accessorKey: "workloadCount",
          header: "Workloads",
          cell: ({ row }) => (
            <span className="text-right tabular-nums text-text-secondary">
              {row.original.workloadCount}
            </span>
          ),
        },
      },
      {
        id: "backup",
        def: {
          id: "backup",
          accessorFn: (t) =>
            t.backupSuccess7d.reduce((s, n) => s + n, 0) / Math.max(1, t.backupSuccess7d.length),
          header: "Backup 7d",
          cell: ({ row }) => {
            const avg =
              row.original.backupSuccess7d.reduce((s, n) => s + n, 0) /
              Math.max(1, row.original.backupSuccess7d.length);
            const tone =
              avg >= 95
                ? "var(--status-success)"
                : avg >= 85
                  ? "var(--status-warning)"
                  : "var(--status-critical)";
            return (
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "tabular-nums",
                    avg >= 95
                      ? "text-status-success"
                      : avg >= 85
                        ? "text-status-warning"
                        : "text-status-critical",
                  )}
                >
                  {formatPercent(avg, 1)}
                </span>
                <Sparkline
                  values={row.original.backupSuccess7d}
                  width={48}
                  height={20}
                  stroke={tone}
                />
              </div>
            );
          },
        },
      },
      {
        id: "capacity",
        def: {
          id: "capacity",
          accessorFn: (t) =>
            t.capacityCommittedTB > 0 ? (t.capacityUsedTB / t.capacityCommittedTB) * 100 : 0,
          header: "Capacity",
          cell: ({ row }) => {
            const util = row.original.capacityCommittedTB > 0
              ? (row.original.capacityUsedTB / row.original.capacityCommittedTB) * 100
              : 0;
            return (
              <div className="flex flex-col gap-1">
                <span
                  className={cn(
                    "text-[12px] tabular-nums",
                    util >= 100
                      ? "text-status-critical font-medium"
                      : util >= 95
                        ? "text-status-warning"
                        : "text-text-secondary",
                  )}
                >
                  {row.original.capacityUsedTB.toFixed(1)} / {row.original.capacityCommittedTB.toFixed(1)} TB
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-20 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full",
                        util >= 100
                          ? "bg-status-critical"
                          : util >= 95
                            ? "bg-status-warning"
                            : util >= 80
                              ? "bg-status-warning"
                              : "bg-brand-primary",
                      )}
                      style={{ width: `${Math.min(100, util)}%` }}
                    />
                  </div>
                  <span className="text-[10.5px] tabular-nums text-text-tertiary">
                    {formatPercent(util, 0)}
                  </span>
                  {util >= 100 ? (
                    <AlertCircle className="h-3 w-3 text-status-critical" />
                  ) : null}
                </div>
              </div>
            );
          },
        },
      },
      {
        id: "lastBackup",
        def: {
          accessorKey: "lastBackupAt",
          header: "Last Backup",
          cell: ({ row }) => (
            <span className="flex items-center gap-1.5 text-[12px] text-text-secondary">
              <CheckCircle2 className="h-3 w-3 text-status-success" />
              <span suppressHydrationWarning>{formatRelativeTime(row.original.lastBackupAt)}</span>
            </span>
          ),
        },
      },
      {
        id: "security",
        def: {
          accessorKey: "securityScore",
          header: "Security",
          cell: ({ row }) => (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "tabular-nums",
                  row.original.securityScore >= 85
                    ? "text-status-success"
                    : row.original.securityScore >= 70
                      ? "text-status-warning"
                      : "text-status-critical",
                )}
              >
                {row.original.securityScore}
              </span>
              <div className="h-1 w-12 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full",
                    row.original.securityScore >= 85
                      ? "bg-status-success"
                      : row.original.securityScore >= 70
                        ? "bg-status-warning"
                        : "bg-status-critical",
                  )}
                  style={{ width: `${row.original.securityScore}%` }}
                />
              </div>
            </div>
          ),
        },
      },
      {
        id: "sla",
        def: {
          accessorKey: "slaCompliance",
          header: "SLA",
          cell: ({ row }) => {
            const target = SLA_TARGET[row.original.tier];
            return (
              <TooltipProvider delayDuration={120}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "tabular-nums",
                        row.original.slaCompliance >= target
                          ? "text-status-success"
                          : row.original.slaCompliance >= target - 1
                            ? "text-status-warning"
                            : "text-status-critical",
                      )}
                    >
                      {formatPercent(row.original.slaCompliance, 1)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Target: {formatPercent(target)} ({row.original.tier})
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          },
        },
      },
      {
        id: "mrr",
        def: {
          id: "mrr",
          accessorFn: (t) => t.capacityCommittedTB * TIER_RATE[t.tier],
          header: "MRR",
          cell: ({ row }) => {
            const mrr = row.original.capacityCommittedTB * TIER_RATE[row.original.tier];
            return (
              <span className="text-right tabular-nums text-text-primary">
                {formatCurrency(mrr)}
              </span>
            );
          },
        },
      },
      {
        id: "cluster",
        def: {
          accessorKey: "assignedClusterId",
          header: "Cluster",
          cell: ({ row }) => {
            const c = mockData.clusters.find((x) => x.id === row.original.assignedClusterId);
            return (
              <span className="font-mono text-[11.5px] text-text-secondary">
                {c?.name ?? row.original.assignedClusterId}
              </span>
            );
          },
        },
      },
      {
        id: "tags",
        def: {
          id: "tags",
          header: "Tags",
          cell: ({ row }) => {
            const tags = row.original.tags ?? [];
            return (
              <div className="flex flex-wrap items-center gap-1">
                {tags.slice(0, 2).map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="border-transparent bg-secondary text-[10px] font-medium text-text-secondary"
                  >
                    {t}
                  </Badge>
                ))}
                {tags.length > 2 ? (
                  <span className="text-[10.5px] tabular-nums text-text-tertiary">
                    +{tags.length - 2}
                  </span>
                ) : null}
              </div>
            );
          },
          enableSorting: false,
        },
      },
      {
        id: "onboarded",
        def: {
          accessorKey: "createdAt",
          header: "Onboarded",
          cell: ({ row }) => (
            <span className="text-[11.5px] text-text-tertiary tabular-nums" suppressHydrationWarning>
              {formatRelativeTime(row.original.createdAt)}
            </span>
          ),
        },
      },
      {
        id: "actions",
        def: {
          id: "actions",
          size: 40,
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <span data-stop-row-click="true">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onSelect={() => router.push(`/tenants/${row.original.id}`)}>
                    View Detail
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onSelect={() => toast.success(`Backup queued for ${row.original.name}`)}>
                    <PlayCircle className="h-3.5 w-3.5" />
                    Run Backup Now
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onSelect={() => router.push(`/tenants/${row.original.id}?tab=policies`)}>
                    <PencilLine className="h-3.5 w-3.5" />
                    Edit Policy
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onSelect={() => toast.success(`Attestation queued for ${row.original.name}`)}>
                    <FileDown className="h-3.5 w-3.5" />
                    Generate Attestation Report
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onSelect={() => router.push(`/tenants/${row.original.id}?tab=audit`)}>
                    View Audit Log
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2" onSelect={() => toast(`Pause ${row.original.name}`, { description: "Use Pause Tenant in tenant detail." })}>
                    <PauseCircle className="h-3.5 w-3.5" />
                    Pause Tenant
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onSelect={() => toast(`Reassign Cluster`, { description: `Cluster reassignment for ${row.original.name} requires capacity check.` })}>
                    <Repeat className="h-3.5 w-3.5" />
                    Reassign Cluster
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 text-status-critical focus:bg-status-critical-subtle focus:text-status-critical"
                    onSelect={() =>
                      toast(`Offboard Tenant`, {
                        description: `Tenant offboarding for ${row.original.name} lands in Phase 1 polish.`,
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Offboard Tenant
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          ),
          enableSorting: false,
        },
      },
    ];
    return all
      .filter((c) => c.id === "select" || c.id === "tenant" || c.id === "actions" || visibleColumns.has(c.id))
      .map((c) => c.def);
  }, [allSelected, tenants, selected, onSelectAll, onToggleSelect, router, visibleColumns]);

  return (
    <DataTable<Tenant>
      data={tenants}
      columns={columns}
      pageSize={pageSize as 25 | 50 | 100}
      rowHeight={density === "compact" ? "compact" : "comfortable"}
      onRowClick={(t) => router.push(`/tenants/${t.id}`)}
      rowClassName={(t) =>
        cn(
          t.status === "Suspended" && "opacity-70",
          t.status === "Churned" && "opacity-50",
          selected.has(t.id) && "bg-brand-primary-subtle/30",
        )
      }
      onRowKey={(t) => t.id}
    />
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter((c) => /[A-Za-z]/.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarTone(id: string) {
  // deterministic color from id hash
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  const palette = [
    "bg-brand-primary-subtle text-brand-primary-hover",
    "bg-status-info-subtle text-status-info",
    "bg-status-warning-subtle text-status-warning",
    "bg-secondary text-text-secondary",
  ];
  return palette[Math.abs(h) % palette.length];
}

function atRisk(t: Tenant) {
  return t.securityScore < 70 || t.slaCompliance < 97 || (t.capacityCommittedTB > 0 && t.capacityUsedTB / t.capacityCommittedTB > 1);
}

void Loader2;
void XCircle;
void Flag;
void KeyRound;
