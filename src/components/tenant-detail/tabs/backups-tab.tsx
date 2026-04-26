"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { WorkloadIcon } from "../workload-icon";
import { JobDetailSheet } from "../job-detail-sheet";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import {
  formatBytes,
  formatDuration,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { JobSession, Tenant } from "@/types";

const STATUS_PILL: Record<JobSession["status"], string> = {
  succeeded: "bg-status-success-subtle text-status-success",
  failed: "bg-status-critical-subtle text-status-critical",
  running: "bg-status-info-subtle text-status-info",
  queued: "bg-secondary text-text-secondary",
  skipped: "bg-secondary text-text-secondary",
};

interface BackupsTabProps {
  tenant: Tenant;
  jobs: JobSession[];
  initialStatusFilter?: JobSession["status"];
  initialJobId?: string;
}

export function BackupsTab({
  tenant,
  jobs,
  initialStatusFilter,
  initialJobId,
}: BackupsTabProps) {
  const retryJob = useConsoleStore((s) => s.retryJob);
  const [statusFilter, setStatusFilter] = useState<string>(
    initialStatusFilter ?? "all",
  );
  const [search, setSearch] = useState("");
  const [activeJobId, setActiveJobId] = useState<string | null>(initialJobId ?? null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (statusFilter !== "all" && j.status !== statusFilter) return false;
      if (q && !j.workloadName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [jobs, statusFilter, search]);

  const [mountedAt] = useState(() => Date.now());
  const stats = useMemo(() => {
    const last24 = jobs.filter(
      (j) => Date.parse(j.startedAt) > mountedAt - 24 * 60 * 60_000,
    );
    const last7d = jobs.filter(
      (j) => Date.parse(j.startedAt) > mountedAt - 7 * 24 * 60 * 60_000,
    );
    const succeeded7d = last7d.filter((j) => j.status === "succeeded").length;
    return {
      last24Count: last24.length,
      succeeded24: last24.filter((j) => j.status === "succeeded").length,
      failed24: last24.filter((j) => j.status === "failed").length,
      running24: last24.filter((j) => j.status === "running").length,
      last7dCount: last7d.length,
      successRate7d:
        last7d.length > 0 ? (succeeded7d / last7d.length) * 100 : 0,
      avgDurationSec:
        last7d.length > 0
          ? last7d.reduce((s, j) => s + j.durationSec, 0) / last7d.length
          : 0,
      totalProtected: last7d.reduce((s, j) => s + j.bytesTransferred, 0),
    };
  }, [jobs, mountedAt]);

  const columns: ColumnDef<JobSession>[] = useMemo(
    () => [
      {
        accessorKey: "startedAt",
        header: "Started",
        cell: ({ row }) => (
          <span
            className="tabular-nums text-text-secondary"
            suppressHydrationWarning
          >
            {formatRelativeTime(row.original.startedAt)}
          </span>
        ),
      },
      {
        accessorKey: "workloadName",
        header: "Workload",
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <WorkloadIcon
              type={row.original.workloadType}
              className="h-3.5 w-3.5 text-text-tertiary"
            />
            <span className="truncate font-medium text-text-primary">
              {row.original.workloadName}
            </span>
          </span>
        ),
      },
      {
        accessorKey: "jobType",
        header: "Type",
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.jobType}</span>
        ),
      },
      {
        accessorKey: "durationSec",
        header: "Duration",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-secondary">
            {row.original.durationSec > 0
              ? formatDuration(row.original.durationSec)
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "bytesTransferred",
        header: "Transferred",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-secondary">
            {row.original.status === "succeeded"
              ? formatBytes(row.original.bytesTransferred)
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "throughputMBps",
        header: "Throughput",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-secondary">
            {row.original.throughputMBps > 0
              ? `${formatNumber(row.original.throughputMBps)} MB/s`
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "border-transparent text-[10px] font-medium uppercase",
              STATUS_PILL[row.original.status],
              row.original.status === "running" && "animate-pulse",
            )}
          >
            {row.original.status}
          </Badge>
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
                <DropdownMenuItem onSelect={() => setActiveJobId(row.original.id)} className="gap-2">
                  View Log
                </DropdownMenuItem>
                {row.original.status === "failed" ? (
                  <DropdownMenuItem
                    onSelect={() => {
                      retryJob(tenant.id, row.original.id, currentOperator.name);
                      toast.success(`Retry queued: ${row.original.workloadName}`);
                    }}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onSelect={() =>
                    toast("Restore from this point", {
                      description: "Restore wizard launches in Phase 1 polish.",
                    })
                  }
                  className="gap-2"
                >
                  Restore From This Point
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        ),
        enableSorting: false,
      },
    ],
    [retryJob, tenant.id],
  );

  const activeJob = jobs.find((j) => j.id === activeJobId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Last 24 hours"
          primary={`${stats.last24Count} jobs run`}
          subtitle={`${stats.succeeded24} succeeded · ${stats.failed24} failed · ${stats.running24} running`}
        />
        <StatTile
          label="Last 7 days"
          primary={`${stats.last7dCount} jobs`}
          subtitle={`${formatPercent(stats.successRate7d)} success rate`}
        />
        <StatTile
          label="Avg duration"
          primary={
            stats.avgDurationSec > 0
              ? formatDuration(Math.round(stats.avgDurationSec))
              : "—"
          }
          subtitle="Across all workload types"
        />
        <StatTile
          label="Protected this week"
          primary={formatBytes(stats.totalProtected)}
          subtitle={`${stats.last7dCount} sessions transferred`}
        />
      </section>

      <div className="rounded-lg border border-border-subtle bg-surface shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle p-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by workload name…"
              className="h-9 pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[150px]" size="sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="succeeded">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-[12px] text-text-tertiary tabular-nums">
            {filtered.length} of {jobs.length} sessions
          </span>
        </div>
        <DataTable<JobSession>
          data={filtered}
          columns={columns}
          onRowClick={(j) => setActiveJobId(j.id)}
        />
      </div>

      <JobDetailSheet
        tenant={tenant}
        job={activeJob}
        open={activeJob !== null}
        onOpenChange={(o) => {
          if (!o) setActiveJobId(null);
        }}
      />
    </div>
  );
}

function StatTile({
  label,
  primary,
  subtitle,
}: {
  label: string;
  primary: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div className="mt-1 text-[20px] font-semibold tabular-nums text-text-primary">
        {primary}
      </div>
      <div className="mt-1 text-[12px] text-text-secondary">{subtitle}</div>
    </div>
  );
}
