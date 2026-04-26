"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronRight, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data/data-table";
import { mockData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { DetailedAuditEvent, Tenant } from "@/types";

interface AuditTabProps {
  tenant: Tenant;
  events: DetailedAuditEvent[];
}

const ACTION_TONE: Record<string, string> = {
  "tenant.create": "bg-status-success-subtle text-status-success",
  "tenant.suspend": "bg-status-warning-subtle text-status-warning",
  "tenant.resume": "bg-status-success-subtle text-status-success",
  "tenant.update": "bg-status-info-subtle text-status-info",
  "user.login": "bg-secondary text-text-secondary",
  "policy.apply": "bg-brand-primary-subtle text-brand-primary-hover",
  "policy.override": "bg-status-warning-subtle text-status-warning",
  "policy.reset": "bg-status-info-subtle text-status-info",
  "policy.migrate": "bg-status-info-subtle text-status-info",
  "backup.run": "bg-brand-primary-subtle text-brand-primary-hover",
  "alarm.acknowledge": "bg-status-info-subtle text-status-info",
  "alarm.assign": "bg-status-info-subtle text-status-info",
  "alarm.resolve": "bg-status-success-subtle text-status-success",
  "key.rotate": "bg-status-critical-subtle text-status-critical",
  "report.export": "bg-secondary text-text-secondary",
  "capacity.threshold": "bg-status-warning-subtle text-status-warning",
  "restore.initiate": "bg-status-info-subtle text-status-info",
};

export function AuditTab({ tenant, events }: AuditTabProps) {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [operatorFilter, setOperatorFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const actionTypes = useMemo(
    () => Array.from(new Set(events.map((e) => e.action))).sort(),
    [events],
  );
  const operatorNames = useMemo(
    () => Array.from(new Set(events.map((e) => e.actor))).sort(),
    [events],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      if (operatorFilter !== "all" && e.actor !== operatorFilter) return false;
      if (
        q &&
        !(
          e.action.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [events, actionFilter, operatorFilter, search]);

  const toggleExpand = (id: string) => {
    setExpanded((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns: ColumnDef<DetailedAuditEvent>[] = useMemo(
    () => [
      {
        id: "expand",
        size: 32,
        header: () => <span className="sr-only">Expand</span>,
        cell: ({ row }) => (
          <span data-stop-row-click="true">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-text-tertiary"
              onClick={() => toggleExpand(row.original.id)}
              aria-label="Toggle details"
            >
              {expanded.has(row.original.id) ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </Button>
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "occurredAt",
        header: "Timestamp",
        cell: ({ row }) => (
          <span
            className="font-mono text-[12px] tabular-nums text-text-secondary"
            suppressHydrationWarning
          >
            {format(parseISO(row.original.occurredAt), "yyyy-MM-dd HH:mm:ss 'UTC'")}
          </span>
        ),
      },
      {
        accessorKey: "actor",
        header: "Operator",
        cell: ({ row }) => {
          const op = mockData.operators.find((o) => o.name === row.original.actor);
          return (
            <span className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-brand-primary-subtle text-[9px] font-semibold text-brand-primary-hover">
                  {op?.initials ??
                    row.original.actor
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-text-primary">{row.original.actor}</span>
            </span>
          );
        },
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "border-transparent text-[11px] font-medium",
              ACTION_TONE[row.original.action] ?? "bg-secondary text-text-secondary",
            )}
          >
            {row.original.action}
          </Badge>
        ),
      },
      {
        accessorKey: "target",
        header: "Target",
        cell: ({ row }) => (
          <span className="truncate text-text-secondary">{row.original.target}</span>
        ),
      },
      {
        accessorKey: "outcome",
        header: "Result",
        cell: ({ row }) => (
          <span
            className={cn(
              "text-[12px] font-medium uppercase",
              row.original.outcome === "success"
                ? "text-status-success"
                : "text-status-critical",
            )}
          >
            {row.original.outcome}
          </span>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "IP",
        cell: ({ row }) => (
          <span className="font-mono text-[12px] tabular-nums text-text-tertiary">
            {row.original.ipAddress}
          </span>
        ),
      },
      {
        accessorKey: "sessionId",
        header: "Session",
        cell: ({ row }) => (
          <span className="font-mono text-[11.5px] tabular-nums text-text-tertiary">
            {row.original.sessionId.slice(0, 12)}…
          </span>
        ),
      },
    ],
    [expanded],
  );

  const onExport = () => {
    const header = [
      "timestamp",
      "operator",
      "action",
      "target",
      "outcome",
      "ip",
      "session",
      "description",
    ];
    const lines = filtered.map((e) =>
      [
        e.occurredAt,
        e.actor,
        e.action,
        e.target,
        e.outcome,
        e.ipAddress,
        e.sessionId,
        (e.description ?? "").replace(/"/g, '""'),
      ]
        .map((v) => `"${v}"`)
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    if (typeof window !== "undefined") {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-${tenant.namespaceId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    toast.success("Audit log exported", {
      description: `${filtered.length} events written to audit-${tenant.namespaceId}.csv`,
    });
  };

  return (
    <div className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, target, description…"
            className="h-9 pl-8"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-9 w-[180px]" size="sm">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actionTypes.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={operatorFilter} onValueChange={setOperatorFilter}>
          <SelectTrigger className="h-9 w-[180px]" size="sm">
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All operators</SelectItem>
            {operatorNames.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-[12px] text-text-tertiary tabular-nums">
          {filtered.length} of {events.length}
        </span>
        <Button variant="outline" className="gap-2 border-border-default" onClick={onExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <DataTable<DetailedAuditEvent>
        data={filtered}
        columns={columns}
        rowHeight="compact"
        onRowClick={(e) => toggleExpand(e.id)}
        isExpanded={(e) => expanded.has(e.id)}
        expandedContent={(e) => (
          <div className="grid grid-cols-1 gap-3 text-[12.5px] md:grid-cols-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Description
              </div>
              <div className="mt-1 text-text-primary">{e.description ?? "—"}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                User Agent
              </div>
              <div className="mt-1 truncate font-mono text-[11.5px] text-text-secondary">
                {e.userAgent}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Geo
              </div>
              <div className="mt-1 text-text-primary">{e.geo}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Session
              </div>
              <div className="mt-1 font-mono text-[12px] text-text-secondary">
                {e.sessionId}
              </div>
            </div>
            {e.before && e.after ? (
              <div className="md:col-span-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                  Diff
                </div>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-status-critical/40 bg-status-critical-subtle p-2">
                    <div className="text-[10px] font-semibold uppercase text-status-critical">
                      Before
                    </div>
                    {Object.entries(e.before).map(([k, v]) => (
                      <div key={k} className="font-mono text-[12px] text-text-primary">
                        {k}: {v}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-md border border-status-success/40 bg-status-success-subtle p-2">
                    <div className="text-[10px] font-semibold uppercase text-status-success">
                      After
                    </div>
                    {Object.entries(e.after).map(([k, v]) => (
                      <div key={k} className="font-mono text-[12px] text-text-primary">
                        {k}: {v}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      />
    </div>
  );
}
