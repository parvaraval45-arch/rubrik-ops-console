"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  FileDown,
  Flag,
  MoreHorizontal,
  Pencil,
  Search,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/data/data-table";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import { formatCurrency, formatPercent, formatTB } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { DisputeDialog } from "./dispute-dialog";
import { billingTotals } from "./billing-kpis";
import type { BillingLineItem, BillingStatus, Tier } from "@/types";

const STATUS_PILL: Record<BillingStatus, string> = {
  Draft: "bg-secondary text-text-secondary",
  Approved: "bg-status-info-subtle text-status-info",
  Invoiced: "bg-status-warning-subtle text-status-warning",
  Paid: "bg-status-success-subtle text-status-success",
  Disputed: "bg-status-critical-subtle text-status-critical",
};

const TIER_BADGE: Record<Tier, string> = {
  Platinum: "bg-slate-900 text-white",
  Gold: "bg-amber-100 text-amber-900",
  Silver: "bg-slate-200 text-slate-700",
  Bronze: "bg-orange-100 text-orange-900",
};

const FILTER_KEYS = ["All", "Draft", "Approved", "Invoiced", "Paid", "Disputed"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

type SortKey = "name" | "charge" | "overage" | "status";

interface BillingTableProps {
  filterStatus?: FilterKey;
  filterOverage?: boolean;
  onRowClick: (lineItem: BillingLineItem) => void;
}

export function BillingTable({
  filterStatus,
  filterOverage,
  onRowClick,
}: BillingTableProps) {
  const lineItems = useConsoleStore((s) => s.billingLineItems);
  const approveLineItems = useConsoleStore((s) => s.approveLineItems);
  const periodStatus = useConsoleStore((s) => s.billingPeriod.status);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>(filterStatus ?? "All");
  const [overageOnly, setOverageOnly] = useState<boolean>(!!filterOverage);
  const [sort, setSort] = useState<SortKey>("charge");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [approveOpen, setApproveOpen] = useState(false);
  const [disputeTarget, setDisputeTarget] = useState<BillingLineItem | null>(null);

  // Sync external filters
  if (filterStatus && filterStatus !== filter) {
    setFilter(filterStatus);
  }
  if (filterOverage !== undefined && filterOverage !== overageOnly) {
    setOverageOnly(filterOverage);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = lineItems;
    if (filter !== "All") arr = arr.filter((li) => li.status === filter);
    if (overageOnly) arr = arr.filter((li) => li.utilizationPct >= 90);
    if (q) arr = arr.filter((li) => li.tenantName.toLowerCase().includes(q));
    if (sort === "name") arr = [...arr].sort((a, b) => a.tenantName.localeCompare(b.tenantName));
    else if (sort === "charge") arr = [...arr].sort((a, b) => b.totalCharge - a.totalCharge);
    else if (sort === "overage") arr = [...arr].sort((a, b) => b.utilizationPct - a.utilizationPct);
    else arr = [...arr].sort((a, b) => a.status.localeCompare(b.status));
    return arr;
  }, [lineItems, search, filter, overageOnly, sort]);

  const totals = billingTotals(filtered);
  const counts: Record<FilterKey, number> = {
    All: lineItems.length,
    Draft: lineItems.filter((li) => li.status === "Draft").length,
    Approved: lineItems.filter((li) => li.status === "Approved").length,
    Invoiced: lineItems.filter((li) => li.status === "Invoiced").length,
    Paid: lineItems.filter((li) => li.status === "Paid").length,
    Disputed: lineItems.filter((li) => li.status === "Disputed").length,
  };

  const selectedItems = filtered.filter((li) => selected.has(li.id));
  const selectedDraftItems = selectedItems.filter((li) => li.status === "Draft");
  const selectedDraftTotal = selectedDraftItems.reduce((s, li) => s + li.totalCharge, 0);

  const toggleRow = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((li) => selected.has(li.id));

  const columns: ColumnDef<BillingLineItem>[] = useMemo(
    () => [
      {
        id: "select",
        size: 36,
        header: () => (
          <Checkbox
            checked={allFilteredSelected}
            onCheckedChange={(v) => {
              if (v) setSelected(new Set(filtered.map((li) => li.id)));
              else setSelected(new Set());
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <span data-stop-row-click="true">
            <Checkbox
              checked={selected.has(row.original.id)}
              onCheckedChange={() => toggleRow(row.original.id)}
              aria-label={`Select ${row.original.tenantName}`}
            />
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "tenantName",
        header: "Tenant",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-text-primary">{row.original.tenantName}</span>
            <span className="text-[11px] text-text-tertiary">{row.original.industry}</span>
          </div>
        ),
      },
      {
        accessorKey: "tier",
        header: "Tier",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "border-transparent text-[10.5px] font-semibold uppercase",
              TIER_BADGE[row.original.tier],
            )}
          >
            {row.original.tier}
          </Badge>
        ),
      },
      {
        accessorKey: "committedTB",
        header: "Committed",
        cell: ({ row }) => (
          <span className="text-right tabular-nums text-text-secondary">
            {formatTB(row.original.committedTB)}
          </span>
        ),
      },
      {
        accessorKey: "usedTB",
        header: "Used",
        cell: ({ row }) => (
          <span
            className={cn(
              "text-right tabular-nums",
              row.original.usedTB > row.original.committedTB
                ? "text-status-critical font-medium"
                : "text-text-primary",
            )}
          >
            {formatTB(row.original.usedTB)}
          </span>
        ),
      },
      {
        accessorKey: "overageTB",
        header: "Overage",
        cell: ({ row }) =>
          row.original.overageTB > 0 ? (
            <span className="text-right tabular-nums font-medium text-status-critical">
              +{row.original.overageTB} TB
            </span>
          ) : (
            <span className="text-right text-text-tertiary">—</span>
          ),
      },
      {
        accessorKey: "utilizationPct",
        header: "Utilization",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span
                className={cn(
                  "tabular-nums",
                  row.original.utilizationPct >= 100
                    ? "text-status-critical"
                    : row.original.utilizationPct >= 80
                      ? "text-status-warning"
                      : "text-text-secondary",
                )}
              >
                {formatPercent(row.original.utilizationPct, 0)}
              </span>
            </div>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full",
                  row.original.utilizationPct >= 100
                    ? "bg-status-critical"
                    : row.original.utilizationPct >= 95
                      ? "bg-status-warning"
                      : row.original.utilizationPct >= 80
                        ? "bg-status-warning"
                        : "bg-brand-primary",
                )}
                style={{ width: `${Math.min(100, row.original.utilizationPct)}%` }}
              />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "ratePerTB",
        header: "$/TB",
        cell: ({ row }) => (
          <span className="text-right tabular-nums text-text-secondary">
            ${row.original.ratePerTB}
          </span>
        ),
      },
      {
        accessorKey: "totalCharge",
        header: "Period Charge",
        cell: ({ row }) => (
          <span className="text-right text-[13.5px] font-semibold tabular-nums text-text-primary">
            {formatCurrency(row.original.totalCharge)}
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
              "border-transparent text-[10.5px] font-medium uppercase",
              STATUS_PILL[row.original.status],
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
                <DropdownMenuItem onSelect={() => onRowClick(row.original)} className="gap-2">
                  <FileDown className="h-3.5 w-3.5" />
                  View Breakdown
                </DropdownMenuItem>
                {row.original.status === "Draft" ? (
                  <DropdownMenuItem
                    onSelect={() =>
                      toast("Adjustment", {
                        description: "Manual adjustments land in Phase 1 polish.",
                      })
                    }
                    className="gap-2"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Adjust Line Item
                  </DropdownMenuItem>
                ) : null}
                {row.original.status !== "Paid" && row.original.status !== "Disputed" ? (
                  <DropdownMenuItem
                    onSelect={() => setDisputeTarget(row.original)}
                    className="gap-2 text-status-critical focus:bg-status-critical-subtle focus:text-status-critical"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Mark as Disputed
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onSelect={() =>
                    toast.success("Exported as PDF", {
                      description: `Saved as ${row.original.tenantName.toLowerCase().replace(/\s+/g, "-")}-april-2026.pdf`,
                    })
                  }
                  className="gap-2"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Export as PDF
                </DropdownMenuItem>
                {row.original.status === "Invoiced" || row.original.status === "Paid" ? (
                  <DropdownMenuItem
                    onSelect={() =>
                      toast("Invoice resent", {
                        description: `Sent to ${row.original.tenantName} billing contact.`,
                      })
                    }
                    className="gap-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Resend Invoice
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        ),
        enableSorting: false,
      },
    ],
    [allFilteredSelected, filtered, selected, onRowClick],
  );

  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div>
          <h2 className="text-[14px] font-semibold text-text-primary">
            Tenant Charges — April 2026
          </h2>
          <p className="mt-0.5 text-[12px] text-text-secondary tabular-nums">
            {lineItems.length} active tenants · Total {formatCurrency(totals.totalCharge)} ·{" "}
            {totals.overageCount} in overage · {totals.disputedCount} disputed
          </p>
        </div>
        {periodStatus !== "open" ? (
          <Badge
            variant="outline"
            className="border-transparent bg-status-warning-subtle text-[10.5px] uppercase text-status-warning"
          >
            Period Locked · Read-only
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant…"
            className="h-9 pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_KEYS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "h-7 rounded-full px-2.5 text-[11px] font-medium transition-colors",
                filter === f
                  ? "bg-brand-primary-subtle text-brand-primary-hover"
                  : "text-text-secondary hover:bg-secondary",
              )}
            >
              {f} <span className="ml-1 tabular-nums">{counts[f]}</span>
            </button>
          ))}
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-9 w-[180px]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="charge">Sort: Charge (desc)</SelectItem>
            <SelectItem value="overage">Sort: Overage (desc)</SelectItem>
            <SelectItem value="name">Sort: Name</SelectItem>
            <SelectItem value="status">Sort: Status</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-[12px] text-text-tertiary tabular-nums">
          Showing {filtered.length} of {lineItems.length}
        </span>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-secondary/40 px-4 py-2 text-[12.5px]">
          <span className="font-medium text-text-primary">
            {selected.size} {selected.size === 1 ? "tenant" : "tenants"} selected
            {selectedDraftItems.length > 0 ? (
              <span className="ml-2 text-text-tertiary tabular-nums">
                ({selectedDraftItems.length} Draft · {formatCurrency(selectedDraftTotal)})
              </span>
            ) : null}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApproveOpen(true)}
              disabled={selectedDraftItems.length === 0}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.success(`${selected.size} items marked invoiced`, {
                  description: "Invoiced status applied via bulk action.",
                })
              }
            >
              Mark Invoiced
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`${selected.size} PDFs queued for export`)}
            >
              Export Selected as PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSelected(new Set())}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <DataTable<BillingLineItem>
        data={filtered}
        columns={columns}
        onRowClick={onRowClick}
        rowClassName={(row) =>
          row.utilizationPct >= 100
            ? "bg-status-critical-subtle/40"
            : row.utilizationPct >= 95
              ? "bg-status-warning-subtle/30"
              : ""
        }
      />

      <ApproveSelectedDialog
        open={approveOpen}
        items={selectedDraftItems}
        onCancel={() => setApproveOpen(false)}
        onConfirm={(note) => {
          approveLineItems(
            selectedDraftItems.map((li) => li.id),
            currentOperator.name,
            note,
          );
          toast.success(
            `${selectedDraftItems.length} line items approved.`,
            {
              description: `Total ${formatCurrency(selectedDraftTotal)} ready for invoicing.`,
            },
          );
          setSelected(new Set());
          setApproveOpen(false);
        }}
      />

      <DisputeDialog
        lineItem={disputeTarget}
        open={disputeTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDisputeTarget(null);
        }}
      />
    </section>
  );
}

function ApproveSelectedDialog({
  open,
  items,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  items: BillingLineItem[];
  onCancel: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const error =
    touched && note.trim().length < 6
      ? "Approval note must be at least 6 characters."
      : null;
  const total = items.reduce((s, li) => s + li.totalCharge, 0);
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onCancel();
          setNote("");
          setTouched(false);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Approve {items.length} line items totaling {formatCurrency(total)}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Indicates billing operator review is complete. Approved items
            transition to invoiceable state.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label className="text-[12px] font-medium text-text-primary">
            Approval note (visible to finance team)
          </Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={3}
            placeholder="e.g., Q2 review complete; capacity utilization confirmed against tenant statements."
            className={error ? "border-status-critical" : ""}
          />
          {error ? (
            <span className="text-[11.5px] text-status-critical">{error}</span>
          ) : null}
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => {
              if (note.trim().length < 6) {
                setTouched(true);
                return;
              }
              onConfirm(note.trim());
              setNote("");
              setTouched(false);
            }}
          >
            Approve {items.length}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
