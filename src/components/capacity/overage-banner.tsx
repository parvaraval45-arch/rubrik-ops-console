"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BillingLineItem } from "@/types";

interface OverageBannerProps {
  rows: BillingLineItem[];
  onTenantClick: (id: string) => void;
  onViewAll: () => void;
}

export function OverageBanner({ rows, onTenantClick, onViewAll }: OverageBannerProps) {
  const flagged = rows.filter((r) => r.utilizationPct >= 90);
  if (flagged.length === 0) return null;
  return (
    <div className="flex flex-wrap items-start gap-3 rounded-md border border-l-4 border-status-warning/30 border-l-status-warning bg-status-warning-subtle px-4 py-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" />
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-status-warning">
          {flagged.length} tenants exceed 90% of committed capacity
        </div>
        <div className="mt-0.5 text-[12px] text-text-secondary">
          {flagged.map((row, i) => (
            <span key={row.id}>
              <button
                type="button"
                onClick={() => onTenantClick(row.id)}
                className={cn(
                  "font-medium text-text-primary hover:text-status-warning hover:underline",
                  row.utilizationPct >= 100 && "text-status-critical",
                )}
              >
                {row.tenantName} ({row.utilizationPct}%)
              </button>
              {i < flagged.length - 1 ? <span>, </span> : null}
            </span>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-status-warning hover:bg-status-warning/10"
        onClick={onViewAll}
      >
        View All →
      </Button>
    </div>
  );
}
