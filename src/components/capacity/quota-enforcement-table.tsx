"use client";

import Link from "next/link";
import { AlertOctagon, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConsoleStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { QuotaEnforcementRow } from "@/types";

const STATUS_BADGE: Record<QuotaEnforcementRow["status"], { cls: string; icon: typeof AlertOctagon }> = {
  "Hard Breach": { cls: "bg-status-critical-subtle text-status-critical", icon: AlertOctagon },
  "Soft Breach": { cls: "bg-status-warning-subtle text-status-warning", icon: AlertTriangle },
  "Approaching Hard": { cls: "bg-status-warning-subtle text-status-warning", icon: AlertTriangle },
  "Approaching Soft": { cls: "bg-status-info-subtle text-status-info", icon: ShieldCheck },
};

const BEHAVIOR_BADGE: Record<QuotaEnforcementRow["hardLimitBehavior"], string> = {
  Block: "bg-status-critical-subtle text-status-critical",
  Notify: "bg-status-warning-subtle text-status-warning",
  "Auto-Upgrade": "bg-status-info-subtle text-status-info",
};

export function QuotaEnforcementTable() {
  const rows = useConsoleStore((s) => s.quotaEnforcement);

  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="border-b border-border-subtle px-5 py-4">
        <h2 className="text-[14px] font-semibold text-text-primary">
          Active Quota Enforcement
        </h2>
        <p className="mt-0.5 text-[12px] text-text-secondary">
          Real-time quota status across all tenants. Blocks and notifications
          fire automatically.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle">
            <TableHead className="px-5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Tenant
            </TableHead>
            <TableHead className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Quota Type
            </TableHead>
            <TableHead className="text-right text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Current
            </TableHead>
            <TableHead className="text-right text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Soft (80%)
            </TableHead>
            <TableHead className="text-right text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Hard (100%)
            </TableHead>
            <TableHead className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Hard Behavior
            </TableHead>
            <TableHead className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Status
            </TableHead>
            <TableHead className="px-5 text-right text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const Status = STATUS_BADGE[r.status];
            const StatusIcon = Status.icon;
            return (
              <TableRow key={r.id} className="border-border-subtle text-[13px] hover:bg-secondary/40">
                <TableCell className="px-5 text-text-primary">{r.tenantName}</TableCell>
                <TableCell className="text-text-secondary">{r.quotaType}</TableCell>
                <TableCell className="text-right tabular-nums text-text-primary">
                  {r.currentUsage}
                </TableCell>
                <TableCell className="text-right tabular-nums text-text-secondary">
                  {r.softLimit}
                </TableCell>
                <TableCell className="text-right tabular-nums text-text-secondary">
                  {r.hardLimit}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent text-[10.5px] uppercase",
                      BEHAVIOR_BADGE[r.hardLimitBehavior],
                    )}
                  >
                    {r.hardLimitBehavior}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                      Status.cls,
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {r.detail}
                  </span>
                </TableCell>
                <TableCell className="px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-brand-primary-hover"
                      onClick={() =>
                        toast("Quota increased", {
                          description: `${r.tenantName} hard limit raised by 20%. Audit logged.`,
                        })
                      }
                    >
                      Increase Quota
                    </Button>
                    {r.hardLimitBehavior === "Block" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7"
                        onClick={() =>
                          toast.success("Override granted", {
                            description: `${r.tenantName} unblocked for next 24 hours. Approval logged.`,
                          })
                        }
                      >
                        Override Block
                      </Button>
                    ) : null}
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="h-7 text-text-secondary"
                    >
                      <Link href={`/tenants/${r.tenantId}`}>View Tenant</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
