"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/data/data-table";
import { useConsoleStore } from "@/lib/store";
import { mockData, currentOperator } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { AlertSeverity, ThreatDetection, ThreatEventStatus } from "@/types";

const FILTERS = ["All", "Critical", "Investigating", "Contained", "Resolved"] as const;
type FilterKey = (typeof FILTERS)[number];

const SEVERITY_BADGE: Record<AlertSeverity, string> = {
  critical: "bg-status-critical-subtle text-status-critical",
  warning: "bg-status-warning-subtle text-status-warning",
  info: "bg-secondary text-text-secondary",
};

const STATUS_BADGE: Record<ThreatEventStatus, string> = {
  Investigating: "bg-status-warning-subtle text-status-warning",
  Contained: "bg-status-info-subtle text-status-info",
  Resolved: "bg-status-success-subtle text-status-success",
  "False Positive": "bg-secondary text-text-secondary",
};

export function ThreatDetectionsTable() {
  const threats = useConsoleStore((s) => s.securityThreats);
  const updateStatus = useConsoleStore((s) => s.updateThreatStatus);
  const tenants = useConsoleStore((s) => s.tenants);
  const [filter, setFilter] = useState<FilterKey>("All");

  const tenantById = useMemo(() => {
    const map = new Map<string, string>();
    tenants.forEach((t) => map.set(t.id, t.name));
    return map;
  }, [tenants]);

  const filtered = useMemo(() => {
    return threats.filter((t) => {
      if (filter === "All") return true;
      if (filter === "Critical") return t.severity === "critical";
      return t.status === (filter as ThreatEventStatus);
    });
  }, [threats, filter]);

  const recent24h = threats.length;
  const active = threats.filter((t) => t.status === "Investigating" || t.status === "Contained").length;
  const resolved = threats.filter((t) => t.status === "Resolved").length;

  const columns: ColumnDef<ThreatDetection>[] = useMemo(
    () => [
      {
        accessorKey: "detectedAt",
        header: "Time",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-secondary" suppressHydrationWarning>
            {format(parseISO(row.original.detectedAt), "MMM d HH:mm")}
          </span>
        ),
      },
      {
        accessorKey: "tenantId",
        header: "Tenant",
        cell: ({ row }) => (
          <span className="truncate text-text-primary">
            {tenantById.get(row.original.tenantId) ?? row.original.tenantId}
          </span>
        ),
      },
      {
        accessorKey: "detectionType",
        header: "Detection Type",
        cell: ({ row }) => (
          <span className="text-text-primary">{row.original.detectionType}</span>
        ),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "border-transparent text-[10.5px] uppercase",
              SEVERITY_BADGE[row.original.severity],
            )}
          >
            {row.original.severity}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span data-stop-row-click="true">
            <StatusPicker
              status={row.original.status}
              onChange={(next, note) =>
                updateStatus(row.original.id, next, currentOperator.name, note)
              }
            />
          </span>
        ),
      },
      {
        accessorKey: "analyst",
        header: "Analyst",
        cell: ({ row }) => (
          <span className="flex items-center gap-2 text-text-primary">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-brand-primary-subtle text-[9px] font-semibold text-brand-primary-hover">
                {row.original.analyst
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {row.original.analyst}
          </span>
        ),
      },
      {
        id: "actions",
        size: 40,
        header: () => <span className="sr-only">Actions</span>,
        cell: () => (
          <span data-stop-row-click="true">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-[10.5px] font-semibold uppercase text-text-tertiary">
                  Reassign analyst
                </DropdownMenuLabel>
                {mockData.operators.map((op) => (
                  <DropdownMenuItem
                    key={op.id}
                    onSelect={() =>
                      toast.success(`Threat reassigned to ${op.name}`)
                    }
                  >
                    {op.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        ),
        enableSorting: false,
      },
    ],
    [tenantById, updateStatus],
  );

  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div>
          <h2 className="text-[14px] font-semibold text-text-primary">
            Threat Detections
          </h2>
          <p className="mt-0.5 text-[12px] text-text-secondary">
            {recent24h} events · {active} active · {resolved} resolved (last 24 hours)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "h-7 rounded-full px-3 text-[11px] font-medium transition-colors",
                filter === f
                  ? "bg-brand-primary-subtle text-brand-primary-hover"
                  : "text-text-secondary hover:bg-secondary",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <DataTable<ThreatDetection> data={filtered} columns={columns} rowHeight="compact" />
    </section>
  );
}

function StatusPicker({
  status,
  onChange,
}: {
  status: ThreatEventStatus;
  onChange: (next: ThreatEventStatus, note: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ThreatEventStatus | null>(null);
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const error =
    touched && note.trim().length < 6
      ? "Note must be at least 6 characters."
      : null;

  const options: ThreatEventStatus[] = ["Investigating", "Contained", "Resolved", "False Positive"];

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setPending(null); setNote(""); setTouched(false); } }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase transition-colors",
            STATUS_BADGE[status],
          )}
        >
          {status}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-3">
        {!pending ? (
          <>
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Update status
            </div>
            <ul className="mt-2 flex flex-col gap-1">
              {options
                .filter((o) => o !== status)
                .map((o) => (
                  <li key={o}>
                    <button
                      type="button"
                      onClick={() => setPending(o)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-secondary"
                    >
                      <span>{o}</span>
                      <span className="text-text-tertiary">→</span>
                    </button>
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Label className="text-[12px] font-medium text-text-primary">
              Status note ({status} → {pending})
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => setTouched(true)}
              rows={3}
              className={error ? "border-status-critical" : ""}
            />
            {error ? (
              <span className="text-[11.5px] text-status-critical">{error}</span>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPending(null);
                  setNote("");
                  setTouched(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-brand-primary text-white hover:bg-brand-primary-hover"
                onClick={() => {
                  if (note.trim().length < 6) {
                    setTouched(true);
                    return;
                  }
                  onChange(pending, note.trim());
                  toast.success(`Status updated: ${pending}`);
                  setOpen(false);
                  setPending(null);
                  setNote("");
                  setTouched(false);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
