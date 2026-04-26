"use client";

import { format, parseISO } from "date-fns";
import { Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { mockData } from "@/lib/mock-data";
import type { AuditEvent } from "@/types";

const ACTION_LABEL: Record<string, string> = {
  "user.invite": "User Invite",
  "tenant.create": "Tenant Created",
  "tenant.suspend": "Tenant Suspended",
  "policy.update": "Policy Change",
  "policy.create": "Policy Created",
  "key.rotate": "API Key",
  "isolation.remediate": "Isolation Remediation",
  "report.export": "Report Export",
  "alert.acknowledge": "Login",
  "snapshot.restore": "Snapshot Restore",
};

const ACTION_TONE: Record<string, string> = {
  "user.invite": "bg-status-info-subtle text-status-info",
  "tenant.create": "bg-status-success-subtle text-status-success",
  "tenant.suspend": "bg-status-warning-subtle text-status-warning",
  "policy.update": "bg-status-warning-subtle text-status-warning",
  "policy.create": "bg-status-success-subtle text-status-success",
  "key.rotate": "bg-status-critical-subtle text-status-critical",
  "isolation.remediate": "bg-brand-primary-subtle text-brand-primary-hover",
  "report.export": "bg-secondary text-text-secondary",
  "alert.acknowledge": "bg-secondary text-text-secondary",
  "snapshot.restore": "bg-status-info-subtle text-status-info",
};

function operatorInitials(name: string) {
  const op = mockData.operators.find((o) => o.name === name);
  if (op) return op.initials;
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function RecentActivity({ events }: { events: AuditEvent[] }) {
  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
        <h2 className="text-[14px] font-semibold text-text-primary">Recent Activity</h2>
        <span className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
          Last 30 days
        </span>
      </div>
      <div className="max-h-[320px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-surface">
            <TableRow className="border-border-subtle">
              <TableHead className="px-5 text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Time
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Tenant
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Action
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Operator
              </TableHead>
              <TableHead className="px-5 text-right text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((e) => (
              <TableRow
                key={e.id}
                className="border-border-subtle text-[13px] hover:bg-secondary/40"
              >
                <TableCell
                  className="px-5 tabular-nums text-text-secondary"
                  suppressHydrationWarning
                >
                  {format(parseISO(e.occurredAt), "MMM d · HH:mm")}
                </TableCell>
                <TableCell className="text-text-primary">
                  {e.target}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent text-[11px] font-medium",
                      ACTION_TONE[e.action] ?? "bg-secondary text-text-secondary",
                    )}
                  >
                    {ACTION_LABEL[e.action] ?? e.action}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2 text-text-primary">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-brand-primary-subtle text-[9px] font-semibold text-brand-primary-hover">
                        {operatorInitials(e.actor)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{e.actor}</span>
                  </span>
                </TableCell>
                <TableCell className="px-5 text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-status-success-subtle px-2 py-0.5 text-[11px] font-medium text-status-success">
                    <Check className="h-3 w-3" />
                    Completed
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
