"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, PlayCircle, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data/data-table";
import { StatusDot } from "@/components/data/status-dot";
import { WorkloadIcon, WORKLOAD_LABEL } from "../workload-icon";
import { WorkloadDetailSheet } from "../workload-detail-sheet";
import { RunBackupDialog } from "../run-backup-dialog";
import { formatRelativeTime, formatTB } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Tenant, Workload, WorkloadStatus, WorkloadType } from "@/types";

interface WorkloadsTabProps {
  tenant: Tenant;
  workloads: Workload[];
  initialTypeFilter?: WorkloadType;
}

const STATUS_TONE: Record<WorkloadStatus, "success" | "warning" | "critical" | "neutral"> = {
  Healthy: "success",
  Warning: "warning",
  Failed: "critical",
  Unprotected: "neutral",
};

export function WorkloadsTab({ tenant, workloads, initialTypeFilter }: WorkloadsTabProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>(initialTypeFilter ?? "all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeWorkloadId, setActiveWorkloadId] = useState<string | null>(null);
  const [runDialogTarget, setRunDialogTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return workloads.filter((w) => {
      if (q && !w.name.toLowerCase().includes(q) && !w.host.toLowerCase().includes(q)) return false;
      if (typeFilter !== "all" && w.type !== typeFilter) return false;
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      return true;
    });
  }, [workloads, search, typeFilter, statusFilter]);

  const allSelectedOnPage =
    filtered.length > 0 && filtered.every((w) => selected.has(w.id));

  const toggleSelect = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns: ColumnDef<Workload>[] = useMemo(
    () => [
      {
        id: "select",
        size: 36,
        header: () => (
          <Checkbox
            checked={allSelectedOnPage}
            onCheckedChange={(v) => {
              if (v) setSelected(new Set(filtered.map((w) => w.id)));
              else setSelected(new Set());
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <span data-stop-row-click="true">
            <Checkbox
              checked={selected.has(row.original.id)}
              onCheckedChange={() => toggleSelect(row.original.id)}
              aria-label={`Select ${row.original.name}`}
            />
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <WorkloadIcon type={row.original.type} className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="truncate font-medium text-text-primary">{row.original.name}</span>
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="text-text-secondary">{WORKLOAD_LABEL[row.original.type]}</span>
        ),
      },
      {
        accessorKey: "host",
        header: "Host",
        cell: ({ row }) => (
          <span className="truncate text-[12px] text-text-tertiary">{row.original.host}</span>
        ),
      },
      {
        accessorKey: "sizeTB",
        header: "Size",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-primary">{formatTB(row.original.sizeTB)}</span>
        ),
      },
      {
        accessorKey: "lastBackupAt",
        header: "Last Backup",
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5 text-[12px] text-text-secondary tabular-nums" suppressHydrationWarning>
            {formatRelativeTime(row.original.lastBackupAt)}
          </span>
        ),
      },
      {
        accessorKey: "nextBackupAt",
        header: "Next Backup",
        cell: ({ row }) => (
          <span className="text-[12px] text-text-tertiary tabular-nums" suppressHydrationWarning>
            {nextBackupRelative(row.original.nextBackupAt)}
          </span>
        ),
      },
      {
        id: "policy",
        header: "Policy",
        cell: () => (
          <Badge
            variant="outline"
            className="border-border-default text-[11px] font-medium text-text-secondary"
          >
            HIPAA Gold v4
          </Badge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusDot tone={STATUS_TONE[row.original.status]} label={row.original.status} />
        ),
      },
      {
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
                <DropdownMenuItem
                  onSelect={() => setRunDialogTarget(row.original.id)}
                  className="gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Run Backup Now
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setActiveWorkloadId(row.original.id);
                  }}
                  className="gap-2"
                >
                  View Restore Points
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    toast("Change Policy", {
                      description: "Policy editor lands in /policies phase.",
                    })
                  }
                  className="gap-2"
                >
                  Change Policy
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    toast("Workload excluded", {
                      description: `${row.original.name} excluded from protection.`,
                    })
                  }
                  className="gap-2 text-status-critical focus:bg-status-critical-subtle focus:text-status-critical"
                >
                  Exclude from Protection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        ),
        enableSorting: false,
      },
    ],
    [allSelectedOnPage, filtered, selected],
  );

  const active = workloads.find((w) => w.id === activeWorkloadId) ?? null;
  const runTarget = workloads.find((w) => w.id === runDialogTarget) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border-subtle bg-surface shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle p-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by workload name, host, type…"
              className="h-9 pl-8"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-[150px]" size="sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(Object.keys(WORKLOAD_LABEL) as WorkloadType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {WORKLOAD_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[150px]" size="sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Healthy">Healthy</SelectItem>
              <SelectItem value="Warning">Warning</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Unprotected">Unprotected</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-[12px] text-text-tertiary tabular-nums">
            Showing {filtered.length} of {workloads.length} workloads
          </span>
        </div>

        {selected.size > 0 ? (
          <div className="flex items-center justify-between border-b border-border-subtle bg-secondary/40 px-4 py-2 text-[12.5px]">
            <span className="font-medium text-text-primary">
              {selected.size} workload{selected.size === 1 ? "" : "s"} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast("Bulk run", {
                    description: `Queued ${selected.size} on-demand backups.`,
                  })
                }
              >
                Run Backup
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast("Change Policy", { description: "Policy editor lands in /policies phase." })}
              >
                Change Policy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast("Excluded", { description: `${selected.size} workloads excluded.` })}
              >
                Exclude
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setSelected(new Set())}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        <DataTable<Workload>
          data={filtered}
          columns={columns}
          onRowClick={(w) => setActiveWorkloadId(w.id)}
          rowClassName={(w) => cn(selected.has(w.id) && "bg-brand-primary-subtle/40")}
        />
      </div>

      <WorkloadDetailSheet
        tenant={tenant}
        workload={active}
        open={active !== null}
        onOpenChange={(o) => {
          if (!o) setActiveWorkloadId(null);
        }}
      />
      <RunBackupDialog
        tenant={tenant}
        workloads={workloads}
        open={runTarget !== null}
        onOpenChange={(o) => {
          if (!o) setRunDialogTarget(null);
        }}
        defaultWorkloadId={runDialogTarget ?? undefined}
      />
    </div>
  );
}

function nextBackupRelative(iso: string) {
  const ms = Date.parse(iso) - Date.now();
  if (ms <= 0) return "due now";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return `in ${hours}h ${rem}m`;
}
