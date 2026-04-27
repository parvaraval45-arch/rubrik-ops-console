"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { AlertDetailSheet } from "./alert-detail-sheet";
import type { Alert, Tenant } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardAlertRow {
  alert: Alert;
  tenant: Tenant | null;
  title: string;
  relativeLabel: string;
}

const SEVERITY_DOT: Record<Alert["severity"], string> = {
  critical: "bg-status-critical",
  warning: "bg-status-warning",
  info: "bg-status-info",
};

function alertTabFor(category: Alert["category"]): string {
  switch (category) {
    case "Backup Failure":
      return "jobs";
    case "Capacity":
      return "capacity";
    case "Threat":
      return "security";
    case "Compliance":
      return "policies";
    case "Policy Drift":
      return "policies";
    case "Configuration":
    default:
      return "alarms";
  }
}

export function TopAlertsList({ rows }: { rows: DashboardAlertRow[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = rows.find((r) => r.alert.id === activeId) ?? null;

  return (
    <>
      <div className="flex items-center justify-between border-b border-border-subtle px-5 pb-3 pt-4">
        <h2 className="text-[14px] font-semibold text-text-primary">Top Alerts</h2>
        <Link
          href="/security"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-primary-hover hover:underline"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="flex flex-col">
        {rows.length === 0 ? (
          <li className="px-5 py-10 text-center text-[13px] text-text-tertiary">
            No alerts. Run posture check to verify the latest state.
          </li>
        ) : (
          rows.map((row) => (
            <li key={row.alert.id} className="border-b border-border-subtle last:border-0">
              <button
                type="button"
                onClick={() => setActiveId(row.alert.id)}
                className={cn(
                  "group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors",
                  "hover:bg-secondary/50",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    SEVERITY_DOT[row.alert.severity],
                  )}
                  aria-hidden
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-semibold text-text-primary">
                      {row.title}
                    </span>
                    <span className="text-[11px] text-text-tertiary">·</span>
                    {row.tenant ? (
                      <Link
                        href={`/tenants/${row.tenant.id}?tab=${alertTabFor(row.alert.category)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="truncate text-[13px] text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
                      >
                        {row.tenant.name}
                      </Link>
                    ) : (
                      <span className="truncate text-[13px] text-text-secondary">
                        Unknown tenant
                      </span>
                    )}
                  </div>
                  <span className="truncate text-[12px] text-text-tertiary">
                    {row.alert.description}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-text-tertiary">
                  {row.relativeLabel}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-transparent transition-colors group-hover:text-text-tertiary" />
              </button>
            </li>
          ))
        )}
      </ul>
      <AlertDetailSheet
        alert={active?.alert ?? null}
        tenant={active?.tenant ?? null}
        open={active !== null}
        onOpenChange={(o) => {
          if (!o) setActiveId(null);
        }}
      />
    </>
  );
}
